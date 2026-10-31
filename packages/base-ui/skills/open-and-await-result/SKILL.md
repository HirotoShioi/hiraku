---
name: open-and-await-result
description: >
  Use when building a dialog, sheet, or alert dialog with hiraku (@hirotoshioi/hiraku-base-ui) and opening it from any code, including event handlers, services, or other modals outside React; when closing it with returned data and a role such as confirm or cancel; or when awaiting a typed result, for example "ask the user to confirm before deleting" or "return the form values from a dialog". For reactive open state inside a component, unmount cleanup, or closing every modal, use modal-state-in-components.
metadata:
  purpose: Create typed hiraku modal controllers and use their promise-based openAsync, open, close, and onDidClose API to get a typed result and close reason back from a modal.
  type: core
  library: '@hirotoshioi/hiraku-base-ui'
  library_version: '0.0.6'
sources:
  - 'hirotoshioi/hiraku:packages/core/src/factory/index.ts'
  - 'hirotoshioi/hiraku:packages/core/src/factory/types.ts'
  - 'hirotoshioi/hiraku:packages/core/src/store/index.ts'
  - 'hirotoshioi/hiraku:packages/core/src/shared/types.ts'
  - 'hirotoshioi/hiraku:packages/core/src/context/index.ts'
  - 'hirotoshioi/hiraku:packages/base-ui/src/provider.tsx'
  - 'hirotoshioi/hiraku:docs/docs/opening-closing.md'
  - 'hirotoshioi/hiraku:docs/docs/return-values.md'
requires:
  - getting-started
---

# Open a hiraku modal and await its result

Requires a mounted `ModalProvider` and a content-only modal component; read getting-started first if either is missing.

## Setup

Create the controller once, at module level, next to the component. Chain `.returns<T>()` to type the data the modal returns, and export the value it returns:

```tsx
// modals/confirm-delete.tsx
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { createAlertDialog } from "@hirotoshioi/hiraku-base-ui";

interface ConfirmDeleteProps {
	itemName: string;
}

function ConfirmDelete({ itemName }: ConfirmDeleteProps) {
	return (
		<AlertDialog.Portal>
			<AlertDialog.Backdrop className="fixed inset-0 bg-black/40" />
			<AlertDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
				<AlertDialog.Title>Delete {itemName}?</AlertDialog.Title>
				<AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
				<button type="button" onClick={() => confirmDelete.close({ role: "cancel" })}>
					Cancel
				</button>
				<button type="button" onClick={() => confirmDelete.close({ data: true, role: "confirm" })}>
					Delete
				</button>
			</AlertDialog.Popup>
		</AlertDialog.Portal>
	);
}

export const confirmDelete = createAlertDialog(ConfirmDelete).returns<boolean>();
```

Choose `createDialog` for general content, `createSheet` for side panels, and `createAlertDialog` for confirmations that should not close on an outside click. Props are inferred from the component: `open()` requires its argument when any prop is required, accepts an optional one when all props are optional, and takes none when there are no props.

## Core Patterns

### Open and await the result

```ts
import { confirmDelete } from "./modals/confirm-delete";

export async function deleteItem(id: string, name: string) {
	const { data, role } = await confirmDelete.openAsync({ itemName: name });
	if (role !== "confirm" || data !== true) return;
	await fetch(`/api/items/${id}`, { method: "DELETE" });
}
```

`openAsync()` resolves with `{ data, role }` after the modal closes and Base UI reports that its close animation has ended. This works in any module; no hook or component is required.

### Keep a reference to the opened modal

`open()` resolves with a ref to the modal it opened, as soon as the modal is added to the store:

```ts
const ref = await uploadDialog.open({ progress: 0 });
ref.update({ progress: 50 }); // merges into the current props
const { data, role } = await ref.result;
```

`ref.result` belongs to that one modal, so reopening the controller does not change it. `controller.onDidClose()` after `open()` also works and resolves with the result of the modal the controller currently tracks.

### Close with data and a role

Call `close` on the same controller from inside the modal or from anywhere else:

```ts
await confirmDelete.close({ data: true, role: "confirm" });
```

