#!/usr/bin/env node

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!token) {
  throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required.");
}

const response = await fetch("https://api.line.me/v2/bot/info", {
  headers: { Authorization: `Bearer ${token}` },
});
const text = await response.text();
if (!response.ok) {
  throw new Error(`Bot info failed: ${response.status} ${text}`);
}
console.log(text);
