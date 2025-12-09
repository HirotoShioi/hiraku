# useModal

A React hook for using modal controllers with reactive state and automatic cleanup.

## Signature

```tsx
function useModal<T>(controller: ModalController<T>): UseModalReturn<T>;
```

## Usage

```tsx
import { useModal } from "@hirotoshioi/hiraku";
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
  open: (props: Props) => Promise<void>;  // Open the modal
  close: (result?: ModalResult<T>) => void;  // Close the modal
  data: Props | undefined;      // Current props
  role: ModalRole | undefined;  // Last close role
}
```

### isOpen

Reactive boolean that updates when the modal opens or closes.

```tsx
const { isOpen } = useModal(myDialog);

return (
  <div className={isOpen ? "blur-background" : ""}>
    <Content />
  </div>
);
```

### open(props)

Opens the modal with the given props. Same as `controller.open()`.

```tsx
const { open } = useModal(myDialog);

await open({ title: "Hello" });
```

### close(result?)

Closes the modal with an optional result. Same as `controller.close()`.

```tsx
const { close } = useModal(myDialog);

close({ role: "cancel" });
```

### data

The current props passed to the modal (if open).

```tsx
const { data } = useModal(myDialog);

if (data) {
  console.log("Modal opened with:", data);
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

The modal is automatically closed when the component unmounts:

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
    await editModal.open({ userId });
    
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
