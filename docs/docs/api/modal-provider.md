# ModalProvider

The provider component that renders all active modals.

## Usage

Place `ModalProvider` at the root of your app:

::: code-group

```tsx [Radix UI]
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

```tsx [Base UI]
import { ModalProvider } from "@hirotoshioi/hiraku-base-ui";

function App() {
  return (
    <>
      <YourApp />
      <ModalProvider/>
    </>
  );
}
```

:::

## Props

```tsx
interface ModalProviderProps {
  exitDuration?: number; // default: 300
}
```

### exitDuration

How long (in ms) a modal stays mounted after `close()` so its close animation can play. When it ends, the modal is removed and `openAsync()`, `ref.result` and `onDidClose()` resolve.

::: code-group

```tsx [Radix UI]
<ModalProvider exitDuration={200} />
```

```tsx [Base UI]
// Only used by custom wrapper components
<ModalProvider exitDuration={200} />
```

:::

- **Radix UI** - Radix does not report when the close animation ends, so every modal waits `exitDuration` ms. Match it to your Content's exit animation.
- **Base UI** - built-in wrappers (`dialog`, `sheet`, `alert-dialog`) finish closing when Base UI's `onOpenChangeComplete(false)` fires, i.e. when the actual exit animation ends, whatever its length. `exitDuration` is only used as a timer for custom wrapper components.

A per-modal value overrides the provider's:

```tsx
const slowSheet = createSheet(SlowSheet, { exitDuration: 500 });
```

## How It Works

`ModalProvider`:

1. Subscribes to the modal store
2. Renders all active modal instances
3. Wraps each modal with the appropriate Root component for your integration
4. Provides the modal's context so components can call [`useModalContext()`](/docs/api/use-modal-context)
5. Keeps closing modals mounted until their close animation ends (see [exitDuration](#exitduration))
6. Passes dismiss events back to the store

## With Next.js App Router

```tsx
// app/layout.tsx
import { ModalProvider } from "@hirotoshioi/hiraku-radix-ui";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
          <ModalProvider/>
      </body>
    </html>
  );
}
```
