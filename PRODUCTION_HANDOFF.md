# 勇吉屋 公式LINE 本番接続メモ

## 現在できているもの

- 会員情報TOPページ
- LIFF SDK読み込み
- LIFF ID未設定時の通常ブラウザ表示
- LIFF ID設定時のLINEプロフィール取得
- gpt-image2生成アイコン12種
- LINEリッチメニュー画像
- Messaging API用リッチメニュー投入スクリプト

## 本番接続に必要なもの

1. この `line-demo` フォルダをHTTPSで公開する
2. LINE DevelopersでLIFFアプリを作成する
3. `config.js` の `liffId` にLIFF IDを入れる
4. LINE Official AccountのMessaging APIチャネルアクセストークンを用意する
5. `scripts/apply-rich-menu.mjs` で6分割リッチメニューを反映する

## 公開URLの候補

GitHub Pagesを使う場合:

- 公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`

このURLをLIFF Endpoint URLに設定し、リッチメニューの「会員情報」にも設定する。

## LINE側で必要な値

- LIFF ID
- Channel access token
- 採寸予約の実URL

ECは現時点では以下を設定済み:

- `https://yuukichiya.base.shop/`

## リッチメニュー反映コマンド

```bash
cd line-demo
LINE_CHANNEL_ACCESS_TOKEN='ここにチャネルアクセストークン' \
YUUKICHIYA_BASE_URL='https://公開したURL/' \
YUUKICHIYA_MEASUREMENT_RESERVATION_URL='https://採寸予約URL/' \
node scripts/apply-rich-menu.mjs
```

チャネルアクセストークンはファイルに保存しない。
