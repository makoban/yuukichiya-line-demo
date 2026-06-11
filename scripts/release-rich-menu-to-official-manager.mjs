#!/usr/bin/env node

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const userIds = (process.env.LINE_USER_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!token) {
  throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required.");
}

async function lineFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (response.status === 404) {
    return { notFound: true };
  }
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url} failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

const result = {
  apiDefaultRichMenuBefore: null,
  apiDefaultRichMenuRemoved: false,
  perUserRichMenusRemoved: [],
  note: "LINE Official Account Manager default rich menu will be used after API default/per-user overrides are removed.",
};

const apiDefault = await lineFetch("https://api.line.me/v2/bot/user/all/richmenu");
if (!apiDefault.notFound && apiDefault.richMenuId) {
  result.apiDefaultRichMenuBefore = apiDefault.richMenuId;
  await lineFetch("https://api.line.me/v2/bot/user/all/richmenu", { method: "DELETE" });
  result.apiDefaultRichMenuRemoved = true;
}

for (const userId of userIds) {
  await lineFetch(`https://api.line.me/v2/bot/user/${encodeURIComponent(userId)}/richmenu`, {
    method: "DELETE",
  });
  result.perUserRichMenusRemoved.push(userId);
}

console.log(JSON.stringify(result, null, 2));
