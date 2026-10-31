# useModal

A React hook for using modal controllers with reactive state and automatic cleanup.

## Signature

```tsx
function useModal<T>(controller: ModalController<T>): UseModalReturn<T>;
```

## Usage

```tsx
import { useModal } from "@hirotoshioi/hiraku-radix-ui";
import { confirmDialog } from "@/modals/confirm-dialog";

function MyComponent() {
  const modal = useModal(confirmDialog);

  return (
    <button onClick={() => modal.open({ message: "Hello!" })}>
      Open ({modal.isOpen ? "open" : "closed"})
    </button>
  );
}
```

## Return Value

```tsx
interface UseModalReturn<T> {
  isOpen: boolean;              // Reactive open state
  open: (props: Props) => void;  // Open the modal
  close: (result?: ModalResult<T>) => Promise<boolean>;  // Close the modal
  data: T | null;               // Data from the last close
  role: ModalRole | null;       // Role from the last close
}
```

### isOpen

Reactive boolean that becomes `true` when this hook's `open()` runs and `false` after the modal finishes closing. Opens made outside this hook (for example `controller.open()`) are not tracked.

```tsx
const { isOpen } = useModal(myDialog);

return (
  <div className={isOpen ? "blur-background" : ""}>
    <Content />
  </div>
);
```

### open(props)

Opens the modal with the given props and tracks it in this hook's state. It does nothing while the modal is open and does not return a promise; use `controller.onDidClose()` to await the result.

```tsx
const { open } = useModal(myDialog);

open({ title: "Hello" });
```

### close(result?)

Closes the modal with an optional result and resolves `false` when nothing is open. Same as `controller.close()`.

```tsx
const { close } = useModal(myDialog);

close({ role: "cancel" });
```

### data

The `data` passed to `close()` when the modal last closed. `null` until then, and reset to `null` on the next `open()`.

```tsx
const { data } = useModal(myDialog);

if (data) {
  console.log("Modal returned:", data);
}
```

### role

The role from the last close event.

```tsx
const { role } = useModal(myDialog);

useEffect(() => {
  if (role === "confirm") {
    // Handle confirmation
  }
}, [role]);
```

## Auto-Cleanup

A modal opened through this hook is closed automatically when the component unmounts. A modal opened elsewhere (by the controller or another component) stays open:

```tsx
function TemporaryEditor() {
  const modal = useModal(editorDialog);

  useEffect(() => {
    modal.open({ documentId: "123" });
    // Modal will close when component unmounts
  }, []);

  return <div>Editing...</div>;
}
```

## Example: Form with Confirmation

```tsx
function EditProfileButton({ userId }: { userId: string }) {
  const editModal = useModal(editProfileDialog);

  const handleEdit = async () => {
    editModal.open({ userId });

    const result = await editProfileDialog.onDidClose();
    
    if (result.role === "confirm" && result.data) {
      await updateProfile(userId, result.data);
      toast.success("Profile updated!");
    }
  };

  return (
    <Button 
      onClick={handleEdit} 
      disabled={editModal.isOpen}
    >
      {editModal.isOpen ? "Editing..." : "Edit Profile"}
    </Button>
  );
}
```
