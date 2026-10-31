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
  open,    // (props) => void
  close,   // (result?) => Promise<boolean>
  data,    // T | null - data from the last close
  role,    // ModalRole | null - role from the last close
} = useModal(confirmDialog);
```

`isOpen`, `data`, and `role` track opens made through this hook's `open()`. If the same modal is opened with `confirmDialog.open()` or from another component, this hook's state does not change.

`data` and `role` are `null` until the modal closes, and reset to `null` on the next `open()`.
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

  useEffect(() => {
    if (confirmModal.role === "confirm") {
      void deleteItem(itemId);
    }
  }, [confirmModal.role, itemId]);

  return (
    <Button
      onClick={() =>
        confirmModal.open({
          title: "Delete Item",
          message: "Are you sure?",
        })
      }
      disabled={confirmModal.isOpen}
    >
      Delete
    </Button>
  );
}
```

The hook's `open()` does not return a promise. To await the result in the same handler, call the controller instead:

```tsx
const handleDelete = async () => {
  await confirmDialog.open({ title: "Delete Item", message: "Are you sure?" });
  const result = await confirmDialog.onDidClose();

  if (result.role === "confirm") {
    await deleteItem(itemId);
  }
};
```

## Automatic Cleanup

When the component unmounts, a modal opened through that hook instance is closed automatically. Modals opened elsewhere stay open:

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
