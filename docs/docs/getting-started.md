# Getting Started

hiraku (開く, "to open") is a strongly typed modal state management library for React. It allows you to open modals from anywhere in your application—even outside React components—with full type safety.

## Installation

Choose an integration package:

::: code-group

```bash [Radix UI]
npm install @hirotoshioi/hiraku-radix-ui
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

```bash [Base UI]
npm install @hirotoshioi/hiraku-base-ui
npm install @base-ui/react
```

:::

::: tip
Already using `@hirotoshioi/hiraku`? It still works, but it’s deprecated and re-exports the Radix UI integration.
:::

For more details, see [Packages](/docs/packages).
## Quick Start

### 1. Add the Provider

Wrap your application with `ModalProvider`:

```tsx
// app.tsx
import { ModalProvider } from "@hirotoshioi/hiraku-radix-ui";

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
import { createDialog } from "@hirotoshioi/hiraku-radix-ui";
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

::: tip
This Quick Start uses the Radix UI integration. For Base UI, see the example app at `examples/base-ui/`.
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
- Pick an integration package: [Packages](/docs/packages)
- Explore [creating different types of modals](/docs/creating-modals)
- Check out the [API reference](/docs/api/create-dialog)
