<p align="center">
  <img src="../../assets/hiraku-logo.svg" alt="hiraku" width="400" />
</p>

<p align="center">
  <b>hiraku core</b> - Framework-agnostic, strongly typed modal state management (no UI primitives included)
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-core"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="npm version" /></a>
  <a href="https://bundlephobia.com/result?p=@hirotoshioi/hiraku-core"><img src="https://img.shields.io/bundlephobia/minzip/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef&label=bundle" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-core"><img src="https://img.shields.io/npm/dt/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="downloads" /></a>
  <a href="https://github.com/hirotoshioi/hiraku/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="license" /></a>
  <a href="https://deepwiki.com/HirotoShioi/hiraku"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#when-to-use-hiraku-core">When to use</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

---

## Features

- ⚡ **Open from anywhere** - Call `modal.open()` from any file, even outside React components
- 🔒 **Type-safe** - Strongly typed props + close results
- 🧩 **Framework-agnostic** - No Radix/Base UI dependency, bring your own primitives
- 🪶 **Lightweight** - Depends only on zustand (React is a peer dependency)

## When to use hiraku-core

Use `@hirotoshioi/hiraku-core` if you want to:

- build a custom integration for your own modal primitives/design system
- control how modal instances are rendered (portals, animations, stacking, etc.)

If you just want a ready-to-use provider, install an integration package instead:

- **Radix UI**: `@hirotoshioi/hiraku-radix-ui` (see `packages/radix-ui/`)
- **Base UI**: `@hirotoshioi/hiraku-base-ui` (see `packages/base-ui/`)

## Installation

```bash
npm install @hirotoshioi/hiraku-core
```

## Quick Start

`hiraku-core` does not ship a `ModalProvider`. To render modals, create a provider that:

1. reads `useModalStore((s) => s.modals)`
2. maps `modal.wrapper` (`"dialog" | "sheet" | "alert-dialog" | Component`) to your UI framework root component
3. renders `modal.component` with `modal.props`
4. calls `useModalStore((s) => s.close)` when `onOpenChange(false)` happens

For a complete reference implementation, see:

- `packages/radix-ui/src/provider.tsx`
- `packages/base-ui/src/provider.tsx`

## API

### Factory Functions

| Function                       | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `createDialog(Component)`      | Create a modal controller (default wrapper: dialog)  |
| `createSheet(Component)`       | Create a modal controller (wrapper: sheet)           |
| `createAlertDialog(Component)` | Create a modal controller (wrapper: alert-dialog)    |

### Modal Controller

API for controllers created by `createDialog` and other factories:

```tsx
import { createDialog } from "@hirotoshioi/hiraku-core";

const myModal = createDialog(MyComponent).returns<ResultType>();

myModal.open(props)            // Open the modal (returns Promise)
myModal.close({ data, role })  // Close the modal with result
myModal.onDidClose()           // Get Promise that resolves when closed
myModal.isOpen()               // Check if modal is open
```

### useModal Hook

```tsx
import { useModal } from "@hirotoshioi/hiraku-core";

function MyComponent() {
  const modal = useModal(myModal);
  return (
    <>
      <button onClick={() => modal.open()}>Open</button>
      <p>isOpen: {modal.isOpen}</p>
      <p>role: {modal.role}</p>
      <p>data: {JSON.stringify(modal.data)}</p>
    </>
  );
}
```

### Store / Global Controller

```tsx
import { modalController, useModalStore } from "@hirotoshioi/hiraku-core";

modalController.closeAll() // Close all open modals
modalController.getTop()   // Get the topmost modal instance

const modals = useModalStore((s) => s.modals);
```
