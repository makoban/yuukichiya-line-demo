# Claude Code handoff: 勇吉屋 公式LINE / LIFF project

Updated: 2026-06-13 10:39 JST

This document is the handoff/specification for taking over the Yuukichiya LINE rich-menu and LIFF project from Codex. Treat it as both a product spec and a debugging brief. The current user-facing problem is not resolved on the user's real LINE app, even though the public GitHub Pages files and some API-side checks were updated.

## Current user complaint

The user taps the LINE Official Account rich menu.

- 採寸予約 opens smoothly inside LINE as a LIFF/web page.
- 会員情報, ポイント, クーポン, and/or 採寸記録 still behave inconsistently.
- In the user's latest report, after opening 会員情報, it can still become 採寸予約.
- The user only wants each rich-menu item to open inside the LINE in-app browser and return smoothly to LINE.
- The user is frustrated and asked to hand the project to Claude Code.

Important: do not report this as fixed until the user confirms the behavior on the real phone/LINE app.

## Repository

Primary repo:

```text
/Users/banmako/dev/yuukichiya-line-demo
```

Git remote:

```text
https://github.com/makoban/yuukichiya-line-demo.git
```

Public preview:

```text
https://makoban.github.io/yuukichiya-line-demo/
```

Recent commits at handoff:

```text
604f020 Avoid external LIFF login redirects
6e896dd Stabilize LIFF rich menu screen routing
c5a5d3a Clarify rich menu manager ownership
36fba27 Use LIFF path state links for rich menu
5790a82 Unify rich menu links through LIFF
```

## LINE account and current IDs

LINE Official Account:

```text
勇吉屋公式
Basic ID: @528mzivr
```

LIFF ID:

```text
2010371637-PcIXzbgC
```

Messaging API Channel ID:

```text
2010371574
```

Channel secret/access token handling:

- Never write secrets to files.
- Never commit secrets.
- If a token is needed, get it interactively from LINE Official Account Manager/LINE Developers and keep it in process/env only.
- Clear clipboard after copying secrets.

## Product goal

Build and stabilize a LINE Official Account rich-menu experience for a school-uniform shop.

The rich menu has six areas:

| Area | Label | Expected behavior |
| --- | --- | --- |
| A | 会員情報 | Open member/customer page inside LINE browser |
| B | ポイント | Open point QR/history page inside LINE browser |
| C | 採寸予約 | Open measurement reservation page inside LINE browser |
| D | 採寸記録 | Open measurement/purchase records page inside LINE browser |
| E | ECサイト | Open BASE/store preview; external browser acceptable only if intentionally chosen |
| F | クーポン | Open coupon screen inside LINE browser |

The user does not want a complex explanation. They want the buttons to work consistently in LINE.

## Current intended rich-menu URLs

These are the intended URLs in `config.js`, `README.md`, and `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md`.

```text
A 会員情報:
https://liff.line.me/2010371637-PcIXzbgC/?screen=member&v=20260613-line-browser-fix

B ポイント:
https://liff.line.me/2010371637-PcIXzbgC/?screen=points&v=20260613-line-browser-fix

C 採寸予約:
https://liff.line.me/2010371637-PcIXzbgC/?screen=reservation&v=20260613-line-browser-fix

D 採寸記録:
https://liff.line.me/2010371637-PcIXzbgC/?screen=measurement-records&v=20260613-line-browser-fix

E ECサイト:
https://makoban.github.io/yuukichiya-base-preview/?v=20260611-2

F クーポン:
https://liff.line.me/2010371637-PcIXzbgC/?screen=coupon&v=20260613-line-browser-fix
```

Important: these intended URLs being present in files is not enough. Claude Code must verify the actual LINE Official Account rich-menu action URLs that the user's phone receives.

## Architecture

Static frontend:

- `index.html`: customer-facing LIFF-style single page app.
- `app.js`: screen routing, member info, points, coupon, reservation, measurement records.
- `styles.css`: visual styling.
- `config.js`: public config and rich-menu target URLs.
- `staff.html` / `staff.js`: staff point adjustment demo.

Assets:

- `assets/avatars/`: generated avatar choices.
- `assets/coupons/`: coupon QR asset.
- `rich-menu/`: rich menu image and template.

LINE / admin docs:

- `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md`: current intended manual rich-menu action table.
- `PRODUCTION_HANDOFF.md`: production notes.
- `LINE_INFO_NEEDED.md`: values needed for production/admin setup.

Worker/API:

