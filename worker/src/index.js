const DEFAULT_ALLOWED_ORIGINS = [
  "https://makoban.github.io",
  "http://localhost:4175",
  "http://127.0.0.1:4175",
];

const RESERVATION_START_HOUR = 10;
const RESERVATION_END_HOUR = 18;
const ALLOWED_STORES = ["本店", "高橋店"];

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const reservationId = reservationIdFromPath(url.pathname);
    if (url.pathname !== "/" && url.pathname !== "/reservations" && !reservationId) {
      return jsonResponse({ message: "Not found" }, 404, cors);
    }

    try {
      if (request.method === "GET") {
        if (url.searchParams.get("mine") === "1") {
          return await listMyReservations(request, env, cors);
        }
        return await listReservations(url, env, cors);
      }
      if (request.method === "POST") {
        return await createReservation(request, env, cors);
      }
      if (request.method === "DELETE" && reservationId) {
        return await cancelReservation(request, env, cors, reservationId);
      }
      return jsonResponse({ message: "Method not allowed" }, 405, cors);
    } catch (error) {
      console.error("reservation api error", error);
      return jsonResponse({ message: "予約APIでエラーが発生しました" }, 500, cors);
    }
  },
};

function corsHeaders(request, env) {
  const allowedOrigins = (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowedOrigins.includes("*") || allowedOrigins.includes(origin) ? origin || "*" : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function reservationIdFromPath(pathname) {
  if (!pathname.startsWith("/reservations/")) return "";
  return normalizeText(decodeURIComponent(pathname.slice("/reservations/".length)), 80);
}

async function listReservations(url, env, cors) {
  assertDatabase(env);
  const date = normalizeDate(url.searchParams.get("date"));
  const store = normalizeStore(url.searchParams.get("store"));
  if (!date || !store) {
    return jsonResponse({ message: "date と store が必要です" }, 400, cors);
  }

  const result = await env.DB.prepare(
    `SELECT id, date, store, hour, start_time AS startTime, end_time AS endTime,
            child_name AS childName, guardian_name AS guardianName,
            member_number AS memberNumber, note, created_at AS createdAt
       FROM reservations
      WHERE date = ? AND store = ?
      ORDER BY hour ASC`,
  )
    .bind(date, store)
    .all();

  return jsonResponse({ reservations: result.results || [] }, 200, cors);
}

async function listMyReservations(request, env, cors) {
  assertDatabase(env);
  const lineUserId = await resolveLineUserId({}, env, request, { allowFallback: false, allowTestUser: false });
  if (!lineUserId) {
    return jsonResponse({ message: "LINEログイン情報を確認できませんでした" }, 401, cors);
  }

  const result = await env.DB.prepare(
    `SELECT id, date, store, hour, start_time AS startTime, end_time AS endTime,
            child_name AS childName, guardian_name AS guardianName,
            member_number AS memberNumber, note, created_at AS createdAt
       FROM reservations
      WHERE line_user_id = ?
      ORDER BY date ASC, hour ASC
      LIMIT 20`,
  )
    .bind(lineUserId)
    .all();

  return jsonResponse({ reservations: result.results || [] }, 200, cors);
}

async function createReservation(request, env, cors) {
  assertDatabase(env);
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ message: "予約内容をJSONで送信してください" }, 400, cors);
  }

  const reservation = normalizeReservation(payload);
  const validationError = validateReservation(reservation);
  if (validationError) {
    return jsonResponse({ message: validationError }, 400, cors);
  }

  if (!env.LINE_CHANNEL_ACCESS_TOKEN) {
    return jsonResponse({ message: "LINE送信用トークンが設定されていません" }, 500, cors);
  }

  const lineUserId = await resolveLineUserId(payload, env, request);
  if (!lineUserId) {
    return jsonResponse(
      { message: "LINEログイン情報を確認できませんでした。LINEアプリのリッチメニューから予約画面を開き直してください。" },
      401,
      cors,
    );
  }

  const storedReservation = {
    ...reservation,
    lineUserId,
    createdAt: new Date().toISOString(),
  };

  try {
    await env.DB.prepare(
      `INSERT INTO reservations (
         id, date, store, hour, start_time, end_time, child_name, guardian_name,
         member_number, note, line_user_id, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        storedReservation.id,
        storedReservation.date,
        storedReservation.store,
        storedReservation.hour,
        storedReservation.startTime,
        storedReservation.endTime,
        storedReservation.childName,
        storedReservation.guardianName,
        storedReservation.memberNumber,
        storedReservation.note,
        storedReservation.lineUserId,
        storedReservation.createdAt,
      )
      .run();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return jsonResponse({ message: "この時間は先に予約済みになりました" }, 409, cors);
    }
    throw error;
  }

  const lineResult = await pushReservationMessage(env, storedReservation);
  if (!lineResult.sent) {
    await deleteReservation(env, storedReservation.id);
    return jsonResponse(
      {
        message:
          "LINE通知を送れなかったため予約を確定していません。勇吉屋公式アカウントを友だち追加した状態で、LINE内の予約画面からもう一度お試しください。",
        lineMessageError: lineResult.error || null,
      },
      502,
      cors,
    );
  }

  console.log("reservation confirmed and line push sent", {
    id: storedReservation.id,
    date: storedReservation.date,
    store: storedReservation.store,
    hour: storedReservation.hour,
    hasLineUserId: Boolean(storedReservation.lineUserId),
  });

  return jsonResponse(
    {
      reservation: publicReservation(storedReservation),
      lineMessageSent: true,
      lineMessageError: null,
    },
    201,
    cors,
  );
}

async function cancelReservation(request, env, cors, reservationId) {
  assertDatabase(env);
  const lineUserId = await resolveLineUserId({}, env, request, { allowFallback: false, allowTestUser: false });
  if (!lineUserId) {
    return jsonResponse({ message: "LINEログイン情報を確認できませんでした" }, 401, cors);
  }

  const existing = await env.DB.prepare(
    `SELECT id, date, store, hour, start_time AS startTime, end_time AS endTime,
            child_name AS childName, guardian_name AS guardianName,
            member_number AS memberNumber, note, line_user_id AS lineUserId, created_at AS createdAt
       FROM reservations
      WHERE id = ?`,
  )
    .bind(reservationId)
    .first();

  if (!existing) {
    return jsonResponse({ message: "予約が見つかりません" }, 404, cors);
  }
  if (existing.lineUserId !== lineUserId) {
    return jsonResponse({ message: "この予約はキャンセルできません" }, 403, cors);
  }

  await env.DB.prepare("DELETE FROM reservations WHERE id = ? AND line_user_id = ?").bind(reservationId, lineUserId).run();
  console.log("reservation cancelled", {
    id: existing.id,
    date: existing.date,
    store: existing.store,
    hour: existing.hour,
  });

  return jsonResponse({ cancelled: true, reservation: publicReservation(existing) }, 200, cors);
}

function assertDatabase(env) {
  if (!env.DB) {
    throw new Error("D1 database binding DB is required.");
  }
}

async function deleteReservation(env, id) {
  try {
    await env.DB.prepare("DELETE FROM reservations WHERE id = ?").bind(id).run();
  } catch (error) {
    console.error("reservation rollback failed", error);
  }
}

function normalizeReservation(payload) {
  const hour = Number(payload.hour);
  return {
    id: normalizeText(payload.id) || `YK-M-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    date: normalizeDate(payload.date),
    store: normalizeStore(payload.store),
    hour,
    startTime: normalizeText(payload.startTime) || `${String(hour).padStart(2, "0")}:00`,
    endTime: normalizeText(payload.endTime) || `${String(hour + 1).padStart(2, "0")}:00`,
    childName: normalizeText(payload.childName),
    guardianName: normalizeText(payload.guardianName),
    memberNumber: normalizeText(payload.memberNumber),
    note: normalizeText(payload.note, 500),
  };
}

