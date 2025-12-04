# Why hiraku?

## The Problem

Managing modals in React applications often leads to:

### 1. Scattered State

```tsx
// ❌ State scattered across components
function ParentComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  return (
    <>
      <ChildComponent onOpenModal={(data) => {
        setModalData(data);
        setIsOpen(true);
      }} />
      <Modal open={isOpen} onClose={() => setIsOpen(false)} data={modalData} />
    </>
  );
}
```

### 2. Prop Drilling

```tsx
// ❌ Passing modal handlers through multiple layers
<GrandParent>
  <Parent onOpenModal={handleOpen}>
    <Child onOpenModal={handleOpen}>
      <Button onClick={onOpenModal}>Open</Button>
    </Child>
  </Parent>
</GrandParent>
```

### 3. Complex Result Handling

```tsx
// ❌ Callbacks and complex state for handling results
const [result, setResult] = useState(null);

<ConfirmDialog
  onConfirm={() => setResult(true)}
  onCancel={() => setResult(false)}
/>
```

## The Solution

hiraku solves these problems by providing a simple, type-safe API:

### 1. Centralized Controllers

```tsx
// ✅ Create a modal controller once
export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();

// Use it anywhere
await confirmDialog.open({ title: "Confirm" });
```

### 2. No Prop Drilling

```tsx
// ✅ Import and use directly
import { confirmDialog } from "@/modals/confirm-dialog";

function DeepNestedComponent() {
  const handleDelete = async () => {
    await confirmDialog.open({ message: "Delete?" });
    const result = await confirmDialog.onDidClose();
    // ...
  };
}
```

### 3. Promise-based Results

```tsx
// ✅ Async/await for clean flow
const result = await confirmDialog.onDidClose();
if (result.role === "confirm") {
  await deleteItem();
}
```

## Key Benefits

| Feature                 | Traditional | hiraku   |
| ----------------------- | ----------- | -------- |
| Open from outside React | ❌           | ✅        |
| Type-safe props         | Partial     | ✅ Full   |
| Type-safe return values | ❌           | ✅        |
| No prop drilling        | ❌           | ✅        |
| Works with shadcn/ui    | Manual      | ✅ Native |

## When to Use hiraku

hiraku is ideal for:

- ✅ Confirmation dialogs
- ✅ Form modals with return values
- ✅ Alert dialogs
- ✅ Sheet/drawer components
- ✅ Any modal that needs to be opened from multiple places

## Comparison with Alternatives

### vs. React Context

- hiraku: No context provider needed for each modal
- hiraku: Works outside React components

### vs. Global State (Redux, Zustand)

- hiraku: Purpose-built for modals
- hiraku: Less boilerplate
- hiraku: Type inference for props and results

### vs. Imperative Libraries

- hiraku: Native Radix UI support
- hiraku: shadcn/ui compatible
- hiraku: Full TypeScript support
