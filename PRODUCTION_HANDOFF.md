# 勇吉屋 公式LINE 本番接続メモ

## 現在できているもの

- 会員情報TOPページ
- LIFF SDK読み込み
- LIFF ID未設定時の通常ブラウザ表示
- LIFF ID設定時のLINEプロフィール取得
- 採寸予約画面
- 1時間単位の空き枠選択
- 予約済み枠の選択不可表示
- 予約確定後のLINE Flex Messageリッチメッセージ送信処理
- 採寸履歴ページ `?screen=measurement-records`
- 採寸履歴の会員アイコン、洋服種別アイコン、購入金額、採寸値カード表示
- Cloudflare Worker + D1用の予約API雛形
- 予約APIからMessaging API Push MessageでLINEへ届ける本番経路
- gpt-image2生成アイコン20種
- LINEリッチメニュー画像
- Messaging API用リッチメニュー投入スクリプト

## 本番接続に必要なもの

1. この `line-demo` フォルダをHTTPSで公開する
2. LINE DevelopersでLIFFアプリを作成する
3. `config.js` の `liffId` にLIFF IDを入れる
4. LINE Official AccountのMessaging APIチャネルアクセストークンを用意する
5. `worker/` の予約APIをCloudflare Workersへデプロイし、`config.js` の `reservationApiUrl` に設定する
6. 採寸履歴をLIFF本人識別する場合は、LIFF Endpoint URLをベースURLにするか採寸履歴用LIFF IDを作成する
7. `scripts/apply-rich-menu.mjs` で6分割リッチメニューを反映する

## 採寸予約の本番要件

静的デモの予約済み判定は同一ブラウザ内の確認用です。実運用ではサーバー側で以下を必ず行う。

- 予約テーブルに `date + store + hour` の一意制約を置く
- 予約確定はDBトランザクション内で作成する
- 既に埋まっている枠はHTTP 409で返す
- LIFFのID tokenまたはaccess tokenをサーバーで検証してLINEユーザーを確定する
- 予約作成後、ココトモと同じくサーバー側のチャネルアクセストークンでMessaging APIを呼び、利用者へFlex Messageの確認リッチメッセージをPush送信する
- 予約状況はLIFF access tokenで本人確認した予約だけ返す
- キャンセルは同じLINEユーザーに紐づく予約だけ許可し、D1から削除して空き枠へ戻す
- Flex Messageのボタンは「予約状況確認」として予約状況画面へ戻す

予約APIの最小レスポンス例:

```json
{
  "reservation": {
    "id": "YK-M-ABC123",
    "date": "2026-06-12",
    "store": "本店",
    "hour": 11
  },
  "lineMessageSent": true
}
```

## 採寸履歴の本番要件

採寸履歴ページは `https://公開したURL/?screen=measurement-records` で開く。リッチメニューの下段左は、このURLへ向ける。

実運用では以下を保存する。

- `line_user_id`: LINEユーザー連携用
- `member_number`: 会員番号
- `member_id` / `member_name`: 家族内の誰の記録か
- `member_avatar_url`: 会員アイコン
- `item_name`: 購入品名
- `item_kind`: 制服、体操服、ズボン、上着など
- `amount_yen`: 購入金額
- `purchased_at`: 購入日時
- `measured_at`: 採寸日時
- `measurements_json`: `身長`, `胸囲`, `ウエスト`, `股下`, `袖丈`, `肩幅`, `着丈` などの採寸値
- `staff_name` / `store`: 入力店舗・担当者
- `note`: 補正や提案メモ

顧客側LIFFでは、LIFF access tokenをサーバー側で検証して、本人の `line_user_id` に紐づく履歴だけを返す。店舗側の採寸入力は管理画面またはスタッフ用画面から登録する。

## 公開URLの候補

GitHub Pagesを使う場合:

- 公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`

このURLをLIFF Endpoint URLに設定し、リッチメニューの「会員情報」にも設定する。

## LINE側で必要な値

- LIFF ID
- Channel access token
- 予約API URL
- 採寸履歴を本人識別するためのLIFF Endpoint URLまたは採寸履歴用LIFF ID
- 採寸予約を外部サイトにする場合の実URL

ECは現時点では以下を設定済み:

- `https://yuukichiya.base.shop/`

## リッチメニュー反映コマンド

```bash
cd line-demo
LINE_CHANNEL_ACCESS_TOKEN='ここにチャネルアクセストークン' \
YUUKICHIYA_BASE_URL='https://公開したURL/' \
node scripts/apply-rich-menu.mjs
```

採寸予約は未指定なら `https://公開したURL/?screen=reservation` を開く。
採寸履歴はテンプレート上で `https://公開したURL/?screen=measurement-records` を開く。
チャネルアクセストークンはファイルに保存しない。

## 予約APIデプロイ

```bash
cd worker
cp wrangler.jsonc.example wrangler.jsonc
npx wrangler d1 create yuukichiya_reservations
npx wrangler d1 execute yuukichiya_reservations --file=./schema.sql
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler deploy
```

デプロイ後、Worker URLに `/reservations` を付けて `config.js` の `reservationApiUrl` に設定する。