function validateReservation(reservation) {
  if (!reservation.date) return "予約日が正しくありません";
  if (!reservation.store) return "店舗が正しくありません";
  if (!Number.isInteger(reservation.hour) || reservation.hour < RESERVATION_START_HOUR || reservation.hour >= RESERVATION_END_HOUR) {
    return "予約時間が正しくありません";
  }
  if (!reservation.childName) return "対象者が必要です";
  if (!reservation.guardianName) return "保護者名が必要です";
  if (!reservation.memberNumber) return "会員番号が必要です";
  return "";
}

function normalizeText(value, maxLength = 120) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeDate(value) {
  const text = normalizeText(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function normalizeStore(value) {
  const store = normalizeText(value, 30);
  return ALLOWED_STORES.includes(store) ? store : "";
}

function isUniqueConstraintError(error) {
  const message = String(error?.message || error || "");
  return message.includes("UNIQUE") || message.includes("constraint");
}

async function resolveLineUserId(payload, env, request = null, options = {}) {
  const { allowFallback = true, allowTestUser = true } = options;
  const authorization = request?.headers?.get("Authorization") || "";
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const accessToken = normalizeText(payload.lineAccessToken || bearerToken, 2048);
  if (accessToken) {
    const response = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      const profile = await response.json();
      if (typeof profile.userId === "string" && profile.userId.startsWith("U")) {
        return profile.userId;
      }
    }
  }

  if (!allowFallback) {
    return "";
  }

  const fallbackUserId = normalizeText(payload.lineUserId, 128);
  if (fallbackUserId.startsWith("U")) {
    return fallbackUserId;
  }

  if (allowTestUser && env.YUUKICHIYA_TEST_LINE_USER_ID) {
    return env.YUUKICHIYA_TEST_LINE_USER_ID;
  }

  return "";
}

async function pushReservationMessage(env, reservation) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) {
    return { sent: false, error: "LINE_CHANNEL_ACCESS_TOKEN is not set" };
  }
  if (!reservation.lineUserId) {
    return { sent: false, error: "LINE user ID is missing" };
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: reservation.lineUserId,
      messages: [buildReservationFlexMessage(env, reservation)],
    }),
  });

  if (response.ok) {
    return { sent: true };
  }

  const text = await response.text();
  console.error("line push failed", response.status, text);
  return { sent: false, error: `LINE push failed: ${response.status}` };
}

