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

ブラウザ確認は公開済みデモURLで行えます。LINEリッチメニューでは以下のLIFF URLへ統一します。

- 会員情報: `https://liff.line.me/2010371637-PcIXzbgC?screen=member&v=20260613-liff-menu-unify`
- ポイント: `https://liff.line.me/2010371637-PcIXzbgC?screen=points&v=20260613-liff-menu-unify`
- 採寸予約: `https://liff.line.me/2010371637-PcIXzbgC?screen=reservation&v=20260613-liff-menu-unify`
- 採寸履歴: `https://liff.line.me/2010371637-PcIXzbgC?screen=measurement-records&v=20260613-liff-menu-unify`
- クーポン: `https://liff.line.me/2010371637-PcIXzbgC?screen=coupon&v=20260613-liff-menu-unify`
