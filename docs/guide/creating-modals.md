# Creating Modals

hiraku supports three types of modals: **Dialog**, **Sheet**, and **AlertDialog**. Each has its own factory function.

## Dialog

The most common modal type. Use for forms, confirmations, and general content.

```tsx
import { createDialog } from "@hirotoshioi/hiraku";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EditUserProps {
  userId: string;
  initialName: string;
}

function EditUserDialog({ userId, initialName }: EditUserProps) {
  const [name, setName] = useState(initialName);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
      </DialogHeader>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => editUserDialog.close({ data: name })}>
        Save
      </button>
    </DialogContent>
  );
}

export const editUserDialog = createDialog(EditUserDialog).returns<string>();
```

## Sheet

A slide-out panel from the edge of the screen. Great for navigation, filters, or detailed views.

```tsx
import { createSheet } from "@hirotoshioi/hiraku";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterSheetProps {
  categories: string[];
}

function FilterSheet({ categories }: FilterSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
      </SheetHeader>
      {categories.map((cat) => (
        <Checkbox
          key={cat}
          checked={selected.includes(cat)}
          onChange={() => toggle(cat)}
        />
      ))}
      <button onClick={() => filterSheet.close({ data: selected })}>
        Apply
      </button>
    </SheetContent>
  );
}

export const filterSheet = createSheet(FilterSheet).returns<string[]>();
```

## AlertDialog

For important confirmations that require user attention. Cannot be dismissed by clicking outside.

```tsx
import { createAlertDialog } from "@hirotoshioi/hiraku";
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

function DeleteConfirm({ itemName }: DeleteConfirmProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => deleteConfirm.close({ role: "cancel" })}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction onClick={() => deleteConfirm.close({ role: "confirm" })}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export const deleteConfirm = createAlertDialog(DeleteConfirm);
```

## No Props? No Problem

If your modal doesn't need props, you can omit them:

```tsx
function SimpleDialog() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Hello!</DialogTitle>
      </DialogHeader>
    </DialogContent>
  );
}

export const simpleDialog = createDialog(SimpleDialog);

// Open without arguments
await simpleDialog.open();
```

## Type Safety

hiraku automatically infers prop types:

```tsx
// Props are required
editUserDialog.open({ userId: "1", initialName: "John" }); // ✅
editUserDialog.open({ userId: "1" }); // ❌ Missing initialName

// No props needed
simpleDialog.open(); // ✅
simpleDialog.open({}); // ✅
```
