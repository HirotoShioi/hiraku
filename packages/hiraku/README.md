# ⚠️ DEPRECATED: @hirotoshioi/hiraku

## This package has been renamed to **@hirotoshioi/hiraku-radix-ui**

Please install the new package:

```bash
npm uninstall @hirotoshioi/hiraku
npm install @hirotoshioi/hiraku-radix-ui
```

## Migration Guide

See [MIGRATION.md](../../MIGRATION.md) for detailed migration instructions.

### Quick migration

**1. Update dependencies:**

```bash
npm install @hirotoshioi/hiraku-radix-ui
npm uninstall @hirotoshioi/hiraku
```

**2. Update imports:**

```diff
- import { ModalProvider, createDialog } from '@hirotoshioi/hiraku';
+ import { ModalProvider, createDialog } from '@hirotoshioi/hiraku-radix-ui';
```

**That's it!** No API changes required.

## Why the change?

hiraku is now a monorepo supporting multiple UI frameworks:

- **[@hirotoshioi/hiraku-radix-ui](../radix-ui/)** - Radix UI implementation (this package's replacement)
- **[@hirotoshioi/hiraku-base-ui](../base-ui/)** - Base UI (MUI) implementation
- **[@hirotoshioi/hiraku-core](../core/)** - Framework-agnostic core

## Backward compatibility

This deprecated package temporarily re-exports everything from `@hirotoshioi/hiraku-radix-ui` for backward compatibility. However, please migrate to the new package name as soon as possible.

## Links

- [Documentation](https://hirotoshioi.github.io/hiraku/)
- [GitHub Repository](https://github.com/hirotoshioi/hiraku)
- [Migration Guide](../../MIGRATION.md)
- [New Package: @hirotoshioi/hiraku-radix-ui](../radix-ui/)
