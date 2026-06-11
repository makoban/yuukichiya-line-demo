# 勇吉屋 公式LINE 会員情報デモ

これは勇吉屋公式LINEの会員情報TOPとして使うLIFF風デモです。

公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`

- `index.html`: 会員情報TOP画面
- `styles.css`: LIFF風の画面デザイン
- `app.js`: 会員情報編集、ポイントQR、店舗側ポイント増減、採寸予約、LINE確認文送信のデモロジック
- `assets/avatars/`: gpt-image2生成の選択アイコン
- `config.js`: LIFF IDや外部リンクの設定
- `rich-menu/`: LINE公式リッチメニュー画像と設定テンプレート
- `scripts/`: Messaging APIでリッチメニューを投入するスクリプト

本番化する場合は、この画面をLIFF URLとして公開し、LINE Developers側でLIFF IDを発行してリッチメニューの「会員情報」から開く構成にします。

## ポイントQRデモ

画面上部の「ポイント」ボタンを押すと、現在ポイントと会員識別QRが大きく表示されます。
「店舗側で読み取りデモ」を押すと、店員側のポイント処理パネルが開き、`+100` / `+300` / `-50` などの増減を入力できます。反映後は顧客側のポイント数と履歴に即時反映され、大きなエフェクトで変化を見せます。

## 採寸予約デモ

画面上部の「採寸予約」ボタン、または `?screen=reservation` で採寸予約画面を開けます。

- 予約枠は10:00-18:00の1時間単位
- 予約済み枠は選択不可
- 予約確定後に日時、店舗、対象者、電話番号、会員番号、受付番号をLINE確認文として送信
- 通常ブラウザでは確認文をコピーし、LIFFまたは予約API接続後にLINE送信

静的デモでは `localStorage` で予約済み枠を保持します。本番では `config.js` の `reservationApiUrl` に予約APIを設定し、DB側で `date + store + hour` を一意制約にして二重予約を防ぎます。

## LINE接続

`config.js` の `liffId` にLINE Developersで発行したLIFF IDを入れると、LINE内で開いた時にLIFF初期化を行います。

```js
window.YUUKICHIYA_LINE_CONFIG = {
  liffId: "xxxxxxxxxx-xxxxxxxx",
  officialLineUrl: "https://lin.ee/7byeeeA",
  reservationApiUrl: "https://example.com/api/yuukichiya/reservations"
};
```

## リッチメニュー投入

チャネルアクセストークンはファイルに保存せず、環境変数で渡します。

```bash
LINE_CHANNEL_ACCESS_TOKEN='...' \
YUUKICHIYA_BASE_URL='https://example.com/' \
node scripts/apply-rich-menu.mjs
```

`YUUKICHIYA_BASE_URL` はこのデモページを公開したHTTPS URLです。
採寸予約URLは未指定なら `https://example.com/?screen=reservation` になります。外部予約サイトを使う場合だけ `YUUKICHIYA_MEASUREMENT_RESERVATION_URL` を指定します。