Inside the modal component, `useModalContext<T>()` closes the modal it is rendered in without importing the controller, so one component can serve several controllers:

```tsx
import { useModalContext } from "@hirotoshioi/hiraku-base-ui";

function ConfirmDelete({ itemName }: ConfirmDeleteProps) {
	const modal = useModalContext<boolean>();
	// ...
	<button type="button" onClick={() => modal.close({ data: true, role: "confirm" })}>
		Delete
	</button>;
}
```

It also returns `isClosing`, and throws when called outside a modal rendered by `ModalProvider`.

- `role` is `"confirm" | "cancel" | "dismiss"` or any custom string. When omitted, it is `"dismiss"`.
- Escape, an outside click, or a Base UI `Close` part closes the modal with `{ role: "dismiss" }` and no data.
- `close()` resolves `false` when this controller has nothing open or the modal is already closing.

### Branch on the role and data together

`data` is typed `T | undefined`, because dismissal and `close()` without data return none. Check the role you expect and the data before using it:

```ts
import type { ModalResult } from "@hirotoshioi/hiraku-base-ui";

interface Profile {
	name: string;
}

function handleResult(result: ModalResult<Profile>, saveProfile: (p: Profile) => void) {
	switch (result.role) {
		case "confirm":
			if (result.data) saveProfile(result.data);
			break;
		case "cancel":
		case "dismiss":
			break;
	}
}
```

### Chain modals

A modal can open another modal and await it before closing itself; the second one stacks on top:

```tsx
const handleSubmit = async (profile: Profile) => {
	await savedAlert.openAsync();
	await editProfileDialog.close({ data: profile, role: "confirm" });
};
```

## Common Mistakes

### HIGH: Calling onDidClose before open

```ts
// Wrong: resolves {} immediately
const resultPromise = confirmDelete.onDidClose();
await confirmDelete.open({ itemName: "Report" });
```

Before `open()`, the controller has no instance, so `onDidClose()` resolves `{}` right away and the code proceeds as if the user had answered. Use `openAsync()`, or call `open()` first and then `onDidClose()`. Source: `onDidClose` in `packages/core/src/factory/index.ts`.

### HIGH: Treating the resolved open() as the answer

`await modal.open(...)` only means the modal is shown; it resolves with a ref, not with the answer. Code that acts after `open()` without awaiting `ref.result` or `onDidClose()` runs before the user responds. Use `openAsync()` when you only need the answer. Source: `open` in `packages/core/src/factory/index.ts`.

### HIGH: Creating the controller inside a component

```tsx
// Wrong: a new controller on every render
function Toolbar() {
	const dialog = createDialog(EditDialog);
	return <button onClick={() => dialog.open()}>Edit</button>;
}
```

Each controller tracks only the instance it opened. After a re-render, `close()` and `onDidClose()` on the new controller do not see the open modal (`close()` resolves `false`, `onDidClose()` resolves `{}`). Define controllers at module level and import them. Source: `createController` in `packages/core/src/factory/index.ts`.

### HIGH: Discarding the value returned by `.returns<T>()`

`.returns<T>()` returns a new controller; it does not modify the original. Export the result (`export const x = createDialog(C).returns<T>()`), and call `open`, `close`, and `onDidClose` on that same export everywhere.

### MEDIUM: Expecting a second open() to replace props

Each controller holds one modal. While it is open, another `open()` call resolves with the open modal's ref without changing props or adding a modal, and `openAsync()` resolves with the first modal's result. Use `ref.update()` to change the props of the open modal. Close the modal first, or use a separate controller for a modal that must appear twice. While the close animation is still running, `open()` creates a new instance. Source: `open` in `packages/core/src/factory/index.ts`.

## Completion

- `openAsync()` (or `open()` then `onDidClose()`) resolves with the `role` and `data` passed to `close()`.
- Escape on a dialog resolves `{ role: "dismiss" }` with `data` undefined.
- TypeScript rejects `open()` when a required prop is missing.
- If `onDidClose()` resolves immediately with `{}`, check that `open()` was called first on the same module-level controller.
