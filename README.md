<p align="center">
  <img src="./assets/hiraku-logo.svg" alt="hiraku" width="400" />
</p>

<p align="center">
  <b>hiraku</b> (開く, "to open") - Strongly typed, modal state management system for React (Radix UI + Base UI)
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-radix-ui"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-radix-ui?style=flat&colorA=18181b&colorB=d946ef" alt="npm version (radix-ui)" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-base-ui"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-base-ui?style=flat&colorA=18181b&colorB=d946ef" alt="npm version (base-ui)" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-core"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="npm version (core)" /></a>
  <a href="https://github.com/hirotoshioi/hiraku/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirotoshioi/hiraku-radix-ui?style=flat&colorA=18181b&colorB=d946ef" alt="license" /></a>
  <a href="https://deepwiki.com/HirotoShioi/hiraku"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#packages">Packages</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#development">Development</a> •
  <a href="#why-hiraku">Why hiraku?</a>
</p>

---

## Features

- ⚡ **Open from anywhere** - Call `modal.open()` from any file, even outside React components
- 🔒 **Type-safe** - Strongly typed props + close results
- 🧩 **Multiple UI frameworks** - Radix UI and Base UI providers (same core API)
- 🪶 **Lightweight** - zustand-based core
- 🎨 **shadcn/ui ready** - Works seamlessly with your existing components
- 😃 **Migrate with ease** - If you used `@hirotoshioi/hiraku`, see `MIGRATION.md`

## Packages

This repository is a monorepo:

| Package | Purpose |
| --- | --- |
| `@hirotoshioi/hiraku-radix-ui` | Radix UI integration (`packages/radix-ui/`) |
| `@hirotoshioi/hiraku-base-ui` | Base UI integration (`packages/base-ui/`) |
| `@hirotoshioi/hiraku-core` | Shared logic & types (`packages/core/`) |
| `@hirotoshioi/hiraku` | Deprecated alias (re-exports Radix UI) (`packages/hiraku/`) |

## Installation

Most apps should install an integration package:

### Radix UI

```bash
npm install @hirotoshioi/hiraku-radix-ui
```

Radix UI dialog primitives are required as peer dependencies:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

### Base UI

```bash
npm install @hirotoshioi/hiraku-base-ui
```

Base UI is required as a peer dependency:

```bash
npm install @base-ui/react
```

## Quick Start

This section uses the Radix UI integration. For Base UI, see `packages/base-ui/README.md`.

### 1. Add the Provider

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

### 2. Create a modal

```tsx
// modals/confirm-dialog.tsx
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createDialog } from "@hirotoshioi/hiraku-radix-ui";

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

## Examples

Example apps live in this repository:

- `examples/radix-ui/`
- `examples/base-ui/`

Or try the (separate) Radix UI example repo in StackBlitz:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/HirotoShioi/hiraku-example?file=src/App.tsx)

For full package-specific docs:

- Radix UI: `packages/radix-ui/README.md`
- Base UI: `packages/base-ui/README.md`
- Core: `packages/core/README.md`

## Development

Run from repository root:

```bash
npm run build
npm run dev
npm test
npm run typecheck
npm run lint
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

MIT © [Hiroto Shioi](https://github.com/hirotoshioi)
