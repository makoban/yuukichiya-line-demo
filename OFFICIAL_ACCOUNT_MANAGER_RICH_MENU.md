# 勇吉屋 リッチメニュー設定 URL表

このリッチメニューはLINE Official Account Managerで編集する。Messaging APIでリッチメニューを投入しない。

## A-F アクション設定

| 枠 | 表示名 | タイプ | URL |
| --- | --- | --- | --- |
| A | 会員情報 | リンク | `https://makoban.github.io/yuukichiya-line-demo/?screen=member` |
| B | ポイント | リンク | `https://makoban.github.io/yuukichiya-line-demo/?screen=points` |
| C | 採寸予約 | リンク | `https://liff.line.me/2010371637-PcIXzbgC?v=20260612-reservation-records-split` |
| D | 採寸記録 | リンク | `https://makoban.github.io/yuukichiya-line-demo/?screen=measurement-records` |
| E | ECサイト | リンク | `https://makoban.github.io/yuukichiya-base-preview/?v=20260611-2` |
| F | クーポン | リンク | `https://makoban.github.io/yuukichiya-line-demo/?screen=coupon` |

## 横取りを避けるルール

- Official Account Managerで作ったメニューを正とする。
- `scripts/apply-rich-menu.mjs` は通常実行しない。
- 過去にMessaging API側でデフォルトリッチメニューを設定した場合は、`scripts/release-rich-menu-to-official-manager.mjs` でAPI側のデフォルト設定を解除する。
- LINE内で反映が遅い場合は、トーク画面を閉じて開き直す。必要ならメニューの表示期間と予約/待機中タブも確認する。
