# Packages & Installation

hiraku is a monorepo. You install **one integration package** depending on the UI primitives you use.

## Packages

| Package | Use case |
| --- | --- |
| `@hirotoshioi/hiraku-radix-ui` | Radix UI integration (recommended for shadcn/ui) |
| `@hirotoshioi/hiraku-base-ui` | Base UI integration |
| `@hirotoshioi/hiraku-core` | Shared core API (logic + types) |
| `@hirotoshioi/hiraku` | Deprecated alias (re-exports Radix UI) |

## Install

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

## Imports

All controllers/hooks/utilities are re-exported from both integration packages. The only UI-specific export is `ModalProvider`.

::: code-group

```ts [Radix UI]
import { ModalProvider, createDialog, useModal, modalController } from "@hirotoshioi/hiraku-radix-ui";
```

```ts [Base UI]
import { ModalProvider, createDialog, useModal, modalController } from "@hirotoshioi/hiraku-base-ui";
```

:::

