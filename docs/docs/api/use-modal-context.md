# useModalContext

A React hook for use inside a modal component. It gives access to the modal the component is rendered in, so the modal can close itself without importing its controller.

## Signature

```tsx
function useModalContext<TResult = unknown>(): ModalContextValue<TResult>;
```

## Usage

```tsx
import { useModalContext } from "@hirotoshioi/hiraku-radix-ui";

function ConfirmDialog({ message }: { message: string }) {
  const modal = useModalContext<boolean>();

  return (
    <DialogContent>
      <p>{message}</p>
      <button onClick={() => modal.close({ data: false, role: "cancel" })}>
        Cancel
      </button>
      <button onClick={() => modal.close({ data: true, role: "confirm" })}>
        OK
      </button>
    </DialogContent>
  );
}
```

## Return Value

```tsx
interface ModalContextValue<TResult> {
  id: string;           // ID of the modal this component is rendered in
  isClosing: boolean;   // Whether the close animation is playing
  close: (result?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
}
```

### id

The ID of the modal. Same as `ref.id` from `controller.open()`.

### isClosing

Reactive boolean that becomes `true` once the modal starts closing and stays `true` until it is removed. Useful for disabling buttons during the close animation.

```tsx
const { isClosing } = useModalContext();

return <button disabled={isClosing}>Save</button>;
```

### close(result?)

Closes the modal this component is rendered in. Resolves `false` if it is already closing.

```tsx
const { close } = useModalContext<string>();

close({ data: "saved", role: "confirm" });
```

## Reusing a Component

Because the component does not reference a controller, the same component can be used by several controllers:

```tsx
export const deleteConfirm = createAlertDialog(ConfirmDialog).returns<boolean>();
export const discardConfirm = createAlertDialog(ConfirmDialog).returns<boolean>();

const { data } = await deleteConfirm.openAsync({ message: "Delete this item?" });
```

## Errors

`useModalContext()` throws if it is called outside a modal rendered by `ModalProvider`:

```
useModalContext must be used inside a modal rendered by ModalProvider.
```
