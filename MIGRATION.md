# Migration Guide: @hirotoshioi/hiraku → @hirotoshioi/hiraku-radix-ui

## Why the change?

hiraku is now a **monorepo** supporting multiple UI frameworks. The Radix UI implementation has been renamed to `@hirotoshioi/hiraku-radix-ui` for clarity.

The monorepo now contains:
- **@hirotoshioi/hiraku-core** - Framework-agnostic core logic
- **@hirotoshioi/hiraku-radix-ui** - Radix UI implementation (formerly `@hirotoshioi/hiraku`)
- **@hirotoshioi/hiraku-base-ui** - Base UI (MUI) implementation

## Migration Steps

### 1. Update dependencies

```bash
npm uninstall @hirotoshioi/hiraku
npm install @hirotoshioi/hiraku-radix-ui
```

Or with other package managers:

```bash
# yarn
yarn remove @hirotoshioi/hiraku
yarn add @hirotoshioi/hiraku-radix-ui

# pnpm
pnpm remove @hirotoshioi/hiraku
pnpm add @hirotoshioi/hiraku-radix-ui
```

### 2. Update imports

```diff
- import { ModalProvider, createDialog } from '@hirotoshioi/hiraku';
+ import { ModalProvider, createDialog } from '@hirotoshioi/hiraku-radix-ui';
```

### 3. No API changes required

**All APIs remain identical.** Only the package name has changed. Your existing code will work without any modifications after updating the import statements.

```tsx
// Before
import { ModalProvider, createDialog, createSheet, createAlertDialog } from '@hirotoshioi/hiraku';

// After
import { ModalProvider, createDialog, createSheet, createAlertDialog } from '@hirotoshioi/hiraku-radix-ui';

// Everything else stays the same!
const myDialog = createDialog(MyDialogComponent).returns<string>();
```

## Temporary backward compatibility

The old package `@hirotoshioi/hiraku` will continue to work temporarily as it now re-exports everything from `@hirotoshioi/hiraku-radix-ui`. However, it is marked as deprecated and will show warnings when installed.

**Please migrate to the new package name as soon as possible.**

## Need help?

- [Documentation](https://hirotoshioi.github.io/hiraku/)
- [GitHub Issues](https://github.com/hirotoshioi/hiraku/issues)
- [Package README](./packages/radix-ui/README.md)

## Timeline

- **v1.0.0** - `@hirotoshioi/hiraku` is deprecated and re-exports `@hirotoshioi/hiraku-radix-ui`
- **Future** - The old package may be unpublished after sufficient migration period

Thank you for using hiraku!