- `worker/src/index.js`: Cloudflare Worker reservation API draft.
- `worker/schema.sql`: D1 tables for reservations and measurement records.
- `worker/wrangler.jsonc.example`: deployment example.

Scripts:

- `scripts/apply-rich-menu.mjs`: creates/sets rich menu by Messaging API. This is guarded and should normally not be run.
- `scripts/release-rich-menu-to-official-manager.mjs`: removes API default rich-menu override and optionally per-user override if a `LINE_USER_ID` is provided.
- `scripts/verify-line-bot.mjs`: verification helper.

## Critical rule: do not reintroduce API rich-menu takeover

Official Account Manager should be the source of truth for the rich menu unless the owner explicitly chooses an API-managed rich menu.

Do not run `scripts/apply-rich-menu.mjs` as a normal fix. It can create a Messaging API rich menu and link it as a default for all users, which makes Official Account Manager appear ignored.

Safe API checks/actions:

- Check whether an API default rich menu exists.
- Delete API default rich menu if it exists and the goal is to return control to Official Account Manager.
- Check/delete per-user rich menu only if the target LINE user ID is known.

Unsafe unless explicitly approved:

- Create a new rich menu through Messaging API.
- Link a rich menu to all users through Messaging API.
- Link a rich menu to an individual user without documenting why.

## What Codex already changed

Codex made these changes but the user's real LINE app still reportedly shows the same symptom.

1. Updated public config URLs to LIFF URLs for A/B/C/D/F.
2. Updated app routing to parse `liff.state` and prefer it over endpoint/query defaults.
3. Added screen normalization:
   - `member`, `members`, `member-service` -> `member`
   - `point`, `points` -> `points`
   - `reservation`, `measurement-reservation` -> `reservation`
   - `measurement-records`, `measurements`, `records` -> `measurement-records`
   - `coupon`, `coupons` -> `coupon`
4. Changed LIFF init so external browsers do not force `liff.login()`.
5. Removed remaining `liff.login()` call from reservation send flow.
6. Published current static files to GitHub Pages.
7. Verified the public `index.html`, `config.js`, and `app.js` return `20260613-line-browser-fix`.
8. Verified in Safari/public preview that a URL containing both `screen=reservation` and `liff.state=?screen=member` displays 会員照会, not 採寸予約.
9. Used a temporary LINE token to check API default rich-menu override:
   - found `richmenu-bfd5c6280775fa3b6fb92ab38da09384`
   - deleted API default override
   - verified `/v2/bot/user/all/richmenu` returned no default after deletion

Do not assume these changes solved the real LINE issue.

## What is still unknown

The real cause is likely still in one of these LINE-side layers:

1. Actual Official Account Manager action URLs are not the same as the repo's intended URLs.
2. Official Account Manager has a stale saved rich menu or multiple menus, and the displayed/current one is not the one being edited.
3. A per-user rich menu is linked to the user's LINE user ID.
4. LINE app in-app browser/rich-menu cache is using old actions.
5. LINE Developers LIFF endpoint URL is set to a reservation-specific URL/query and the LIFF URL handling is not what the app expects.
6. The user is tapping a different account/menu than the one being edited.

Claude Code should prove or eliminate these with real evidence.

## First debugging task for Claude Code

Do this before editing more app code.

1. Ask the user for a fresh screen recording from the phone:
   - show LINE account name/Basic ID if possible
   - tap 会員情報
   - show final screen URL if LINE browser lets them copy/share it
   - tap back/reopen and tap 採寸予約
2. Verify actual Official Account Manager rich-menu actions:
   - Open `https://manager.line.biz/account/@528mzivr/richmenu`
   - Confirm which menu is "現在の表示".
   - Open edit/details for that exact menu.
   - Extract every action URL exactly, not from the docs.
   - Ensure A/B/C/D/F match `20260613-line-browser-fix`.
3. Verify LINE Developers LIFF app settings:
   - LIFF ID `2010371637-PcIXzbgC`.
   - Endpoint URL should be the neutral app URL:
     `https://makoban.github.io/yuukichiya-line-demo/`
   - It should not be endpointed only to reservation.
   - Check LIFF size/view settings and whether external browser behavior is configured.
4. Verify API rich-menu state again with a fresh token:
   - `GET https://api.line.me/v2/bot/user/all/richmenu`
   - If 200 with a `richMenuId`, delete it only if returning control to Official Account Manager is still the desired path.
   - If the user can provide a LINE user ID, check per-user:
     `GET https://api.line.me/v2/bot/user/{userId}/richmenu`
5. Only after the real LINE-side state is known, decide whether code changes are needed.

## Verification commands

