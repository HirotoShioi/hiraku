# Migration Guide

This guide explains how to migrate existing modals to hiraku.

## Basic Migration Pattern

### Before

```tsx
import * as Dialog from "@radix-ui/react-dialog";

function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <p>{message}</p>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>OK</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### After

Simply remove `Dialog.Root` and create a controller:

```tsx
import { createDialog } from "@hirotoshioi/hiraku-radix-ui";

function ConfirmDialog({ message }: { message: string }) {
  return (
    // Dialog.Root is not needed! hiraku wraps it automatically
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Confirm</Dialog.Title>
        <p>{message}</p>
        <button onClick={() => confirmDialog.close({ role: "cancel" })}>
          Cancel
        </button>
        <button onClick={() => confirmDialog.close({ data: true, role: "confirm" })}>
          OK
        </button>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();
```

::: tip
If you were using `@hirotoshioi/hiraku`, migrate to `@hirotoshioi/hiraku-radix-ui` (the old package name is deprecated).
:::

## Updating Usage Sites

### Before

```tsx
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          console.log("Confirmed");
          setIsOpen(false);
        }}
        message="Are you sure you want to delete?"
      />
    </>
  );
}
```

### After

```tsx
import { confirmDialog } from "./modals/confirm-dialog";

function App() {
  const handleClick = async () => {
    await confirmDialog.open({ message: "Are you sure you want to delete?" });
    const result = await confirmDialog.onDidClose();

    if (result.role === "confirm") {
      console.log("Confirmed");
    }
  };

  return <button onClick={handleClick}>Open</button>;
}
```

## Migration Steps

1. Add `<ModalProvider>` to the root of your app
2. Remove `Dialog.Root`
3. Create a controller with `createDialog()`
4. Remove `isOpen` / `onClose` props and use `controller.close()` instead
5. Remove `useState` from usage sites and import the controller
