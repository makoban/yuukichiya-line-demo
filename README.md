# 勇吉屋 公式LINE 会員情報デモ

これは勇吉屋公式LINEのリッチメニュー起点で、会員照会・ポイント・採寸予約・採寸履歴を開くLIFF風デモです。

公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`
採寸予約LIFF URL: `https://liff.line.me/2010371637-PcIXzbgC?v=20260612-reservation-records-split`
採寸履歴ページURL: `https://makoban.github.io/yuukichiya-line-demo/?screen=measurement-records`

- `index.html`: LINEトーク画面 + リッチメニュー + 顧客側LIFF風画面
- `staff.html`: 店舗側ポイント処理画面
- `styles.css`: LIFF風の画面デザイン
- `app.js`: 会員情報編集、ポイントQR、店舗側ポイント増減、採寸予約、採寸履歴、LINE確認文送信のデモロジック
- `staff.js`: 店舗側のポイント増減、履歴追加、顧客画面への即時反映デモロジック
- `assets/avatars/`: gpt-image2生成の選択アイコン20種
- `config.js`: LIFF IDや外部リンクの設定
- `rich-menu/`: LINE公式リッチメニュー画像と設定テンプレート
- `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md`: Official Account Managerで入れる6枠のURL
- `scripts/`: 予約通知などの検証用。リッチメニュー投入スクリプトは通常実行禁止
- `worker/`: 採寸予約APIとLINE Push通知用のCloudflare Worker

本番化する場合は、LINE Developers側でLIFF IDを発行し、LINE Official Account Managerのリッチメニューから `?screen=member` / `?screen=points` / `?screen=measurement-records` / 採寸予約LIFF URLを直接開く構成にします。リッチメニューの編集元はOfficial Account Managerに統一します。

## ポイントQRデモ

最初のLINE風画面のリッチメニューから「ポイント」を押すと、現在ポイントと会員識別QRが大きく表示されます。
QR読み取り後の店舗側デモは `staff.html` です。`+100` / `+300` / `-50` などの増減を入力すると、顧客側のポイント数と履歴に即時反映され、大きなエフェクトで変化を見せます。

## 採寸予約デモ

最初のLINE風画面のリッチメニュー、`?screen=reservation`、または `https://liff.line.me/2010371637-PcIXzbgC?v=20260612-reservation-records-split` で採寸予約画面を開けます。

- 予約枠は10:00-18:00の1時間単位
- 予約済み枠は選択不可
- 予約画面の上部に本人の予約状況を表示し、同じ画面からキャンセル可能
- 予約画面は「予約状況欄」と「予約欄」の2つに整理
- 予約確定後に日時、店舗、対象者、会員番号、受付番号をLINE Flex Messageのリッチメッセージとして送信
- リッチメッセージのボタンは「予約状況確認」として予約画面へ戻る導線
- 通常ブラウザで確実にLINEへ届ける場合は、`worker/` の予約APIからMessaging APIのPush Messageで送信
- LIFF単体の `sendMessages` は、LINEアプリ内のトークから開いた場合だけの補助経路

静的デモでは `localStorage` で予約済み枠を保持します。本番では `config.js` の `reservationApiUrl` に `worker/` の予約APIを設定し、D1側で `date + store + hour` を一意制約にして二重予約を防ぎます。本人の予約状況取得とキャンセルはLIFF access tokenからLINEユーザーを検証して行います。LINEへ確実に届く通知は、ココトモと同じくサーバー側にチャネルアクセストークンを置いてMessaging APIでFlex MessageをPush送信します。

## 採寸履歴デモ

リッチメニュー下段左、または `?screen=measurement-records` で採寸履歴ページを開けます。

- 誰が買ったか: 会員アイコンと名前で表示
- 最新の採寸情報: メンバーごとの最新寸法を上部に表示
- 何を買ったか: 洋服の種類アイコン、購入品名、分類チップで表示
- いつ買ったか: 購入日時を表示
- いくらで買ったか: 金額をカード上部に表示
- その時の採寸状況: 身長、胸囲、ウエスト、股下などの数字を大きいカードで表示
- 会員アイコンから本人・子どもごとに履歴を絞り込み

静的デモでは `app.js` 内のサンプル採寸記録を表示しています。本番では店舗側入力画面または管理画面から `member_number` / `line_user_id` / `member_id` / `item_name` / `item_kind` / `amount_yen` / `purchased_at` / `measured_at` / `measurements_json` を保存し、LIFF側では本人に紐づく履歴だけを返します。

## LINE接続

`config.js` の `liffId` にLINE Developersで発行したLIFF IDを入れると、LINE内で開いた時にLIFF初期化を行います。勇吉屋公式の採寸予約は `2010371637-PcIXzbgC` を設定済みです。採寸履歴もLIFFとして本人識別する場合は、LIFF Endpoint URLをデモのベースURLにするか、採寸履歴用のLIFF IDを別途作成します。

```js
window.YUUKICHIYA_LINE_CONFIG = {
  liffId: "2010371637-PcIXzbgC",
  officialLineUrl: "https://lin.ee/7byeeeA",
  memberPageUrl: "https://example.com/?screen=member",
  pointsPageUrl: "https://example.com/?screen=points",
  measurementRecordsPageUrl: "https://example.com/?screen=measurement-records",
  staffPageUrl: "https://example.com/staff.html",
  measurementReservationUrl: "https://liff.line.me/2010371637-PcIXzbgC?v=20260612-reservation-records-split",
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

## リッチメニュー設定

通常運用ではLINE Official Account Managerで設定します。入力値は `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md` を参照してください。

Messaging APIでリッチメニューを作成・デフォルト設定すると、Official Account Managerで設定したメニューより優先される場合があります。そのため `scripts/apply-rich-menu.mjs` は通常実行できないようにガードしています。

過去にMessaging API側のデフォルトリッチメニューを設定した可能性がある場合は、チャネルアクセストークンを環境変数で渡し、以下を一度だけ実行してOfficial Account Managerへ制御を戻します。

```bash
LINE_CHANNEL_ACCESS_TOKEN='...' \
node scripts/release-rich-menu-to-official-manager.mjs
```

チャネルアクセストークンはファイルに保存しません。