From repo root:

```bash
cd /Users/banmako/dev/yuukichiya-line-demo
git status --short
node --check app.js
node --check worker/src/index.js
python3 -m http.server 4174
```

Public file checks:

```bash
curl -fsSL 'https://makoban.github.io/yuukichiya-line-demo/index.html?verify=handoff' \
  | rg 'line-browser-fix|liff-login-fix|liff-path-state' -n

curl -fsSL 'https://makoban.github.io/yuukichiya-line-demo/config.js?verify=handoff' \
  | rg 'memberPageUrl|pointsPageUrl|measurementReservationUrl|measurementRecordsPageUrl|couponPageUrl' -n

curl -fsSL 'https://makoban.github.io/yuukichiya-line-demo/app.js?verify=handoff' \
  | rg 'liff.login|withLoginOnExternalBrowser|screenFromLiffState|normalizeScreenName|isInClient' -n
```

Expected current public code:

- `index.html` references `20260613-line-browser-fix`.
- `config.js` rich-menu URLs reference `20260613-line-browser-fix`.
- `app.js` contains `screenFromLiffState` and `normalizeScreenName`.
- `app.js` should not contain `liff.login`.

## API default rich-menu check

Do not print secrets.

```bash
TOKEN='short-lived-channel-access-token'

curl -sS -w '\nHTTP:%{http_code}\n' \
  -H "Authorization: Bearer $TOKEN" \
  'https://api.line.me/v2/bot/user/all/richmenu'
```

If it returns 200 with `richMenuId`, an API default is active and may override Official Account Manager.

If the plan is to use Official Account Manager:

```bash
curl -sS -w '\nHTTP:%{http_code}\n' \
  -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  'https://api.line.me/v2/bot/user/all/richmenu'
```

Then re-run the GET and expect 404/not found.

For a specific user, only if `LINE_USER_ID` is known:

```bash
LINE_USER_ID='Uxxxxxxxx'

curl -sS -w '\nHTTP:%{http_code}\n' \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.line.me/v2/bot/user/${LINE_USER_ID}/richmenu"
```

If a per-user rich menu exists and should be removed:

```bash
curl -sS -w '\nHTTP:%{http_code}\n' \
  -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.line.me/v2/bot/user/${LINE_USER_ID}/richmenu"
```

## Desired final behavior

In the real LINE app:

1. Tap 会員情報.
   - It opens inside LINE browser.
   - Header/title shows 会員照会.
   - It does not become 採寸予約.
   - Back/close returns to LINE smoothly.
2. Tap ポイント.
   - It opens inside LINE browser.
   - Shows point QR/history.
3. Tap 採寸予約.
   - It opens inside LINE browser.
   - Shows reservation screen.
4. Tap 採寸記録.
   - It opens inside LINE browser.
   - Shows measurement records.
5. Tap クーポン.
   - It opens inside LINE browser.
   - Shows coupon screen.
6. Tap ECサイト.
   - Opens BASE/store preview as intentionally configured.

Do not mark the task done until this is verified on the user's phone.

## Acceptance criteria for Claude Code

- Actual current rich-menu action URLs are captured and documented.
- Actual LIFF endpoint setting is captured and documented.
- API default rich menu state is checked after any fix.
- Per-user rich-menu override is checked if user ID is available.
- Public GitHub Pages returns the intended app version.
- Phone/LINE real-flow verification passes for all relevant buttons.
- No LINE secrets are saved in repo, docs, screenshots, or shell history.
- If the fix requires a tradeoff between Official Account Manager and API-managed menu, explain it plainly and get owner approval before changing approach.

## Notes for explaining to the user

Use plain Japanese. The user is a beginner and is already frustrated.

Avoid saying "it should be fixed" unless phone verification passed.

Suggested wording:

```text
GitHub側のページ修正だけでは足りません。LINEで実際に出るメニューは、管理画面の保存値、Messaging APIのデフォルト、個別ユーザー紐付け、LIFF Endpointの4層で決まります。今回は実機でまだ同じ症状なので、次は実際にLINEが配っているリッチメニューURLを確認して、そこを直します。
```

## Files Claude Code should read first

1. `CLAUDE_CODE_PROJECT_SPEC.md`
2. `OFFICIAL_ACCOUNT_MANAGER_RICH_MENU.md`
3. `README.md`
4. `PRODUCTION_HANDOFF.md`
5. `config.js`
6. `app.js`
7. `scripts/release-rich-menu-to-official-manager.mjs`
8. `scripts/apply-rich-menu.mjs` only to understand what not to run normally

