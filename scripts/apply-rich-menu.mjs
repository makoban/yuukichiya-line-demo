#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const baseUrl = process.env.YUUKICHIYA_BASE_URL;
const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/$/, "") : "";
const measurementReservationUrl =
  process.env.YUUKICHIYA_MEASUREMENT_RESERVATION_URL || `${normalizedBaseUrl}/?screen=reservation`;
const ecUrl = process.env.YUUKICHIYA_EC_URL || "https://yuukichiya.base.shop/";
const imagePath = path.join(rootDir, "rich-menu", "yuukichiya_rich_menu_6_2500x1686_upload.jpg");
const templatePath = path.join(rootDir, "rich-menu", "rich-menu-template.json");

if (!token) {
  throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required.");
}

if (!baseUrl || !baseUrl.startsWith("https://")) {
  throw new Error("YUUKICHIYA_BASE_URL must be an https URL.");
}

function fillTemplate(template) {
  return template
    .replaceAll("{{BASE_URL}}", normalizedBaseUrl)
    .replaceAll("{{MEASUREMENT_RESERVATION_URL}}", measurementReservationUrl)
    .replaceAll("{{EC_URL}}", ecUrl);
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
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${url} failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

const body = JSON.parse(fillTemplate(await fs.readFile(templatePath, "utf8")));

const created = await lineFetch("https://api.line.me/v2/bot/richmenu", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const richMenuId = created.richMenuId;
if (!richMenuId) {
  throw new Error("LINE did not return richMenuId.");
}

const image = await fs.readFile(imagePath);
await lineFetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
  method: "POST",
  headers: { "Content-Type": "image/jpeg" },
  body: image,
});

await lineFetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
  method: "POST",
});

console.log(JSON.stringify({ richMenuId, baseUrl }, null, 2));
