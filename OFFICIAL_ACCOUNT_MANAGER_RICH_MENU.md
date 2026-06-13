# 勇吉屋 リッチメニュー設定 URL表

このリッチメニューはLINE Official Account Managerの管理画面で手動編集する。Messaging APIでリッチメニューを作成・デフォルト設定しない。

## A-F アクション設定

| 枠 | 表示名 | タイプ | URL |
| --- | --- | --- | --- |
| A | 会員情報 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=member&v=20260613-line-browser-fix` |
| B | ポイント | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=points&v=20260613-line-browser-fix` |
| C | 採寸予約 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=reservation&v=20260613-line-browser-fix` |
| D | 採寸記録 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=measurement-records&v=20260613-line-browser-fix` |
| E | ECサイト | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=ec&v=20260613-brand-link` |
| F | クーポン | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=coupon&v=20260613-line-browser-fix` |

## 横取りを避けるルール

- Official Account Managerで作ったメニューを正とする。
- 下表のA/B/C/D/F URL差し替えは、Official Account Managerの各タップ領域のリンクURL欄で行う。これはAPI横取りではない。
- `scripts/apply-rich-menu.mjs` は通常実行しない。
- API横取りになる操作は、Messaging APIでリッチメニューを作成し、`/v2/bot/user/all/richmenu/{richMenuId}` などで全ユーザーへ紐付けること。
- 過去にMessaging API側でデフォルトリッチメニューを設定した場合は、`scripts/release-rich-menu-to-official-manager.mjs` でAPI側のデフォルト設定を解除する。
- LINE内で反映が遅い場合は、トーク画面を閉じて開き直す。必要ならメニューの表示期間と予約/待機中タブも確認する。

## EがLINE内ブラウザで開く仕組み

- E ECサイトもA-F同様にLIFF URL（`?screen=ec&v=20260613-brand-link`）に統一した。LIFF URLはLINEアプリ内ブラウザで必ず開くため、外部ブラウザに飛ばない。
- LINE内ブラウザのキャッシュが強いため、ECプレビュー側を更新したらEの `v` も更新する。
- アプリは `screen=ec` を受け取ると `config.js` の `ecUrl`（BASEストアのプレビュー）へ転送する。転送先もmakoban.github.ioの静的ページなのでLINE内のまま表示される。
- 注意: プレビューから本物のBASEストア（`yuukichiya.base.shop`）の購入・決済へ進むと、BASE側の仕様で外部ブラウザに切り替わることがある。これは意図された挙動。

## LIFF Endpoint URL（最重要・横取り対策）

- LINE Developers → LINEログインチャネル `2010371637` → LIFFタブ → `2010371637-PcIXzbgC` の Endpoint URL は **必ず** `https://makoban.github.io/yuukichiya-line-demo/`（クエリ無し）にする。
- ここに `?screen=reservation` 等を付けると、全ボタンがその画面（採寸予約）に化ける。2026-06-13にこの汚染を発見・修正済み。普通のブラウザでは再現せずLINE内だけで起きるので要注意。
