---
name: getting-started
description: >
  Use when adding hiraku (@hirotoshioi/hiraku-base-ui) to a React app that uses Base UI (@base-ui/react) or shadcn/ui on Base UI: installing the package and its peer dependency, mounting ModalProvider, and writing the first modal component so it renders. Also use when a hiraku modal opens but nothing appears, or when Escape and outside clicks do not close it. For opening modals and reading their results, use open-and-await-result.
metadata:
  purpose: Set up hiraku's Base UI integration so that modals created with hiraku render, including the provider placement and the content-only component shape that hiraku requires.
  type: lifecycle
  library: '@hirotoshioi/hiraku-base-ui'
  library_version: '0.0.6'
  framework: react
sources:
  - 'hirotoshioi/hiraku:packages/base-ui/src/provider.tsx'
  - 'hirotoshioi/hiraku:packages/base-ui/package.json'
  - 'hirotoshioi/hiraku:packages/base-ui/tsdown.config.ts'
  - 'hirotoshioi/hiraku:docs/docs/getting-started.md'
  - 'hirotoshioi/hiraku:examples/base-ui/src/App.tsx'
  - 'hirotoshioi/hiraku:examples/base-ui/src/components/examples/sample-dialog.tsx'
requires: []
---

# Set up hiraku with Base UI

hiraku keeps modal state in a global store. `ModalProvider` reads that store and renders every open modal inside the matching Base UI `Root`. Your modal component renders only what goes **inside** the Root.

## Setup

1. Install the integration and its Base UI peer:

   ```bash
   npm install @hirotoshioi/hiraku-base-ui @base-ui/react
   ```

   `@base-ui/react` (`^1.0.0`) is a required peer dependency. Result: `npm ls @base-ui/react` lists it.

2. Render `ModalProvider` exactly once, near the app root, next to your app (it takes no children):

   ```tsx
   // App.tsx
   import { ModalProvider } from "@hirotoshioi/hiraku-base-ui";

   export function App() {
   	return (
   		<>
   			<Routes />
   			<ModalProvider />
   		</>
   	);
   }
   ```

   With the Next.js App Router, render `<ModalProvider />` directly in `app/layout.tsx`; the provider module is a client component (`"use client"`), so a Server Component layout can render it.

   Result: the provider is mounted before any code calls `open()`. Modals opened while no provider is mounted stay in the store and appear only when a provider mounts.

3. Write a modal component that renders Base UI **content parts only**, never `Dialog.Root`:

   ```tsx
   // modals/hello-dialog.tsx
   import { Dialog } from "@base-ui/react/dialog";
   import { createDialog } from "@hirotoshioi/hiraku-base-ui";

   function HelloDialog({ name }: { name: string }) {
   	return (
   		<Dialog.Portal>
   			<Dialog.Backdrop className="fixed inset-0 bg-black/40" />
   			<Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
   				<Dialog.Title>Hello, {name}</Dialog.Title>
   				<Dialog.Description>hiraku rendered this dialog.</Dialog.Description>
   				<button type="button" onClick={() => helloDialog.close({ role: "confirm" })}>
   					OK
   				</button>
   			</Dialog.Popup>
   		</Dialog.Portal>
   	);
   }

   export const helloDialog = createDialog(HelloDialog);
   ```

   With shadcn/ui on Base UI, render `DialogContent` (it already includes the portal and backdrop) instead of `Dialog.Portal` + `Dialog.Popup`.

4. Open it from anywhere: `await helloDialog.open({ name: "Ada" });`. Result: the title "Hello, Ada" is visible. Continue with open-and-await-result to handle the close result.

## Match the factory to the Base UI primitives

`ModalProvider` chooses the Root from the factory you used:

| Factory | Root rendered by `ModalProvider` | Your component renders |
| --- | --- | --- |
| `createDialog` | `Dialog.Root` from `@base-ui/react/dialog` | `Dialog.Portal` / `Dialog.Popup` (shadcn `DialogContent`) |
| `createSheet` | `Dialog.Root` from `@base-ui/react/dialog` | Dialog parts styled as a side panel (shadcn `SheetContent`) |
| `createAlertDialog` | `AlertDialog.Root` from `@base-ui/react` | `AlertDialog.Portal` / `AlertDialog.Popup` (shadcn `AlertDialogContent`) |

A sheet is a styled dialog: hiraku does not provide sheet positioning or animation.

## Common Mistakes

### HIGH: Wrapping the component in `Dialog.Root`

```tsx
// Wrong: hiraku already renders the Root
function HelloDialog() {
	return (
		<Dialog.Root open>
			<Dialog.Portal>
				<Dialog.Popup>…</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
```

The nested Root has its own open state, so Escape, outside clicks, and `Dialog.Close` no longer close the hiraku modal and its close promise never resolves. Render content only, as in Setup step 3. Source: `packages/base-ui/src/provider.tsx`, `docs/docs/getting-started.md`.

### HIGH: Using the wrong primitives for the factory

Use `AlertDialog.*` parts with `createAlertDialog`, and `Dialog.*` parts with `createDialog` and `createSheet`, so the content matches the Root that `ModalProvider` renders. Source: `getWrapperComponent` in `packages/base-ui/src/provider.tsx`.

### HIGH: No provider, or a provider that unmounts

Calling `open()` without a mounted `ModalProvider` resolves normally but shows nothing until a provider mounts. Mounting the provider inside a route or conditional branch hides open modals while that branch is not rendered. Mount one provider at the root. Source: `packages/base-ui/src/provider.tsx`.

## Completion

- The provider is rendered once at the root, and a test modal's content becomes visible after `open()`.
- Pressing Escape closes a `createDialog` modal; if it does not, look for a nested `Root` in the component.
