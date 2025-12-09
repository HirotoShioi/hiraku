# Getting Started

hiraku (開く, "to open") is a strongly typed modal state management library for Radix UI. It allows you to open modals from anywhere in your application—even outside React components—with full type safety.

## Installation

::: code-group

```bash [npm]
npm install @hirotoshioi/hiraku
```

```bash [pnpm]
pnpm add @hirotoshioi/hiraku
```

```bash [bun]
bun add @hirotoshioi/hiraku
```

```bash [yarn]
yarn add @hirotoshioi/hiraku
```

:::

### Peer Dependencies

hiraku requires Radix UI dialog primitives:

::: code-group

```bash [npm]
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

```bash [pnpm]
pnpm add @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

```bash [bun]
bun add @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

```bash [yarn]
yarn add @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

:::
## Quick Start

### 1. Add the Provider

Wrap your application with `ModalProvider`:

```tsx
// app.tsx
import { ModalProvider } from "@hirotoshioi/hiraku";

function App() {
  return (
    <>
      <YourApp />
      <ModalProvider/>
    </>
  );
}
```

### 2. Create a Modal

Create a modal component and its controller:

```tsx
// modals/confirm-dialog.tsx
import { createDialog } from "@hirotoshioi/hiraku";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  message: string;
}

function ConfirmDialog({ title, message }: ConfirmDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{message}</p>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => confirmDialog.close({ role: "cancel" })}
        >
          Cancel
        </Button>
        <Button
          onClick={() => confirmDialog.close({ data: true, role: "confirm" })}
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();
```

::: tip
You don't need to wrap your component with `Dialog.Root`—hiraku handles that automatically!
:::

### 3. Open the Modal

Now you can open the modal from anywhere:

```tsx
import { confirmDialog } from "./modals/confirm-dialog";

// Open the modal
await confirmDialog.open({
  title: "Delete Item",
  message: "Are you sure you want to delete this item?",
});

// Wait for the result
const result = await confirmDialog.onDidClose();

if (result.role === "confirm" && result.data) {
  // User confirmed
  deleteItem();
}
```

## What's Next?

- Learn [why hiraku](/docs/why-hiraku) was created 
- Explore [creating different types of modals](/docs/creating-modals)
- Check out the [API reference](/docs/api/create-dialog)