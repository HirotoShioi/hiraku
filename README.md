<p align="center">
  <img src="./assets/hiraku-logo.svg" alt="hiraku" width="400" />
</p>

<p align="center">
  <b>hiraku</b> (開く, "to open") - Strongly typed, modal state management system for Radix UI
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku?style=flat&colorA=18181b&colorB=d946ef" alt="npm version" /></a>
  <a href="https://bundlephobia.com/result?p=@hirotoshioi/hiraku"><img src="https://img.shields.io/bundlephobia/minzip/@hirotoshioi/hiraku?style=flat&colorA=18181b&colorB=d946ef&label=bundle" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku"><img src="https://img.shields.io/npm/dt/@hirotoshioi/hiraku?style=flat&colorA=18181b&colorB=d946ef" alt="downloads" /></a>
  <a href="https://github.com/hirotoshioi/hiraku/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirotoshioi/hiraku?style=flat&colorA=18181b&colorB=d946ef" alt="license" /></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a> •
  <a href="#why-hiraku">Why hiraku?</a>
</p>

---

## Features

- ⚡ **Open from anywhere** - Call `modal.open()` from any file, even outside React components 
- 🔒 **Type-safe** - Strongly typed
- 🎯 **Radix UI native** - First-class support for Dialog, Sheet, and AlertDialog
- 🪶 **Lightweight** - ~3KB gzipped, only zustand as dependency
- 🎨 **shadcn/ui ready** - Works seamlessly with your existing components
- 😃 **Migrate with ease** - Migrate your existing modals with minimal changes

## Installation

```bash
npm install @hirotoshioi/hiraku
```

Radix UI dialog primitives are required as peer dependencies:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

## Quick Start

### 1. Add the Provider

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

### 2. Create a modal

```tsx
// modals/confirm-dialog.tsx
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createDialog } from "@hirotoshioi/hiraku";

interface ConfirmDialogProps {
  title: string;
  message: string;
}

// No need to wrap with Dialog.Root, hiraku will take care of it
function ConfirmDialog({ title, message }: ConfirmDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{message}</p>
      <DialogFooter>
        <Button variant="outline" onClick={() => confirmDialog.close({ role: "cancel" })}>
          Cancel
        </Button>
        <Button onClick={() => confirmDialog.close({ data: true, role: "confirm" })}>
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Create a modal controller
export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();
```

### 3. Open from anywhere

```tsx
import { confirmDialog } from "./modals/confirm-dialog";

async function handleDelete() {
  // Open the modal and wait for it
  await confirmDialog.open({
    title: "Delete item?",
    message: "This action cannot be undone.",
  });

  const { data, role } = await confirmDialog.onDidClose();

  if (role === "confirm" && data) {
    // Perform delete
  }
}
```

## API

### Factory Functions

| Function                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `createDialog(Component)`      | Create a modal using Radix Dialog      |
| `createSheet(Component)`       | Create a modal using Radix Sheet       |
| `createAlertDialog(Component)` | Create a modal using Radix AlertDialog |

### Modal Controller

API for controllers created by `createDialog` and other factories:

```tsx
const myModal = createDialog(MyComponent).returns<ResultType>();

// Methods
myModal.open(props)            // Open the modal (returns Promise)
myModal.close({ data, role })  // Close the modal with result
myModal.onDidClose()           // Get Promise that resolves when closed
myModal.isOpen()               // Check if modal is open
```

### useModal Hook

React hook for using modals within components:

```tsx
import { useModal } from "@hirotoshioi/hiraku";

function MyComponent() {
  const modal = useModal(confirmDialog);

  return (
    <>
      <button onClick={() => modal.open({ title: "Hello" })}>
        Open
      </button>
      <p>isOpen: {modal.isOpen}</p>
      <p>result: {modal.data}</p>
      <p>role: {modal.role}</p>
    </>
  );
}
```

### Global Controller

```tsx
import { modalController } from "@hirotoshioi/hiraku";

modalController.closeAll()    // Close all open modals
modalController.getCount()    // Get count of open modals
modalController.isOpen()      // Check if any modal is open
modalController.getTop()      // Get the topmost modal
```

## shadcn/ui Integration

hiraku works seamlessly with shadcn/ui components. Just implement `Content` and below — hiraku manages the `Root` for you:

```tsx
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createSheet } from "@hirotoshioi/hiraku";

function MySheet({ title }: { title: string }) {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      {/* ... */}
    </SheetContent>
  );
}

export const mySheet = createSheet(MySheet);
```


## Why hiraku?

With traditional patterns, modal components are often controlled by their parent for open/close state. That tight coupling hurts readability and maintainability.

If you’ve built React apps, you’ve probably seen something like this:

```tsx
import { MyDialog } from "./MyDialog";
function Parent() {
  // Managing modal state in the parent makes the code cumbersome
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>
      {/* The Dialog has to receive isOpen from the parent */}
      <MyDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

The modal wants its open/close state managed by the parent, but doing so makes the parent code cumbersome.

### hiraku's Approach

hiraku resolves that dilemma. With hiraku, modals can be opened from anywhere in your application without needing to pass down state or handlers through props. This decouples modal logic from your component hierarchy, leading to cleaner and more maintainable code.

```tsx
import { myDialog } from "./modals/my-dialog";

function Parent() {
  // const [isOpen, setIsOpen] = useState(false); <-- No need to manage state!
  return (
    <>
      <button onClick={() => myDialog.open()}>
        Open Dialog
      </button>
    </>
  );
}
```


## License

MIT © [Hirot Shioi](https://github.com/hirotoshioi)
