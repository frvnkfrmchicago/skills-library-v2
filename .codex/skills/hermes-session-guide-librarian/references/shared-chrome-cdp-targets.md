# Shared Chrome CDP Target Triage

Use this when Frank says the browser is open but what he sees does not match what the agent reported, or when `browser_snapshot` appears to describe a side panel instead of the active page.

## Core lesson

Chrome on remote debugging port `9222` can expose multiple targets at once:

- `type: "page"` — the actual browser tab, usually the target the user means.
- `type: "webview"` — Chrome side panels such as Gemini in Chrome.
- `type: "browser_ui"` — omnibox/profile picker/top-chrome UI.
- `type: "iframe"` — embedded account/cookie frames under a page.
- `service_worker` and `background_page` — extension/runtime internals.

A normal accessibility snapshot can attach to or surface the wrong visible target, especially a Gemini side panel webview, while the real tab target is still on the requested URL.

## Verification workflow

1. If user says they do not see the page, do not argue from the snapshot alone.
2. Call `Target.getTargets` through CDP.
3. Find the `type: "page"` target with the expected title or URL.
4. Separately note side-panel `webview` targets and browser UI targets so the report is precise.
5. If navigation is needed, call `Page.navigate` against the specific `target_id` of the `type: "page"` target.
6. Reply with the split: main tab URL/title vs side panel/webview contents.

## Reporting pattern

Use concise wording:

```text
I see two Chrome targets:
- Main page tab: Google at https://www.google.com/...
- Side panel/webview: Gemini in Chrome at https://gemini.google.com/glic...

The snapshot latched onto the side panel, but the real page tab is Google.
```

## Pitfall

Do not say "I see X" without naming whether X is the main page tab, side panel/webview, browser UI, or iframe. Ambiguous target reporting confuses the user when their visible window differs from the snapshot.