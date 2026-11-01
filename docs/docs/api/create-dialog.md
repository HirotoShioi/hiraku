# createDialog

Creates a dialog modal controller.

## Signature

```tsx
function createDialog<T extends ComponentType<any>>(
  component: T,
  options?: ModalOptions
): ModalController<T>;
```

**Parameters:**
- `component` - The modal component to render (props are inferred)
- `options.exitDuration` - Close animation duration in ms for this modal. Overrides `ModalProvider`'s `exitDuration`. Ignored by Base UI built-in wrappers, which detect the end of the animation themselves. See [ModalProvider](/docs/api/modal-provider#exitduration).

## Usage

```tsx
import { createDialog } from "@hirotoshioi/hiraku-radix-ui";

const myDialog = createDialog(MyDialogComponent);
```

## With Return Type

```tsx
const myDialog = createDialog(MyDialogComponent).returns<ResultType>();
```

## With Options

```tsx
const myDialog = createDialog(MyDialogComponent, { exitDuration: 200 }).returns<ResultType>();
```

Options are kept across `.returns<T>()`.

## Controller Methods

### openAsync(props)

Opens the modal and waits until it closes.

```tsx
const { data, role } = await myDialog.openAsync({ title: "Hello" });
```

**Parameters:**
- `props` - Component props (required if component has required props)

**Returns:** `Promise<ModalResult<T>>` - Resolves with `{ data, role }` after the modal has closed

### open(props)

Opens the modal with the given props.

```tsx
const ref = await myDialog.open({ title: "Hello" });
```

If this controller's modal is already open, nothing changes and the open modal's reference is returned.

**Parameters:**
- `props` - Component props (required if component has required props)

**Returns:** `Promise<ModalRef>` - Resolves as soon as the modal is added (not when it closes) with a reference to it:

```tsx
interface ModalRef<Props, T> {
  id: string;
  result: Promise<ModalResult<T>>;  // Resolves when this modal closes
  update: (props: Partial<Props>) => void;  // Merge new props into the current ones
  close: (result?: { data?: T; role?: ModalRole }) => Promise<boolean>;
  isOpen: () => boolean;
}
```

```tsx
const ref = await myDialog.open({ title: "Uploading", progress: 0 });
ref.update({ progress: 50 });
const { data, role } = await ref.result;
```

### close(result?)

Closes the modal with an optional result.

```tsx
myDialog.close();
myDialog.close({ role: "confirm" });
myDialog.close({ data: "result", role: "confirm" });
```

**Parameters:**
- `result.data` - Return value of type `T` (specified via `.returns<T>()`)
- `result.role` - How the modal was closed (`"confirm" | "cancel" | "dismiss" | string`)

### onDidClose()

Returns a promise that resolves when the modal closes. It waits for the modal this controller opened most recently; use `ref.result` to wait for a specific one. Resolves immediately with `{}` if the modal was never opened.

```tsx
const result = await myDialog.onDidClose();
// result: { data?: T, role?: ModalRole }
```

**Returns:** `Promise<ModalResult<T>>`

### isOpen()

Returns whether the modal is currently open.

```tsx
if (myDialog.isOpen()) {
  console.log("Modal is open");
}
```

**Returns:** `boolean`

## Example

```tsx
import { createDialog } from "@hirotoshioi/hiraku-radix-ui";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  name: string;
}

function GreetingDialog({ name }: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Hello, {name}!</DialogTitle>
      </DialogHeader>
      <button onClick={() => greetingDialog.close({ role: "confirm" })}>
        Close
      </button>
    </DialogContent>
  );
}

export const greetingDialog = createDialog(GreetingDialog);

// Usage
await greetingDialog.openAsync({ name: "World" });
```

## Type Inference

Props are automatically inferred from the component:

```tsx
// ✅ Type-safe
greetingDialog.open({ name: "World" });

// ❌ Type error: missing 'name'
greetingDialog.open({});

// ❌ Type error: unknown prop
greetingDialog.open({ name: "World", foo: "bar" });
```
