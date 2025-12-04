# createDialog

Creates a dialog modal controller.

## Signature

```tsx
function createDialog<T extends ComponentType<any>>(
  component: T
): ModalController<T>;
```

## Usage

```tsx
import { createDialog } from "@hirotoshioi/hiraku";

const myDialog = createDialog(MyDialogComponent);
```

## With Return Type

```tsx
const myDialog = createDialog(MyDialogComponent).returns<ResultType>();
```

## Controller Methods

### open(props)

Opens the modal with the given props.

```tsx
await myDialog.open({ title: "Hello" });
```

**Parameters:**
- `props` - Component props (required if component has required props)

**Returns:** `Promise<void>` - Resolves when modal is presented

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

Returns a promise that resolves when the modal closes.

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
import { createDialog } from "@hirotoshioi/hiraku";
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
await greetingDialog.open({ name: "World" });
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
