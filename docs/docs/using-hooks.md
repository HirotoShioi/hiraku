# Using useModal Hook

The `useModal` hook provides a React-friendly way to interact with modals, with automatic cleanup on unmount.

## Basic Usage

```tsx
import { useModal } from "@hirotoshioi/hiraku-radix-ui";
import { confirmDialog } from "@/modals/confirm-dialog";

function MyComponent() {
  const modal = useModal(confirmDialog);

  return (
    <div>
      <p>Modal is {modal.isOpen ? "open" : "closed"}</p>
      <Button onClick={() => modal.open({ message: "Hello!" })}>
        Open Modal
      </Button>
    </div>
  );
}
```

## Hook Return Value

```tsx
const {
  isOpen,  // boolean - reactive open state
  open,    // (props) => Promise<void>
  close,   // (result?) => void
  data,    // T | undefined - current props
  role,    // ModalRole | undefined - close role
} = useModal(modalController);
```

## Reactive State

The hook provides reactive state that updates when the modal opens or closes:

```tsx
function StatusIndicator() {
  const { isOpen } = useModal(confirmDialog);

  return (
    <div className={isOpen ? "blur" : ""}>
      {isOpen && <LoadingSpinner />}
      <Content />
    </div>
  );
}
```

## Handling Results

```tsx
function DeleteButton({ itemId }: { itemId: string }) {
  const confirmModal = useModal(confirmDialog);

  const handleDelete = async () => {
    await confirmModal.open({
      title: "Delete Item",
      message: "Are you sure?",
    });

    // Wait for close
    const result = await confirmDialog.onDidClose();
    
    if (result.role === "confirm") {
      await deleteItem(itemId);
    }
  };

  return (
    <Button 
      onClick={handleDelete}
      disabled={confirmModal.isOpen}
    >
      Delete
    </Button>
  );
}
```

## Automatic Cleanup

When the component unmounts, any open modal from that hook instance will be automatically closed:

```tsx
function TemporaryComponent() {
  const modal = useModal(formDialog);

  useEffect(() => {
    modal.open({ /* ... */ });
    // Modal will be closed when component unmounts
  }, []);

  return <div>...</div>;
}
```

## Multiple Modals

You can use multiple modal hooks in the same component:

```tsx
function Dashboard() {
  const confirmModal = useModal(confirmDialog);
  const editModal = useModal(editDialog);
  const filterSheet = useModal(filterSheet);

  return (
    <div>
      <Button onClick={() => confirmModal.open({ message: "Confirm?" })}>
        Confirm
      </Button>
      <Button onClick={() => editModal.open({ itemId: "123" })}>
        Edit
      </Button>
      <Button onClick={() => filterSheet.open({ categories: ["a", "b"] })}>
        Filter
      </Button>
    </div>
  );
}
```

## When to Use the Hook vs Direct Controller

| Use Case                        | Recommendation          |
| ------------------------------- | ----------------------- |
| Opening from React components   | Either works            |
| Need reactive `isOpen` state    | Use `useModal` hook     |
| Opening from utilities/services | Use controller directly |
| Auto-close on unmount           | Use `useModal` hook     |
| Opening from event handlers     | Controller is simpler   |
