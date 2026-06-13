const DEFAULT_ALLOWED_ORIGINS = [
  "https://makoban.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:4174",
  "http://127.0.0.1:4174",
  "http://localhost:4175",
  "http://127.0.0.1:4175",
];

const RESERVATION_START_HOUR = 10;
const RESERVATION_END_HOUR = 18;
const ALLOWED_STORES = ["本店", "高橋店"];
const DEFAULT_POINT_STAFF_TOKEN = "demo-yuk001234";
const SEED_POINT_MEMBER = {
  memberNumber: "YK-001234",
  representativeName: "山田 由美",
  currentPoints: 1250,
  createdAt: "2026-06-12T00:30:55.733Z",
};
const SEED_POINT_TRANSACTIONS = [
  {
    id: "demo-point-yamada-001",
    memberNumber: "YK-001234",
    delta: 450,
    reason: "学生服購入",
    staffName: "本店",
    memo: "中学夏制服 上下セット",
    balanceAfter: 1250,
    createdAt: "2026-06-08T05:20:00.000Z",
  },
  {
    id: "demo-point-yamada-002",
    memberNumber: "YK-001234",
    delta: -100,
    reason: "補正サービス利用",
    staffName: "本店",
    memo: "袖丈補正サービス",
    balanceAfter: 800,
    createdAt: "2026-05-28T07:05:00.000Z",
  },
  {
    id: "demo-point-yamada-003",
    memberNumber: "YK-001234",
    delta: 300,
    reason: "紙カードから移行",
    staffName: "高橋店",
    memo: "既存紙カードから移行",
    balanceAfter: 900,
    createdAt: "2026-05-02T02:45:00.000Z",
  },
];

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const pointRoute = pointRouteFromPath(url.pathname);
    const reservationId = reservationIdFromPath(url.pathname);
    if (url.pathname !== "/" && url.pathname !== "/reservations" && !reservationId && !pointRoute) {
      return jsonResponse({ message: "Not found" }, 404, cors);
    }

    try {
      if (pointRoute) {
        return await handlePointRequest(request, env, cors, pointRoute);
      }
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
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Staff-Token",
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

function pointRouteFromPath(pathname) {
  const match = pathname.match(/^\/points\/([^/]+)(?:\/(transactions))?\/?$/);
  if (!match) return null;
  return {
    memberNumber: normalizeText(decodeURIComponent(match[1]), 40),
    action: match[2] || "",
  };
}

function reservationIdFromPath(pathname) {
  if (!pathname.startsWith("/reservations/")) return "";
  return normalizeText(decodeURIComponent(pathname.slice("/reservations/".length)), 80);
}

async function handlePointRequest(request, env, cors, route) {
  try {
    if (request.method === "GET" && !route.action) {
      return await pointStateResponse(env, cors, route.memberNumber);
    }
    if (request.method === "POST" && route.action === "transactions") {
      return await createPointTransaction(request, env, cors, route.memberNumber);
    }
    return jsonResponse({ message: "Method not allowed" }, 405, cors);
  } catch (error) {
    console.error("point api error", error);
    return jsonResponse({ message: "ポイントAPIでエラーが発生しました" }, 500, cors);
  }
}

async function ensurePointTables(env) {
  assertDatabase(env);
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS point_members (
      member_number TEXT PRIMARY KEY,
      representative_name TEXT NOT NULL,
      current_points INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS point_transactions (
      id TEXT PRIMARY KEY,
      member_number TEXT NOT NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      staff_name TEXT NOT NULL,
      memo TEXT,
      balance_after INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_point_transactions_member
      ON point_transactions(member_number, created_at DESC)`,
  ).run();
}

async function ensureSeedPointData(env, memberNumber) {
  if (memberNumber !== SEED_POINT_MEMBER.memberNumber) return;
  await env.DB.prepare(
    `INSERT OR IGNORE INTO point_members (
       member_number, representative_name, current_points, status, created_at, updated_at
     ) VALUES (?, ?, ?, 'active', ?, ?)`,
  )
    .bind(
      SEED_POINT_MEMBER.memberNumber,
      SEED_POINT_MEMBER.representativeName,
      SEED_POINT_MEMBER.currentPoints,
      SEED_POINT_MEMBER.createdAt,
      SEED_POINT_MEMBER.createdAt,
    )
    .run();

  for (const transaction of SEED_POINT_TRANSACTIONS) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO point_transactions (
         id, member_number, delta, reason, staff_name, memo, balance_after, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        transaction.id,
        transaction.memberNumber,
        transaction.delta,
        transaction.reason,
        transaction.staffName,
        transaction.memo,
        transaction.balanceAfter,
        transaction.createdAt,
      )
      .run();
  }
}

async function pointStateResponse(env, cors, memberNumber, status = 200) {
  await ensurePointTables(env);
  await ensureSeedPointData(env, memberNumber);

  const member = await env.DB.prepare(
    `SELECT member_number, representative_name, current_points, status, created_at, updated_at
       FROM point_members
      WHERE member_number = ?`,
  )
    .bind(memberNumber)
    .first();

  if (!member) {
    return jsonResponse({ message: "会員が見つかりません" }, 404, cors);
  }

  const transactions = await env.DB.prepare(
    `SELECT id, member_number, delta, reason, staff_name, memo, balance_after, created_at
       FROM point_transactions
      WHERE member_number = ?
      ORDER BY created_at DESC
      LIMIT 30`,
  )
    .bind(memberNumber)
    .all();

  return jsonResponse(
    {
      member: {
        member_number: member.member_number,
        representative_name: member.representative_name,
        member_name: member.representative_name,
        current_points: member.current_points,
        status: member.status,
        created_at: member.created_at,
        updated_at: member.updated_at,
      },
      balance: member.current_points,
      transactions: transactions.results || [],
    },
    status,
    cors,
  );
}

async function createPointTransaction(request, env, cors, memberNumber) {
  await ensurePointTables(env);
  await ensureSeedPointData(env, memberNumber);

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ message: "ポイント処理内容をJSONで送信してください" }, 400, cors);
  }
  if (!isAuthorizedPointStaff(request, env, payload)) {
    return jsonResponse({ message: "店舗側トークンを確認できませんでした" }, 401, cors);
  }

  const delta = Number.parseInt(payload.delta, 10);
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000) {
    return jsonResponse({ message: "増減ポイントが正しくありません" }, 400, cors);
  }

  const now = new Date().toISOString();
  let member = await env.DB.prepare(
    `SELECT member_number, representative_name, current_points
       FROM point_members
      WHERE member_number = ?`,
  )
    .bind(memberNumber)
    .first();

  if (!member) {
    const representativeName = normalizeText(payload.memberName, 80) || "登録会員";
    await env.DB.prepare(
      `INSERT INTO point_members (
         member_number, representative_name, current_points, status, created_at, updated_at
       ) VALUES (?, ?, 0, 'active', ?, ?)`,
    )
      .bind(memberNumber, representativeName, now, now)
      .run();
    member = { member_number: memberNumber, representative_name: representativeName, current_points: 0 };
  }

  const previousBalance = Number(member.current_points) || 0;
  const nextBalance = Math.max(0, previousBalance + delta);
  const actualDelta = nextBalance - previousBalance;
  if (actualDelta === 0) {
    return jsonResponse({ message: "現在ポイントから変更がありません" }, 400, cors);
  }

  const transaction = {
    id: normalizeText(payload.id, 80) || `pt-${crypto.randomUUID()}`,
    memberNumber,
    delta: actualDelta,
    reason: normalizeText(payload.reason, 80) || "ポイント調整",
    staffName: normalizeText(payload.staffName || payload.staff, 80) || "本店スタッフ",
    memo: normalizeText(payload.memo, 500),
    balanceAfter: nextBalance,
    createdAt: now,
  };

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE point_members
          SET current_points = ?, updated_at = ?
        WHERE member_number = ?`,
    ).bind(nextBalance, now, memberNumber),
    env.DB.prepare(
      `INSERT INTO point_transactions (
         id, member_number, delta, reason, staff_name, memo, balance_after, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      transaction.id,
      transaction.memberNumber,
      transaction.delta,
      transaction.reason,
      transaction.staffName,
      transaction.memo,
      transaction.balanceAfter,
      transaction.createdAt,
    ),
  ]);

  return await pointStateResponse(env, cors, memberNumber, 201);
}

function isAuthorizedPointStaff(request, env, payload) {
  const expected = normalizeText(env.POINT_STAFF_TOKEN || DEFAULT_POINT_STAFF_TOKEN, 200);
  const authorization = request.headers.get("Authorization") || "";
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  const submitted =
    normalizeText(payload.staffToken, 200) ||
    normalizeText(request.headers.get("X-Staff-Token"), 200) ||
    normalizeText(bearerToken, 200);
  return Boolean(expected && submitted && submitted === expected);
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
    "https://liff.line.me/2010371637-PcIXzbgC/?screen=reservation&v=20260613-line-browser-fix";
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
