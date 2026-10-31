# createAlertDialog

Creates an alert dialog modal controller. Alert dialogs are used for important confirmations and cannot be dismissed by clicking outside.

## Signature

```tsx
function createAlertDialog<T extends ComponentType<any>>(
  component: T,
  options?: ModalOptions
): ModalController<T>;
```

## Usage

```tsx
import { createAlertDialog } from "@hirotoshioi/hiraku-radix-ui";

const myAlertDialog = createAlertDialog(MyAlertDialogComponent);
```

## With Return Type

```tsx
const myAlertDialog = createAlertDialog(MyAlertDialogComponent).returns<ResultType>();
```

## With Options

`options` is the same as for [createDialog](/docs/api/create-dialog#with-options):

```tsx
const myAlertDialog = createAlertDialog(MyAlertDialogComponent, { exitDuration: 200 });
```

## Controller Methods

Same as [createDialog](/docs/api/create-dialog):

- `openAsync(props)` - Opens the alert dialog and resolves with `{ data, role }` when it closes
- `open(props)` - Opens the alert dialog and returns a `ModalRef`
- `close(result?)` - Closes the alert dialog
- `onDidClose()` - Promise that resolves on close
- `isOpen()` - Check if alert dialog is open

## Difference from Dialog

| Feature                | Dialog          | AlertDialog             |
| ---------------------- | --------------- | ----------------------- |
| Click outside to close | ✅               | ❌                       |
| Press Escape to close  | ✅               | ❌                       |
| Use case               | General content | Important confirmations |

## Example

```tsx
import { createAlertDialog } from "@hirotoshioi/hiraku-radix-ui";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmProps {
  itemName: string;
}

function DeleteConfirmDialog({ itemName }: DeleteConfirmProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the item.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => deleteConfirm.close({ role: "cancel" })}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => deleteConfirm.close({ role: "confirm" })}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export const deleteConfirm = createAlertDialog(DeleteConfirmDialog);

// Usage
const result = await deleteConfirm.openAsync({ itemName: "Project Alpha" });

if (result.role === "confirm") {
  await deleteProject();
}
```
