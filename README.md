# 勇吉屋 公式LINE 会員情報デモ

これは勇吉屋公式LINEのリッチメニュー起点で、会員照会・ポイント・採寸予約を開くLIFF風デモです。

公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`
採寸予約LIFF URL: `https://liff.line.me/2010371637-PcIXzbgC?v=20260611-latest-measurements`

- `index.html`: LINEトーク画面 + リッチメニュー + 顧客側LIFF風画面
- `staff.html`: 店舗側ポイント処理画面
- `styles.css`: LIFF風の画面デザイン
- `app.js`: 会員情報編集、ポイントQR、店舗側ポイント増減、採寸予約、LINE確認文送信のデモロジック
- `staff.js`: 店舗側のポイント増減、履歴追加、顧客画面への即時反映デモロジック
- `assets/avatars/`: gpt-image2生成の選択アイコン20種
- `config.js`: LIFF IDや外部リンクの設定
- `rich-menu/`: LINE公式リッチメニュー画像と設定テンプレート
- `scripts/`: Messaging APIでリッチメニューを投入するスクリプト
- `worker/`: 採寸予約APIとLINE Push通知用のCloudflare Worker

本番化する場合は、LINE Developers側でLIFF IDを発行し、LINE公式リッチメニューから `?screen=member` / `?screen=points` / 採寸予約LIFF URLを直接開く構成にします。

## ポイントQRデモ

最初のLINE風画面のリッチメニューから「ポイント」を押すと、現在ポイントと会員識別QRが大きく表示されます。
QR読み取り後の店舗側デモは `staff.html` です。`+100` / `+300` / `-50` などの増減を入力すると、顧客側のポイント数と履歴に即時反映され、大きなエフェクトで変化を見せます。

## 採寸予約デモ

最初のLINE風画面のリッチメニュー、`?screen=reservation`、または `https://liff.line.me/2010371637-PcIXzbgC?v=20260611-latest-measurements` で採寸予約画面を開けます。

- 予約枠は10:00-18:00の1時間単位
- 予約済み枠は選択不可
- 予約画面の上部に本人の予約状況を表示し、同じ画面からキャンセル可能
- 最新状況欄はメンバーごとの最新寸法情報を表示し、採寸記録の履歴一覧はこの画面に出さない
- 予約確定後に日時、店舗、対象者、会員番号、受付番号をLINE Flex Messageのリッチメッセージとして送信
- リッチメッセージのボタンは「予約キャンセル」として予約画面へ戻る導線
- 通常ブラウザで確実にLINEへ届ける場合は、`worker/` の予約APIからMessaging APIのPush Messageで送信
- LIFF単体の `sendMessages` は、LINEアプリ内のトークから開いた場合だけの補助経路

静的デモでは `localStorage` で予約済み枠を保持します。本番では `config.js` の `reservationApiUrl` に `worker/` の予約APIを設定し、D1側で `date + store + hour` を一意制約にして二重予約を防ぎます。本人の予約状況取得とキャンセルはLIFF access tokenからLINEユーザーを検証して行います。LINEへ確実に届く通知は、ココトモと同じくサーバー側にチャネルアクセストークンを置いてMessaging APIでFlex MessageをPush送信します。

## LINE接続

`config.js` の `liffId` にLINE Developersで発行したLIFF IDを入れると、LINE内で開いた時にLIFF初期化を行います。勇吉屋公式の採寸予約は `2010371637-PcIXzbgC` を設定済みです。

```js
window.YUUKICHIYA_LINE_CONFIG = {
  liffId: "2010371637-PcIXzbgC",
  officialLineUrl: "https://lin.ee/7byeeeA",
  memberPageUrl: "https://example.com/?screen=member",
  pointsPageUrl: "https://example.com/?screen=points",
  staffPageUrl: "https://example.com/staff.html",
  measurementReservationUrl: "https://liff.line.me/2010371637-PcIXzbgC?v=20260611-latest-measurements",
  reservationApiUrl: "https://example.com/api/yuukichiya/reservations"
};
```

## 予約APIとLINE Push通知

`worker/` にCloudflare Worker + D1用の予約APIを追加しています。デプロイ後、`config.js` の `reservationApiUrl` をWorkerの `/reservations` URLに設定します。

```bash
cd worker
cp wrangler.jsonc.example wrangler.jsonc
npx wrangler d1 create yuukichiya_reservations
npx wrangler d1 execute yuukichiya_reservations --file=./schema.sql
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler deploy
```

GitHub Pagesや `config.js` にLINEチャネルアクセストークンは置きません。ココトモと同じく、サーバー側のsecretからMessaging APIを呼びます。

予約状況とキャンセル:

- `GET /reservations?mine=1`: `Authorization: Bearer <LIFF access token>` で本人の予約一覧を返す
- `DELETE /reservations/:id`: 同じLINEユーザーの予約だけキャンセルする

## リッチメニュー投入

チャネルアクセストークンはファイルに保存せず、環境変数で渡します。

```bash
LINE_CHANNEL_ACCESS_TOKEN='...' \
YUUKICHIYA_BASE_URL='https://example.com/' \
node scripts/apply-rich-menu.mjs
```

`YUUKICHIYA_BASE_URL` はこのデモページを公開したHTTPS URLです。
採寸予約URLは未指定なら `https://example.com/?screen=reservation` になります。LINE内で予約確定メッセージを送る場合は `YUUKICHIYA_MEASUREMENT_RESERVATION_URL='https://liff.line.me/2010371637-PcIXzbgC?v=20260611-latest-measurements'` を指定します。
