# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hiraku** (開く, "to open") is a strongly typed modal state management library for React. It supports both Radix UI and Base UI components, allowing modals to be opened from anywhere in the application (even outside React components) with full type safety.

This is a **monorepo** containing:
- **@hirotoshioi/hiraku-core** - Framework-agnostic core logic
- **@hirotoshioi/hiraku** - Radix UI implementation (main package)
- **@hirotoshioi/hiraku-base-ui** - Base UI (MUI) implementation
- **examples/** - Example applications for each UI framework

## Development Commands

### Monorepo Commands (run from root)

```bash
# Building
npm run build          # Build all packages using Turbo
npm run dev            # Watch mode for all packages

# Testing
npm test               # Run all tests (unit + browser) across packages
npm run typecheck      # Type check all packages
npm run ci             # Full CI check (typecheck + test + lint)

# Code Quality
npm run lint           # Lint all packages
npm run lint:fix       # Format and fix with Biome

# Documentation
npm run docs:dev       # Start VitePress docs dev server
npm run docs:build     # Build VitePress docs
npm run docs:preview   # Preview built docs

# Release (publishes all 3 packages)
npm run release        # Bump versions, sync deps, build, and publish
```

### Package-Specific Commands

Navigate to a package directory (e.g., `packages/core/`) and run:

```bash
npm run build          # Build with tsdown
npm run dev            # Watch mode with tsdown
npm test               # Run tests for this package only
npm run typecheck      # Type check this package
npm run lint           # Lint this package
```

### Running Specific Tests

```bash
# Run tests for a specific package
npm test -w @hirotoshioi/hiraku-core

# Run tests in watch mode
cd packages/core && npm test

# Run browser tests for examples
npm test -w examples/radix-ui
npm test -w examples/base-ui
```

## Architecture

### Monorepo Structure

This is a **three-layer architecture**:

1. **hiraku-core** (`packages/core/`) - Framework-agnostic core
   - Modal state management with Zustand
   - Factory functions (`createDialog`, `createSheet`, `createAlertDialog`)
   - Type-safe modal controllers
   - React hooks (`useModal`)
   - Global modal controller
   - No UI framework dependencies

2. **hiraku** (`packages/radix-ui/`) - Radix UI implementation
   - Re-exports everything from core
   - Provides `ModalProvider` component that wraps modals in Radix UI primitives
   - Peer dependencies: `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`

3. **hiraku-base-ui** (`packages/base-ui/`) - Base UI implementation
   - Re-exports everything from core
   - Provides `ModalProvider` component that wraps modals in Base UI primitives
   - Peer dependency: `@base-ui/react`

### Core System Components

#### 1. Factory Functions ([packages/core/src/factory/index.ts](packages/core/src/factory/index.ts))
- `createDialog()`, `createSheet()`, `createAlertDialog()` - Create modal controllers
- Each returns a controller object with methods: `open()`, `close()`, `onDidClose()`, `isOpen()`
- Controllers are **singletons per modal type** - only one instance can be open at a time
- Use `.returns<T>()` to specify the return type for type-safe results

#### 2. Modal Store ([packages/core/src/store/index.ts](packages/core/src/store/index.ts))
- Zustand store managing array of `ModalInstance` objects
- Key actions: `add`, `present`, `close`, `closeAll`, `getTop`, `updateProps`
- Handles modal lifecycle: add → present (open) → close animation → remove
- Uses 300ms animation duration for close transitions

#### 3. Provider Components
- **Radix UI**: [packages/radix-ui/src/provider.tsx](packages/radix-ui/src/provider.tsx)
- **Base UI**: [packages/base-ui/src/provider.tsx](packages/base-ui/src/provider.tsx)
- Renders all active modals from the store
- Must be placed at app root
- Automatically wraps modal components with appropriate UI framework Root component
- Handles `onOpenChange` events and dismissal

#### 4. Hooks ([packages/core/src/hooks/index.ts](packages/core/src/hooks/index.ts))
- `useModal(controller)` - React hook for using modals within components
- Returns `{ isOpen, open, close, data, role }` with reactive state
- Automatically closes modal on component unmount

#### 5. Global Controller ([packages/core/src/modal-controller.ts](packages/core/src/modal-controller.ts))
- `modalController` singleton for global modal operations
- Methods: `closeAll()`, `getTop()`, `getCount()`, `isOpen()`

### Type System

The library has sophisticated TypeScript types for prop inference:

- **`GetComponentProps<T>`** - Extracts props from component type
- **`OptionalPropsArgs<T>`** - Makes `open()` args optional if props are empty/optional
- **`ModalResult<T>`** - Close result with `{ data?: T, role?: ModalRole }`
- **`ModalRole`** - Discriminated union: `"confirm" | "cancel" | "dismiss" | (string & {})`

All types are defined in [packages/core/src/shared/types.ts](packages/core/src/shared/types.ts).

### Modal Lifecycle

1. **Creation**: `createDialog(Component).returns<Result>()` creates a controller
2. **Opening**: `controller.open(props)` adds instance to store and presents it
3. **Rendering**: `ModalProvider` renders the modal with UI framework wrapper
4. **Closing**: User action calls `controller.close({ data, role })`
5. **Animation**: Modal marked as closing, 300ms delay
6. **Cleanup**: Modal removed from store, promise resolved with result

## Testing

The project uses Vitest with two test configurations:

1. **Unit tests** (`packages/core/src/**/*.test.ts(x)`)
   - Environment: happy-dom
   - Co-located with source code
   - Run with: `npm test -w @hirotoshioi/hiraku-core`

2. **Browser tests** (`examples/*/src/**/*.test.browser.tsx`)
   - Environment: Playwright with Chromium
   - Integration tests for UI framework implementations
   - Run with: `npm test -w examples/radix-ui` or `npm test -w examples/base-ui`

## Code Style

- **Formatter**: Biome with tab indentation, double quotes
- **TypeScript**: Strictest config (`@tsconfig/strictest`)
- **Linting**: Biome with `noExplicitAny` and `noRedeclare` disabled
- **Imports**: Auto-organized by Biome
- **CSS**: Tailwind directives enabled in Biome parser

## Key Implementation Patterns

### Modal Controllers are Singletons
Each modal controller tracks a single instance. If `open()` is called while a modal is already open and not closing, it's a no-op. This prevents duplicate modals.

### Promise-based API
- `open()` returns `Promise<void>` when modal is presented
- `onDidClose()` returns `Promise<ModalResult<T>>` that resolves when modal closes
- Enables async/await pattern: `await modal.open(); const result = await modal.onDidClose();`

### Deferred Promise Pattern
Internal `createDeferred()` utility creates a promise with external `resolve` function, stored in `ModalInstance` as `didPromise` and `resolveDid`. This allows the store to resolve the promise when modal closes.

### Type-Safe Prop Inference
The factory functions automatically infer component props and make the `open()` argument optional if props are empty or all optional, required if any prop is required.

### UI Framework Abstraction
The core package is completely UI framework agnostic. UI-specific implementations (radix-ui, base-ui) only provide the `ModalProvider` component that knows how to wrap modals in the correct primitives.

## Workspace Dependencies

When working on core changes that affect the Radix UI or Base UI packages:

1. Core package depends only on zustand
2. Radix UI package depends on core: `"@hirotoshioi/hiraku-core": "0.0.4"`
3. Base UI package depends on core: `"@hirotoshioi/hiraku-core": "0.0.4"`
4. Turbo handles build ordering automatically via `dependsOn: ["^build"]`
5. Internal version sync is handled by `scripts/sync-internal-deps.js` during release

## Build System

- **Builder**: tsdown (fast TypeScript bundler)
- **Monorepo**: Turborepo for task orchestration
- **Package Manager**: npm workspaces (npm@11.1.0)
- **TypeScript**: Project references enabled via `composite: true`
