# hiraku — Skill Spec

hiraku is a strongly typed modal state management library for React. Modal controllers created with `createDialog`, `createSheet`, and `createAlertDialog` can be opened from any code, and a single `ModalProvider` renders them inside Radix UI (`@hirotoshioi/hiraku-radix-ui`) or Base UI (`@hirotoshioi/hiraku-base-ui`) primitives. `@hirotoshioi/hiraku-core` holds the shared logic and is re-exported by both integrations.

## Domains

| Domain | Description | Skills |
| --- | --- | --- |
| setup | Installing an integration package and making hiraku modals render | getting-started |
| modals | Creating typed controllers, opening and closing them, reading results and state | open-and-await-result, modal-state-in-components |

## Skill Inventory

Each skill ships in both `packages/radix-ui/skills/` and `packages/base-ui/skills/` with the same name. The two copies differ only in imports, primitive part names, and peer dependencies.

| Skill | Type | Domain | What it covers | Failure modes |
| --- | --- | --- | --- | --- |
| getting-started | lifecycle | setup | install + peers, `ModalProvider` placement (incl. Next.js App Router), content-only components, factory-to-primitive mapping | 3 |
| open-and-await-result | core | modals | factories, `.returns<T>()`, `open` / `close` / `onDidClose` / `isOpen`, roles, chained modals | 5 |
| modal-state-in-components | framework | modals | `useModal`, unmount cleanup, `modalController`, store reset in tests | 3 |

## Failure Mode Inventory

### getting-started (3 active failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| --- | --- | --- | --- | --- |
| 1 | Wrapping the component in `Dialog.Root` | HIGH | `packages/*/src/provider.tsx` | — |
| 2 | Primitives that do not match the factory | HIGH | `getWrapperComponent` | — |
| 3 | No provider, or a conditionally mounted one | HIGH | `packages/*/src/provider.tsx` | — |
| — | `ModalProvider` in a Next.js Server Component | removed (fixed after 0.0.6) | built `dist/index.js` | — |

### open-and-await-result (5 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| --- | --- | --- | --- | --- |
| 1 | `onDidClose()` before `open()` | HIGH | `packages/core/src/factory/index.ts` | — |
| 2 | Treating resolved `open()` as the answer | HIGH | `packages/core/src/factory/index.ts` | — |
| 3 | Creating the controller inside a component | HIGH | `packages/core/src/factory/index.ts` | — |
| 4 | Discarding the `.returns<T>()` controller | HIGH | `packages/core/src/factory/index.ts` | — |
| 5 | Expecting a second `open()` to replace props | MEDIUM | `packages/core/src/factory/index.ts` | — |

### modal-state-in-components (3 active failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| --- | --- | --- | --- | --- |
| 1 | Expecting `useModal` state for opens made elsewhere | HIGH | `packages/core/src/hooks/index.ts` | open-and-await-result |
| 2 | `getTop().close({ data, role })` | HIGH | `packages/core/src/factory/types.ts` | — |
| 3 | Awaiting `closeAll()` as if modals were removed | MEDIUM | `packages/core/src/store/index.ts` | — |
| — | Unexpected close when a hook user unmounts | removed (fixed after 0.0.6) | `packages/core/src/hooks/index.ts` | — |

## Tensions

| Tension | Skills | Agent implication |
| --- | --- | --- |
| Hook state versus controller calls | open-and-await-result ↔ modal-state-in-components | Opening with `controller.open()` while rendering `useModal` state leaves `isOpen` false |

## Cross-References

| From | To | Reason |
| --- | --- | --- |
| open-and-await-result | getting-started | Modals render only with a mounted provider and content-only components |
| modal-state-in-components | open-and-await-result | The hook and `modalController` operate on module-level controllers |

## Remaining Gaps

| Skill | Question | Status |
| --- | --- | --- |
| getting-started | Should the build keep `"use client"` so Server Components can render `ModalProvider` directly? | resolved: yes, fixed in batch 2 |
| modal-state-in-components | Is closing on unmount of any `useModal` caller (not only the opener) intended? | resolved: no, fixed in batch 2 |

## Recommended Skill File Structure

- **Core skills:** open-and-await-result
- **Framework skills:** modal-state-in-components (React hook)
- **Lifecycle skills:** getting-started
- **Composition skills:** none yet
- **Reference files:** none yet

