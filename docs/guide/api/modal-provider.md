# ModalProvider

The provider component that renders all active modals.

## Usage

Place `ModalProvider` at the root of your app:

```tsx
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

## How It Works

`ModalProvider`:

1. Subscribes to the modal store
2. Renders all active modal instances
3. Wraps each modal with the appropriate Radix UI Root component
4. Handles open/close animations
5. Passes dismiss events back to the store

## With Next.js App Router

```tsx
// app/layout.tsx
import { ModalProvider } from "@hirotoshioi/hiraku";

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
