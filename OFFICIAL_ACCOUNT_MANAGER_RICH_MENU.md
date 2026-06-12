# 勇吉屋 リッチメニュー設定 URL表

このリッチメニューはLINE Official Account Managerの管理画面で手動編集する。Messaging APIでリッチメニューを作成・デフォルト設定しない。

## A-F アクション設定

| 枠 | 表示名 | タイプ | URL |
| --- | --- | --- | --- |
| A | 会員情報 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=member&v=20260613-liff-path-state` |
| B | ポイント | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=points&v=20260613-liff-path-state` |
| C | 採寸予約 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=reservation&v=20260613-liff-path-state` |
| D | 採寸記録 | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=measurement-records&v=20260613-liff-path-state` |
| E | ECサイト | リンク | `https://makoban.github.io/yuukichiya-base-preview/?v=20260611-2` |
| F | クーポン | リンク | `https://liff.line.me/2010371637-PcIXzbgC/?screen=coupon&v=20260613-liff-path-state` |

## 横取りを避けるルール

- Official Account Managerで作ったメニューを正とする。
- 下表のA/B/C/D/F URL差し替えは、Official Account Managerの各タップ領域のリンクURL欄で行う。これはAPI横取りではない。
- `scripts/apply-rich-menu.mjs` は通常実行しない。
- API横取りになる操作は、Messaging APIでリッチメニューを作成し、`/v2/bot/user/all/richmenu/{richMenuId}` などで全ユーザーへ紐付けること。
- 過去にMessaging API側でデフォルトリッチメニューを設定した場合は、`scripts/release-rich-menu-to-official-manager.mjs` でAPI側のデフォルト設定を解除する。
- LINE内で反映が遅い場合は、トーク画面を閉じて開き直す。必要ならメニューの表示期間と予約/待機中タブも確認する。