## Coverage and batch history

### Batch 1 — 2026-11-01, version 0.0.6

- **Assessed scope:** setup, creating/opening/closing modals with typed results, `useModal`, and `modalController` for both integrations. Not assessed: custom wrapper components (`ModalWrapperType` as a component), `ModalHandle.updateProps`, direct `useModalStore` use beyond test reset, the deprecated `@hirotoshioi/hiraku` package, and migration (`MIGRATION.md`).
- **Maintainer decisions:**
  - First batch is the three skills above (chosen over adding a migration skill or a single trial skill).
  - Skills ship with `@hirotoshioi/hiraku-radix-ui` and `@hirotoshioi/hiraku-base-ui`, the packages consumers install directly, instead of the transitive `@hirotoshioi/hiraku-core`. This duplicates shared guidance across the two packages in exchange for integration-accurate examples; keep the copies in sync when core behavior changes.
- **Evidence:** source at the commit after `fe4f0b3` (0.0.6): `packages/core/src/{factory,hooks,store,shared}`, `packages/core/src/modal-controller.ts`, `packages/{radix-ui,base-ui}/src/provider.tsx`, `docs/docs/*.md`, example apps, and the built `dist/index.js` (no `"use client"`).
- **Docs discrepancies found:** `docs/docs/using-hooks.md` describes `data` as "current props" and awaits the hook's `open()`; the source returns `void` from the hook's `open()` and `data` is the close result. Skills follow the source.
- **Task checks:** `examples/radix-ui/src/__tests__/skills.test.browser.tsx` and `examples/base-ui/src/__tests__/skills.test.browser.tsx` (16 cases each, all passing in Chromium). They assert recommended behavior and that each warned-about mistake behaves as described (nested Root ignores Escape, `onDidClose()` before `open()` resolves `{}`, a second controller cannot close the modal, hook state ignores outside opens, positional `getTop().close`, `closeAll()` timing).
- **Not automated:** the Radix missing-context error for mismatched primitives was observed during authoring (an alert-dialog component passed to `createDialog` threw `` `DialogPortal` must be used within `Dialog` ``), but Vitest reports the render error as unhandled, so no automated case exists. Base UI's behavior for mismatched primitives was not checked; its skill states only the matching rule.
- **Unverified:** discovery (whether agents load each skill from its description) and fresh-consumer runs were not performed.
- **Remaining work:** candidate next batch — migration from `@hirotoshioi/hiraku`, custom wrapper components, `updateProps`.

### Batch 2 — 2026-11-01, library fixes for the batch 1 gaps

- **Maintainer decisions:** fix all three issues found in batch 1 instead of documenting workarounds.
- **Library changes:**
  - `packages/{radix-ui,base-ui}/tsdown.config.ts` build with `unbundle: true`, so `dist/provider.js` keeps `"use client"` while `dist/index.js` (which has `export *` from core) stays a plain module. `scripts/assert-use-client.js` runs after each build and fails it when the directive is missing.
  - `useModal` closes on unmount only a modal opened through its own `open()` (`packages/core/src/hooks/index.ts`); two new unit tests fail on the old implementation and pass on the new one.
  - `docs/docs/using-hooks.md` and `docs/docs/api/use-modal.md` now describe `data`/`role` as the last close result (`null` before), the hook's `open()` as returning nothing, and the narrower unmount cleanup. This supersedes the batch 1 "docs discrepancies" note.
  - `biome.json` excludes `skills/**/*.md`, because Biome's Markdown formatter rewrites YAML frontmatter and breaks the skills.
- **Guidance updates:** getting-started drops the client-wrapper workaround and tells App Router users to render `ModalProvider` in `app/layout.tsx`; modal-state-in-components drops the unmount pitfall and describes the new cleanup rule. Both failure modes are kept in the domain map as `removed` with the reason.
- **Task checks:** the example `skills.test.browser.tsx` files now check that unmount closes a hook-opened modal and leaves a modal opened elsewhere open (17 cases each). Full example suites pass (45 each); core unit tests pass (56).
- **Unverified:** a real Next.js App Router render of `ModalProvider` from a Server Component was not run; the evidence is the directive in the built `dist/provider.js`.
