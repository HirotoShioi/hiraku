---
name: getting-started
description: >
  Use when adding hiraku (@hirotoshioi/hiraku-radix-ui) to a React app that uses Radix UI or shadcn/ui dialogs: installing the package and its Radix peer dependencies, mounting ModalProvider, and writing the first modal component so it renders. Also use when a hiraku modal opens but nothing appears, or when a modal component throws a Radix context error. For opening modals and reading their results, use open-and-await-result.
metadata:
  purpose: Set up hiraku's Radix UI integration so that modals created with hiraku render, including the provider placement and the content-only component shape that hiraku requires.
  type: lifecycle
  library: '@hirotoshioi/hiraku-radix-ui'
  library_version: '0.0.6'
  framework: react
sources:
  - 'hirotoshioi/hiraku:packages/radix-ui/src/provider.tsx'
  - 'hirotoshioi/hiraku:packages/radix-ui/package.json'
  - 'hirotoshioi/hiraku:packages/radix-ui/tsdown.config.ts'
  - 'hirotoshioi/hiraku:docs/docs/getting-started.md'
  - 'hirotoshioi/hiraku:examples/radix-ui/src/App.tsx'
requires: []
---

# Set up hiraku with Radix UI

hiraku keeps modal state in a global store. `ModalProvider` reads that store and renders every open modal inside the matching Radix `Root`. Your modal component renders only what goes **inside** the Root.

## Setup

1. Install the integration and its Radix peers:

   ```bash
   npm install @hirotoshioi/hiraku-radix-ui @radix-ui/react-dialog @radix-ui/react-alert-dialog
   ```

   Both Radix packages are required peer dependencies (`^1.0.0`), even if you only use dialogs, because `ModalProvider` imports both. Result: `npm ls @radix-ui/react-dialog @radix-ui/react-alert-dialog` lists both.

2. Render `ModalProvider` exactly once, near the app root, next to your app (it takes no children):

   ```tsx
   // App.tsx
   import { ModalProvider } from "@hirotoshioi/hiraku-radix-ui";

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

3. Write a modal component that renders Radix **content parts only**, never `Dialog.Root`:

   ```tsx
   // modals/hello-dialog.tsx
   import * as Dialog from "@radix-ui/react-dialog";
   import { createDialog } from "@hirotoshioi/hiraku-radix-ui";

   function HelloDialog({ name }: { name: string }) {
   	return (
   		<Dialog.Portal>
   			<Dialog.Overlay className="fixed inset-0 bg-black/40" />
   			<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
   				<Dialog.Title>Hello, {name}</Dialog.Title>
   				<Dialog.Description>hiraku rendered this dialog.</Dialog.Description>
   				<button type="button" onClick={() => helloDialog.close({ role: "confirm" })}>
   					OK
   				</button>
   			</Dialog.Content>
   		</Dialog.Portal>
   	);
   }

   export const helloDialog = createDialog(HelloDialog);
   ```

   With shadcn/ui, render `DialogContent` (it already includes the portal and overlay) instead of `Dialog.Portal` + `Dialog.Content`.

4. Open it from anywhere: `await helloDialog.open({ name: "Ada" });`. Result: the title "Hello, Ada" is visible. Continue with open-and-await-result to handle the close result.

## Match the factory to the Radix primitives

`ModalProvider` chooses the Root from the factory you used:

| Factory | Root rendered by `ModalProvider` | Your component renders |
| --- | --- | --- |
| `createDialog` | `@radix-ui/react-dialog` `Root` | `Dialog.Portal` / `Dialog.Content` (shadcn `DialogContent`) |
| `createSheet` | `@radix-ui/react-dialog` `Root` | Dialog parts styled as a side panel (shadcn `SheetContent`) |
| `createAlertDialog` | `@radix-ui/react-alert-dialog` `Root` | `AlertDialog.Portal` / `AlertDialog.Content` (shadcn `AlertDialogContent`) |

A sheet is a styled dialog: hiraku does not provide sheet positioning or animation.

## Common Mistakes

### HIGH: Wrapping the component in `Dialog.Root`

```tsx
// Wrong: hiraku already renders the Root
function HelloDialog() {
	return (
		<Dialog.Root open>
			<Dialog.Content>…</Dialog.Content>
		</Dialog.Root>
	);
}
```

The nested Root has its own open state, so Escape, outside clicks, and `Dialog.Close` no longer close the hiraku modal and its close promise never resolves. Render content only, as in Setup step 3. Source: `packages/radix-ui/src/provider.tsx`, `docs/docs/getting-started.md`.

### HIGH: Mixing dialog content with an alert dialog factory

`createAlertDialog(Component)` renders `AlertDialog.Root`; a component that renders `Dialog.Content` (or shadcn `DialogContent`) then has no Dialog context and Radix throws a missing-context error. Use `AlertDialog.*` parts with `createAlertDialog`, and `Dialog.*` parts with `createDialog` and `createSheet`. Source: `getWrapperComponent` in `packages/radix-ui/src/provider.tsx`.

### HIGH: No provider, or a provider that unmounts

Calling `open()` without a mounted `ModalProvider` resolves normally but shows nothing until a provider mounts. Mounting the provider inside a route or conditional branch hides open modals while that branch is not rendered. Mount one provider at the root. Source: `packages/radix-ui/src/provider.tsx`.

## Completion

- The provider is rendered once at the root, and a test modal's content becomes visible after `open()`.
- Pressing Escape closes a `createDialog` modal; if it does not, look for a nested `Root` in the component.
- A context error from Radix means the factory and the primitives do not match.
