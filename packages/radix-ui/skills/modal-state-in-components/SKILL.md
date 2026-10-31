---
name: modal-state-in-components
description: >
  Use when a React component needs a hiraku (@hirotoshioi/hiraku-radix-ui) modal's open state or last result for rendering, such as disabling a button while a dialog is open or showing what the user chose; when a modal must close automatically as its component unmounts; or when closing, counting, or inspecting every open modal at once, for example on route change, logout, or in test setup. To create a modal or await its result from plain async code, use open-and-await-result.
metadata:
  purpose: Choose between the useModal hook, a modal controller, and the global modalController, and use each for reactive component state, unmount cleanup, and app-wide modal control.
  type: framework
  library: '@hirotoshioi/hiraku-radix-ui'
  library_version: '0.0.6'
  framework: react
sources:
  - 'hirotoshioi/hiraku:packages/core/src/hooks/index.ts'
  - 'hirotoshioi/hiraku:packages/core/src/hooks/types.ts'
  - 'hirotoshioi/hiraku:packages/core/src/modal-controller.ts'
  - 'hirotoshioi/hiraku:packages/core/src/store/index.ts'
  - 'hirotoshioi/hiraku:docs/docs/using-hooks.md'
  - 'hirotoshioi/hiraku:docs/docs/modal-controller.md'
requires:
  - open-and-await-result
---

# Use hiraku modal state in components

Read open-and-await-result first: this skill builds on a module-level controller such as `confirmDelete = createAlertDialog(ConfirmDelete).returns<boolean>()`.

## Choose the API

| Need | Use |
| --- | --- |
| Re-render when the modal opens or closes, or show the last result | `useModal(controller)` |
| Close the modal when the component that opened it unmounts | `useModal(controller)` |
| Open from a handler and act on the answer in the same function | the controller: `open()` then `onDidClose()` |
| Close, count, or inspect all modals | `modalController` |

## Core Patterns

### Render from the hook's state

```tsx
import { createAlertDialog, useModal } from "@hirotoshioi/hiraku-radix-ui";
import { ConfirmDelete } from "./modals/confirm-delete"; // ({ itemName }: { itemName: string }) => JSX

// Usually exported from the modal's module, as in open-and-await-result
const confirmDelete = createAlertDialog(ConfirmDelete).returns<boolean>();

export function DeleteButton() {
	const modal = useModal(confirmDelete);

	return (
		<>
			<button
				type="button"
				disabled={modal.isOpen}
				onClick={() => modal.open({ itemName: "Report" })}
			>
				Delete
			</button>
			{modal.role === "confirm" && modal.data === true && <p>Deleted</p>}
		</>
	);
}
```

- `modal.open(props)` takes the same props as the controller and returns nothing; it ignores calls while the modal is open.
- `modal.isOpen` becomes `true` when this hook's `open()` runs and `false` when the close finishes (after the 300 ms close delay).
- `modal.data` and `modal.role` are `null` until a close finishes, and reset to `null` on the next `open()`.
- `modal.close({ data, role })` is the controller's `close`.

### Act on the answer inside the handler

The hook's `open()` returns no promise. To await the answer in the same handler, call the controller directly:

```tsx
const handleDelete = async () => {
	await confirmDelete.open({ itemName: "Report" });
	const { role } = await confirmDelete.onDidClose();
	if (role === "confirm") await removeReport();
};
```

You can still call `useModal(confirmDelete)` in the same component for `isOpen`, but see the first mistake below.

### Close the modal on unmount

When a component that called `useModal(controller)` unmounts while that controller's modal is open, the hook closes it with role `"dismiss"`. Use this for modals that belong to one page or panel.

### Control every modal with modalController

```ts
import { modalController } from "@hirotoshioi/hiraku-radix-ui";

await modalController.closeAll(); // every modal closes with role "dismiss"
modalController.isOpen(); // any modal open (closing ones excluded)
modalController.getCount(); // number open (closing ones excluded)
const top = modalController.getTop(); // last added modal, or undefined
await top?.close(undefined, "cancel");
```

Close all modals on logout or route change:

```tsx
useEffect(() => {
	return () => {
		void modalController.closeAll();
	};
}, [pathname]);
```

### Reset modal state between tests

The store is global and outlives a test's render. Reset it before each test, and render the provider:

```tsx
import { ModalProvider, useModalStore } from "@hirotoshioi/hiraku-radix-ui";

beforeEach(() => {
	useModalStore.setState({ modals: [] });
	render(<ModalProvider />);
});
```

## Common Mistakes

### HIGH: Expecting useModal state for modals opened elsewhere

`useModal` tracks only opens made through its own `open()`. If the modal is opened with `controller.open()` or by another component, this hook's `isOpen` stays `false` and its `data`/`role` stay unchanged. Open through the hook whose state you render, or read `controller.isOpen()` when you need the current state without re-rendering. Source: `packages/core/src/hooks/index.ts`.

### HIGH: Calling getTop().close with an options object

`modalController.getTop()` returns a handle whose `close` takes positional arguments, unlike a controller:

```ts
// Wrong: stores the whole object as data, role becomes "dismiss"
await modalController.getTop()?.close({ data: 1, role: "confirm" });
// Correct
await modalController.getTop()?.close(1, "confirm");
```

Source: `ModalHandle` in `packages/core/src/factory/types.ts`.

### MEDIUM: Awaiting closeAll() as if modals were gone

`closeAll()` resolves once every close has started. Modals stay in the store, marked as closing, for 300 ms, and `getTop()` can still return one. Use `isOpen()` or `getCount()`, which exclude closing modals, or await each controller's `onDidClose()`. Source: `close` and `closeAll` in `packages/core/src/store/index.ts`.

### MEDIUM: Unexpected close when a component unmounts

Unmount cleanup checks the controller, not the hook, so a component that only called `useModal(controller)` closes that modal on unmount even when another component opened it. Call `useModal` only in components whose lifetime should own the modal. Source: unmount effect in `packages/core/src/hooks/index.ts`.

## Completion

- The component re-renders with `isOpen === true` after the hook's `open()`, and back to `false` with `role` set after the modal closes.
- Unmounting the component closes its open modal.
- `modalController.isOpen()` returns `false` right after `closeAll()`.
