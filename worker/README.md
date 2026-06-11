# 勇吉屋 採寸予約API

ココトモSNSと同じ考え方で、LINE Channel access token をサーバー側だけに置き、予約確定後にMessaging APIのPush Messageで予約確定Flex Messageを送るCloudflare Workerです。

## 役割

- `GET /reservations?date=YYYY-MM-DD&store=本店`: 指定日の予約済み枠を返す
- `POST /reservations`: 予約を作成する
- D1の `UNIQUE(date, store, hour)` で同一店舗・同一日・同一時間の二重予約を防ぐ
- LIFF access tokenからLINEユーザーIDを取得し、公式アカウントから予約確定リッチメッセージをpushする

## セットアップ

```bash
cd worker
cp wrangler.jsonc.example wrangler.jsonc
npx wrangler d1 create yuukichiya_reservations
```

作成された `database_id` を `wrangler.jsonc` に入れます。

```bash
npx wrangler d1 execute yuukichiya_reservations --file=./schema.sql
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler deploy
```

デプロイ後、公開されたURLに `/reservations` を付けて `config.js` の `reservationApiUrl` に設定します。

```js
reservationApiUrl: "https://yuukichiya-reservation-api.example.workers.dev/reservations"
```

チャネルアクセストークンは `config.js` やGitHub Pagesには置かず、Workerのsecretだけに保存します。
