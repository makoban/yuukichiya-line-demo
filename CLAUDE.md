# Claude Code entrypoint

勇吉屋HP・EC・購入履歴・LINEの現行共通仕様を先に読む。LINE内の購入履歴サンプルとRender購入履歴サービスを同一視しない。

`/Users/banmako/Library/CloudStorage/Dropbox-becreative/番野誠/ビークリ社内用共有/勇吉屋/YUUKICHIYA_SYSTEM_SPEC.md`

Read this first. For the latest fixes read `HANDOFF_2026-06-13.md`; for background read `CLAUDE_CODE_PROJECT_SPEC.md`.

Current status (updated 2026-06-13):

- ROOT CAUSE FOUND AND FIXED: the rich-menu "化ける" bug was caused by the LIFF Endpoint URL being set to `https://makoban.github.io/yuukichiya-line-demo/?screen=reservation`. It must stay neutral: `https://makoban.github.io/yuukichiya-line-demo/` (no query). See `HANDOFF_2026-06-13.md` §1.
- Browser-verified on the live LIFF URLs; final "done" still requires the owner's real-phone confirmation.
- Rich-menu E (ECサイト) should use the cache-busted link `https://liff.line.me/2010371637-PcIXzbgC/?screen=ec&v=20260613-brand-link`.
- Keep the LIFF Endpoint URL neutral; re-poisoning it reintroduces the bug (LINE-app-only, invisible in normal browsers).
- Do not run `scripts/apply-rich-menu.mjs` unless the owner explicitly chooses API-managed rich menus.
- Official Account Manager is the source of truth for the rich menu. Do not store LINE secrets in this repo.
- When changing static files, bump the `?v=` cache-bust version in `index.html` (LINE in-app browser caches aggressively).

Handoff/spec:

```text
HANDOFF_2026-06-13.md          (latest: this session's fixes + root cause)
CLAUDE_CODE_PROJECT_SPEC.md    (background: product spec and original brief)
```
