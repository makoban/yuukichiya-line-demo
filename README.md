# 勇吉屋 公式LINE 会員情報デモ

これは勇吉屋公式LINEの会員情報TOPとして使うLIFF風デモです。

- `index.html`: 会員情報TOP画面
- `styles.css`: LIFF風の画面デザイン
- `app.js`: 誕生日から年齢・学年を自動表示するデモロジック
- `assets/avatars/`: gpt-image2生成の選択アイコン
- `config.js`: LIFF IDや外部リンクの設定
- `rich-menu/`: LINE公式リッチメニュー画像と設定テンプレート
- `scripts/`: Messaging APIでリッチメニューを投入するスクリプト

本番化する場合は、この画面をLIFF URLとして公開し、LINE Developers側でLIFF IDを発行してリッチメニューの「会員情報」から開く構成にします。

## LINE接続

`config.js` の `liffId` にLINE Developersで発行したLIFF IDを入れると、LINE内で開いた時にLIFF初期化を行います。

```js
window.YUUKICHIYA_LINE_CONFIG = {
  liffId: "xxxxxxxxxx-xxxxxxxx",
  officialLineUrl: "https://lin.ee/7byeeeA"
};
```

## リッチメニュー投入

チャネルアクセストークンはファイルに保存せず、環境変数で渡します。

```bash
LINE_CHANNEL_ACCESS_TOKEN='...' \
YUUKICHIYA_BASE_URL='https://example.com/' \
YUUKICHIYA_MEASUREMENT_RESERVATION_URL='https://example.com/reservation' \
node scripts/apply-rich-menu.mjs
```

`YUUKICHIYA_BASE_URL` はこのデモページを公開したHTTPS URLです。
