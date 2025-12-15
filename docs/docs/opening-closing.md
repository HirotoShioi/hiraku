# Opening & Closing Modals

## Opening Modals

### Basic Usage

```tsx
import { confirmDialog } from "@/modals/confirm-dialog";

// Open with props
await confirmDialog.open({
  title: "Confirm Action",
  message: "Are you sure?",
});
```

### From Event Handlers

```tsx
function DeleteButton({ itemId }: { itemId: string }) {
  const handleClick = async () => {
    await confirmDialog.open({
      title: "Delete item",
      message: "Delete this item?",
    });
    const result = await confirmDialog.onDidClose();

    if (result.role === "confirm") {
      await deleteItem(itemId);
    }
  };

  return <Button onClick={handleClick}>Delete</Button>;
}
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

### From Outside the Modal

```tsx
// Close a specific modal
myDialog.close();

// Close with data
myDialog.close({ data: someValue, role: "confirm" });
```

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
const result = await myDialog.onDidClose();

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
