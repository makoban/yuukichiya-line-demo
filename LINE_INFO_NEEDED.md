# 本番LIFF化で必要になるLINE側情報

今回の静的デモを見るだけなら不要です。

公開済みデモURL:

- https://makoban.github.io/yuukichiya-line-demo/

本番または実際のLINEメニューに接続する段階では、以下が必要です。

- LINE公式アカウントの管理権限
- LINE DevelopersのProvider / Channel
- LIFFアプリのEndpoint URL
- LIFF ID
- 採寸履歴もLIFF本人識別する場合のEndpoint URL方針（ベースURL共通にするか、採寸履歴用LIFF IDを作るか）
- LIFFのメッセージ送信用スコープ（chat_message.write）、または予約APIからMessaging APIでFlex Messageを送信する方針
- リッチメニュー各ボタンの遷移先URL
- Messaging APIで設定する場合はチャネルアクセストークン
- 採寸予約APIの公開URL
- 採寸履歴APIまたは店舗側採寸入力画面の公開URL
- 本店/高橋店など予約対象店舗の確定リスト

今回共有された友だち追加URL:

- https://lin.ee/7byeeeA

初期デモでは、リッチメニューの「会員情報」にこのデモページURLを設定すれば見せられます。
採寸予約は `https://makoban.github.io/yuukichiya-line-demo/?screen=reservation` で直接開けます。
採寸履歴は `https://makoban.github.io/yuukichiya-line-demo/?screen=measurement-records` で直接開けます。
