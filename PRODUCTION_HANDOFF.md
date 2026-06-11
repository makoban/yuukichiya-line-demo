# 勇吉屋 公式LINE 本番接続メモ

## 現在できているもの

- 会員情報TOPページ
- LIFF SDK読み込み
- LIFF ID未設定時の通常ブラウザ表示
- LIFF ID設定時のLINEプロフィール取得
- 採寸予約画面
- 1時間単位の空き枠選択
- 予約済み枠の選択不可表示
- 予約確定後のLINE確認文送信処理
- gpt-image2生成アイコン12種
- LINEリッチメニュー画像
- Messaging API用リッチメニュー投入スクリプト

## 本番接続に必要なもの

1. この `line-demo` フォルダをHTTPSで公開する
2. LINE DevelopersでLIFFアプリを作成する
3. `config.js` の `liffId` にLIFF IDを入れる
4. LINE Official AccountのMessaging APIチャネルアクセストークンを用意する
5. 予約APIを用意し、`config.js` の `reservationApiUrl` に設定する
6. `scripts/apply-rich-menu.mjs` で6分割リッチメニューを反映する

## 採寸予約の本番要件

静的デモの予約済み判定は同一ブラウザ内の確認用です。実運用ではサーバー側で以下を必ず行う。

- 予約テーブルに `date + store + hour` の一意制約を置く
- 予約確定はDBトランザクション内で作成する
- 既に埋まっている枠はHTTP 409で返す
- LIFFのID tokenまたはaccess tokenをサーバーで検証してLINEユーザーを確定する
- 予約作成後、Messaging APIで利用者へ確認メッセージを送る

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

## 公開URLの候補

GitHub Pagesを使う場合:

- 公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`

このURLをLIFF Endpoint URLに設定し、リッチメニューの「会員情報」にも設定する。

## LINE側で必要な値

- LIFF ID
- Channel access token
- 予約API URL
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
チャネルアクセストークンはファイルに保存しない。
