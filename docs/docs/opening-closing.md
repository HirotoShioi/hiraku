# Opening & Closing Modals

## Opening Modals

### Basic Usage

```tsx
import { confirmDialog } from "@/modals/confirm-dialog";

// Open and wait for the user's answer
const { data, role } = await confirmDialog.openAsync({
  title: "Confirm Action",
  message: "Are you sure?",
});
```

`openAsync()` opens the modal and resolves with `{ data, role }` once it has closed. This is the recommended way to get a result.

### From Event Handlers

```tsx
function DeleteButton({ itemId }: { itemId: string }) {
  const handleClick = async () => {
    const result = await confirmDialog.openAsync({
      title: "Delete item",
      message: "Delete this item?",
    });

    if (result.role === "confirm") {
      await deleteItem(itemId);
    }
  };

  return <Button onClick={handleClick}>Delete</Button>;
}
```

### Working with the Modal Reference

`open()` resolves as soon as the modal is added (not when the user answers) and returns a `ModalRef` for that modal. Use it to update props while the modal is open, close it, or await its result:

```tsx
const ref = await uploadDialog.open({ progress: 0 });

ref.update({ progress: 50 }); // Merges into the current props
ref.isOpen(); // true

const { data, role } = await ref.result; // Resolves when this modal closes
```

If the controller's modal is already open, `open()` changes nothing and returns the reference of the modal that is already open.

`ref.result` is bound to that specific modal, so it is not affected if the same controller opens another modal later. `controller.onDidClose()` instead follows whichever modal the controller opened last.

### open() + onDidClose()

Opening and waiting separately still works:

```tsx
await confirmDialog.open({ title: "Delete item", message: "Delete this item?" });
const result = await confirmDialog.onDidClose();
```

### From Outside React

One of hiraku's key features is opening modals from anywhere:

```tsx
// utils/api.ts - Not a React component!
import { errorDialog } from "@/modals/error-dialog";

export async function fetchData() {
  try {
    const response = await fetch("/api/data");
    return response.json();
  } catch (error) {
    // Open modal from utility function
    await errorDialog.open({
      message: "Failed to fetch data",
      error: error.message,
    });
  }
}
```

## Closing Modals

### From Inside the Modal

```tsx
function MyDialog() {
  return (
    <DialogContent>
      <Button onClick={() => myDialog.close()}>
        Close
      </Button>
      <Button onClick={() => myDialog.close({ role: "confirm" })}>
        Confirm
      </Button>
      <Button onClick={() => myDialog.close({ data: "result", role: "confirm" })}>
        Save
      </Button>
    </DialogContent>
  );
}
```

A modal can also close itself without importing its controller by using [`useModalContext()`](/docs/api/use-modal-context). This lets the same component be used by several controllers:

```tsx
import { useModalContext } from "@hirotoshioi/hiraku-radix-ui";

function MyDialog() {
  const modal = useModalContext<string>();

  return (
    <DialogContent>
      <Button onClick={() => modal.close({ data: "result", role: "confirm" })}>
        Save
      </Button>
    </DialogContent>
  );
}
```

### From Outside the Modal

```tsx
// Close a specific modal
myDialog.close();

// Close with data
myDialog.close({ data: someValue, role: "confirm" });

// Close through a reference returned by open()
ref.close({ role: "cancel" });
```

### When a Modal Is Removed

After `close()`, the modal stays mounted while its close animation plays, then it is removed and `openAsync()`, `ref.result` and `onDidClose()` resolve:

- **Base UI** - built-in wrappers (dialog, sheet, alert dialog) finish when Base UI reports the end of the exit animation, whatever its length.
- **Radix UI** - Radix has no completion event, so hiraku waits `exitDuration` ms (default `300`). Set it on [`ModalProvider`](/docs/api/modal-provider#exitduration) or per modal with `createDialog(Component, { exitDuration })`.

### Close All Modals

```tsx
import { modalController } from "@hirotoshioi/hiraku-radix-ui";

// Close all open modals
modalController.closeAll();
```

## Roles

Roles help distinguish how the modal was closed:

| Role          | Description                                           |
| ------------- | ----------------------------------------------------- |
| `"confirm"`   | User confirmed the action                             |
| `"cancel"`    | User cancelled the action                             |
| `"dismiss"`   | Modal was dismissed (clicked outside, pressed Escape) |
| Custom string | Any custom role you define                            |

```tsx
const result = await myDialog.openAsync();

switch (result.role) {
  case "confirm":
    // Handle confirmation
    break;
  case "cancel":
    // Handle cancellation
    break;
  case "dismiss":
    // Handle dismissal
    break;
}
```

## Checking Modal State

```tsx
// Check if a specific modal is open
if (confirmDialog.isOpen()) {
  console.log("Confirm dialog is open");
}

// Check if any modal is open
import { modalController } from "@hirotoshioi/hiraku-radix-ui";

if (modalController.isOpen()) {
  console.log("Some modal is open");
}

// Get the number of open modals
const count = modalController.getCount();
```