function publicReservation(reservation) {
  const { lineUserId, ...publicFields } = reservation;
  return publicFields;
}

function reservationDateTimeText(reservation) {
  return `${formatDateJa(reservation.date)} ${timeRangeLabel(reservation.hour)}`;
}

function formatDateJa(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  if (!Number.isFinite(date.getTime())) return value;
  return `${year}年${month}月${day}日（${weekdays[date.getDay()]}）`;
}

function timeRangeLabel(hour) {
  return `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`;
}

function reservationDisplayRows(reservation) {
  const rows = [
    ["受付番号", reservation.id],
    ["店舗", reservation.store],
    ["対象", reservation.childName],
    ["保護者", reservation.guardianName],
    ["会員番号", reservation.memberNumber],
  ];
  if (reservation.note) rows.push(["メモ", reservation.note]);
  return rows.filter(([, value]) => value);
}

function reservationStatusUrl(env, reservation) {
  const targetUrl =
    env.PUBLIC_RESERVATION_URL ||
    "https://liff.line.me/2010371637-PcIXzbgC/?screen=reservation&v=20260613-liff-login-fix";
  try {
    const url = new URL(targetUrl);
    url.searchParams.set("reservationId", reservation.id);
    return url.toString();
  } catch (error) {
    return targetUrl;
  }
}

function flexRow(label, value) {
  return {
    type: "box",
    layout: "baseline",
    spacing: "sm",
    contents: [
      { type: "text", text: label, color: "#667085", size: "sm", flex: 2 },
      {
        type: "text",
        text: String(value),
        color: "#152033",
        size: "sm",
        weight: "bold",
        wrap: true,
        flex: 5,
      },
    ],
  };
}

function buildReservationFlexMessage(env, reservation) {
  const dateTime = reservationDateTimeText(reservation);
  return {
    type: "flex",
    altText: `採寸予約が確定しました。${dateTime}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#06a944",
        paddingAll: "16px",
        contents: [
          { type: "text", text: "勇吉屋 採寸予約", color: "#ffffff", size: "sm", weight: "bold" },
          { type: "text", text: "予約確定しました", color: "#ffffff", size: "xl", weight: "bold", margin: "sm" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "18px",
        contents: [
          { type: "text", text: dateTime, color: "#027a34", size: "md", weight: "bold", wrap: true },
          { type: "separator", margin: "lg" },
          ...reservationDisplayRows(reservation).map(([label, value]) => flexRow(label, value)),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "16px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#06a944",
            action: {
              type: "uri",
              label: "予約状況確認",
              uri: reservationStatusUrl(env, reservation),
            },
          },
        ],
      },
    },
  };
}
