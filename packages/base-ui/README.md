<p align="center">
  <img src="../../assets/hiraku-logo.svg" alt="hiraku" width="400" />
</p>

<p align="center">
  <b>hiraku</b> (開く, "to open") - Strongly typed, modal state management system for Base UI
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-base-ui"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-base-ui?style=flat&colorA=18181b&colorB=d946ef" alt="npm version" /></a>
  <a href="https://bundlephobia.com/result?p=@hirotoshioi/hiraku-base-ui"><img src="https://img.shields.io/bundlephobia/minzip/@hirotoshioi/hiraku-base-ui?style=flat&colorA=18181b&colorB=d946ef&label=bundle" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-base-ui"><img src="https://img.shields.io/npm/dt/@hirotoshioi/hiraku-base-ui?style=flat&colorA=18181b&colorB=d946ef" alt="downloads" /></a>
  <a href="https://github.com/hirotoshioi/hiraku/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirotoshioi/hiraku-base-ui?style=flat&colorA=18181b&colorB=d946ef" alt="license" /></a>
  <a href="https://deepwiki.com/HirotoShioi/hiraku"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

---

## Features

- ⚡ **Open from anywhere** - Call `modal.open()` from any file, even outside React components
- 🔒 **Type-safe** - Strongly typed
- 🎯 **Base UI native** - First-class support for Dialog, Sheet, and AlertDialog
- 🪶 **Lightweight** - Depends on `@hirotoshioi/hiraku-core` (zustand-based)

## Installation

```bash
npm install @hirotoshioi/hiraku-base-ui
```

Base UI is required as a peer dependency:

```bash
npm install @base-ui/react
```

## Quick Start

### 1. Add the Provider

```tsx
// app.tsx
import { ModalProvider } from "@hirotoshioi/hiraku-base-ui";

function App() {
  return (
    <>
      <YourApp />
      <ModalProvider />
    </>
  );
}
```

### 2. Create a modal

```tsx
// modals/confirm-dialog.tsx
import { Dialog } from "@base-ui/react/dialog";
import { createDialog } from "@hirotoshioi/hiraku-base-ui";

interface ConfirmDialogProps {
  title: string;
  message: string;
}

function ConfirmDialog({ title, message }: ConfirmDialogProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop />
      <Dialog.Popup>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{message}</Dialog.Description>

        <button onClick={() => void confirmDialog.close({ role: "cancel" })}>
          Cancel
        </button>
        <button onClick={() => void confirmDialog.close({ data: true, role: "confirm" })}>
          Confirm
        </button>
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();
```

### 3. Open from anywhere

```tsx
import { confirmDialog } from "./modals/confirm-dialog";

async function handleDelete() {
  // Open the modal and wait for the result
  const { data, role } = await confirmDialog.openAsync({
    title: "Delete item?",
    message: "This action cannot be undone.",
  });

  if (role === "confirm" && data) {
    // Perform delete
  }
}
```

## Examples

See the example app in this repository: `examples/base-ui/`.

## API

### Factory Functions

| Function                       | Description                               |
| ------------------------------ | ----------------------------------------- |
| `createDialog(Component)`      | Create a modal using Base UI Dialog       |
| `createSheet(Component)`       | Create a modal using Base UI (Dialog.Root)|
| `createAlertDialog(Component)` | Create a modal using Base UI AlertDialog  |

Built-in wrappers finish closing when Base UI reports the end of the exit animation, so `onDidClose()` resolves exactly when the animation ends. `exitDuration` (`<ModalProvider exitDuration={...} />` or `createDialog(Component, { exitDuration })`, default 300ms) only applies to custom wrapper components.

### Modal Controller

```tsx
const myModal = createDialog(MyComponent).returns<ResultType>();

myModal.openAsync(props)       // Open and wait for { data, role } when it closes
myModal.open(props)            // Open the modal (returns Promise<ModalRef>)
myModal.close({ data, role })  // Close the modal with result
myModal.onDidClose()           // Get Promise that resolves when closed
myModal.isOpen()               // Check if modal is open

// The ref returned by open()
const ref = await myModal.open(props);
ref.update(partialProps)       // Merge new props into the open modal
ref.result                     // Promise that resolves when this modal closes
```

### useModal Hook

```tsx
import { useModal } from "@hirotoshioi/hiraku-base-ui";

function MyComponent() {
  const modal = useModal(confirmDialog);

  return (
    <>
      <button onClick={() => modal.open({ title: "Hello", message: "World" })}>
        Open
      </button>
      <p>isOpen: {modal.isOpen}</p>
      <p>result: {JSON.stringify(modal.data)}</p>
      <p>role: {modal.role}</p>
    </>
  );
}
```

### useModalContext Hook

Inside a modal component, close the modal it is rendered in without importing its controller:

```tsx
import { useModalContext } from "@hirotoshioi/hiraku-base-ui";

function ConfirmDialog() {
  const modal = useModalContext<boolean>();

  return (
    <button onClick={() => modal.close({ data: true, role: "confirm" })}>
      Confirm
    </button>
  );
}
```

### Global Controller

```tsx
import { modalController } from "@hirotoshioi/hiraku-base-ui";

modalController.closeAll()    // Close all open modals
modalController.getCount()    // Get count of open modals
modalController.isOpen()      // Check if any modal is open
modalController.getTop()      // Get the topmost modal
```
