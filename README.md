# 勇吉屋 公式LINE 会員情報デモ

これは勇吉屋公式LINEのリッチメニュー起点で、会員照会・ポイント・採寸予約を開くLIFF風デモです。

公開済みURL: `https://makoban.github.io/yuukichiya-line-demo/`

- `index.html`: LINEトーク画面 + リッチメニュー + 顧客側LIFF風画面
- `staff.html`: 店舗側ポイント処理画面
- `styles.css`: LIFF風の画面デザイン
- `app.js`: 会員情報編集、ポイントQR、店舗側ポイント増減、採寸予約、LINE確認文送信のデモロジック
- `staff.js`: 店舗側のポイント増減、履歴追加、顧客画面への即時反映デモロジック
- `assets/avatars/`: gpt-image2生成の選択アイコン
- `config.js`: LIFF IDや外部リンクの設定
- `rich-menu/`: LINE公式リッチメニュー画像と設定テンプレート
- `scripts/`: Messaging APIでリッチメニューを投入するスクリプト

本番化する場合は、LINE Developers側でLIFF IDを発行し、LINE公式リッチメニューから `?screen=member` / `?screen=points` / `?screen=reservation` へ直接開く構成にします。

## ポイントQRデモ

最初のLINE風画面のリッチメニューから「ポイント」を押すと、現在ポイントと会員識別QRが大きく表示されます。
QR読み取り後の店舗側デモは `staff.html` です。`+100` / `+300` / `-50` などの増減を入力すると、顧客側のポイント数と履歴に即時反映され、大きなエフェクトで変化を見せます。

## 採寸予約デモ

最初のLINE風画面のリッチメニュー、または `?screen=reservation` で採寸予約画面を開けます。

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
  memberPageUrl: "https://example.com/?screen=member",
  pointsPageUrl: "https://example.com/?screen=points",
  staffPageUrl: "https://example.com/staff.html",
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
