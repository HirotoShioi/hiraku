# ModalProvider

The provider component that renders all active modals.

## Usage

Wrap your application with `ModalProvider`:

```tsx
import { ModalProvider } from "@hirotoshioi/hiraku";

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}
```

## Placement

Place `ModalProvider` at the root of your application, inside any other providers you need:

```tsx
function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <Router>
            <Routes />
          </Router>
        </ModalProvider>
      </QueryClientProvider>
    </ThemeProvider>
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
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
```

## With Next.js Pages Router

```tsx
// pages/_app.tsx
import { ModalProvider } from "@hirotoshioi/hiraku";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ModalProvider>
      <Component {...pageProps} />
    </ModalProvider>
  );
}
```

## Multiple Providers

You only need one `ModalProvider`. Adding multiple providers will cause modals to render multiple times.

```tsx
// ❌ Don't do this
<ModalProvider>
  <Layout>
    <ModalProvider>  {/* Unnecessary! */}
      <Page />
    </ModalProvider>
  </Layout>
</ModalProvider>

// ✅ Do this
<ModalProvider>
  <Layout>
    <Page />
  </Layout>
</ModalProvider>
```
