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
- Official Account Manager用リッチメニューURL表
- Messaging APIのリッチメニュー横取り解除スクリプト

## 本番接続に必要なもの

1. この `line-demo` フォルダをHTTPSで公開する
2. LINE DevelopersでLIFFアプリを作成する
3. `config.js` の `liffId` にLIFF IDを入れる
4. LINE Official AccountのMessaging APIチャネルアクセストークンを用意する
5. `worker/` の予約APIをCloudflare Workersへデプロイし、`config.js` の `reservationApiUrl` に設定する
6. 採寸履歴をLIFF本人識別する場合は、リッチメニューをLIFF URLに統一し、`liff.state` の `screen` で各画面へ振り分ける
7. LINE Official Account Managerで6分割リッチメニューの各URLを設定する

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

採寸履歴ページは `https://liff.line.me/LIFF_ID?screen=measurement-records` で開く。リッチメニューの下段左は、このLIFF URLへ向ける。

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

このURLをLIFF Endpoint URLに設定し、リッチメニュー側は `https://liff.line.me/LIFF_ID?screen=...` に統一する。

## LINE側で必要な値

- LIFF ID
- Channel access token
- 予約API URL
- 採寸履歴を本人識別するためのLIFF Endpoint URLと `screen` 振り分け方針
- 採寸予約を外部サイトにする場合の実URL

ECボタンはBASEデザイン確認用プレビューへ向ける:

- `https://makoban.github.io/yuukichiya-base-preview/?v=20260611-2`

## リッチメニュー設定方針

リッチメニューはLINE Official Account Managerを正とする。`scripts/apply-rich-menu.mjs` は通常実行禁止。Messaging APIでデフォルトリッチメニューを設定すると、Official Account Manager側の編集が効かないように見えるため。

Official Account Managerに入れるURLは `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md` を参照する。

過去にMessaging API側のデフォルトリッチメニューが設定されている可能性がある場合は、一度だけ以下で解除する。

```bash
cd line-demo
LINE_CHANNEL_ACCESS_TOKEN='ここにチャネルアクセストークン' \
node scripts/release-rich-menu-to-official-manager.mjs
```

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
