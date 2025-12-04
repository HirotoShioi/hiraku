# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hiraku** (開く, "to open") is a strongly typed modal state management library for Radix UI. It allows opening modals from anywhere in the application (even outside React components) with full type safety.

- **Package**: `@hirotoshioi/hiraku`
- **Key dependency**: zustand (state management)
- **Peer dependencies**: @radix-ui/react-dialog, @radix-ui/react-alert-dialog, react, react-dom

## Development Commands

### Building & Development
```bash
npm run build          # Build the library with tsdown
npm run dev            # Watch mode for development
npm run play           # Start Vite playground for testing
```

### Testing
```bash
npm test               # Run all tests (unit + browser)
npm run typecheck      # TypeScript type checking
npm run ci             # Full CI check (typecheck + tests + lint)
```

### Code Quality
```bash
npm run lint:fix       # Format with Biome and fix linting issues
biome lint             # Lint only
biome format --write   # Format only
```

### Package Management
```bash
npm run check-exports  # Verify package exports with @arethetypeswrong/cli
npm run release        # Bump version and publish to npm
```

## Architecture

### Core System Components

The library uses a **global store pattern** with Zustand to manage modal state outside the React component tree, enabling modals to be opened from anywhere.

#### 1. Factory Functions ([src/factory/index.ts](src/factory/index.ts))
- `createDialog()`, `createSheet()`, `createAlertDialog()` - Create modal controllers
- Each returns a controller object with methods: `open()`, `close()`, `onDidClose()`, `isOpen()`
- Controllers are **singletons per modal type** - only one instance can be open at a time
- Use `.returns<T>()` to specify the return type for type-safe results

#### 2. Modal Store ([src/store/index.ts](src/store/index.ts))
- Zustand store managing array of `ModalInstance` objects
- Key actions: `add`, `present`, `close`, `closeAll`, `getTop`, `updateProps`
- Handles modal lifecycle: add → present (open) → close animation → remove
- Uses 300ms animation duration for close transitions

#### 3. Provider ([src/provider.tsx](src/provider.tsx))
- `<ModalProvider />` renders all active modals from the store
- Must be placed at app root
- Automatically wraps modal components with appropriate Radix UI Root component
- Handles `onOpenChange` events and dismissal

#### 4. Hooks ([src/hooks/index.ts](src/hooks/index.ts))
- `useModal(controller)` - React hook for using modals within components
- Returns `{ isOpen, open, close, data, role }` with reactive state
- Automatically closes modal on component unmount

#### 5. Global Controller ([src/modal-controller.ts](src/modal-controller.ts))
- `modalController` singleton for global modal operations
- Methods: `closeAll()`, `getTop()`, `getCount()`, `isOpen()`

### Type System

The library has sophisticated TypeScript types for prop inference:

- **`GetComponentProps<T>`** - Extracts props from component type
- **`OptionalPropsArgs<T>`** - Makes `open()` args optional if props are empty/optional
- **`ModalResult<T>`** - Close result with `{ data?: T, role?: ModalRole }`
- **`ModalRole`** - Discriminated union: `"confirm" | "cancel" | "dismiss" | (string & {})`

### Modal Lifecycle

1. **Creation**: `createDialog(Component).returns<Result>()` creates a controller
2. **Opening**: `controller.open(props)` adds instance to store and presents it
3. **Rendering**: `ModalProvider` renders the modal with Radix UI wrapper
4. **Closing**: User action calls `controller.close({ data, role })`
5. **Animation**: Modal marked as closing, 300ms delay
6. **Cleanup**: Modal removed from store, promise resolved with result

## Project Structure

```
src/
├── factory/          # Modal controller factories (createDialog, etc.)
├── store/            # Zustand store for modal state
├── hooks/            # React hooks (useModal)
├── shared/           # Shared TypeScript types
├── provider.tsx      # ModalProvider component
├── modal-controller.ts  # Global controller utilities
└── utils.ts          # Internal utilities

playground/           # Vite playground for testing
tests/                # Test setup files
```

## Code Style

- **Formatter**: Biome with tab indentation
- **TypeScript**: Strictest config (`@tsconfig/strictest`)
- **Linting**: Biome with `noExplicitAny` and `noRedeclare` disabled
- **Imports**: Auto-organized by Biome

## Testing

The project uses Vitest with two test configurations:

1. **Unit tests** (`src/**/*.test.ts`): happy-dom environment
2. **Browser tests** (`playground/**/*.test.browser.tsx`): Playwright with Chromium

Test files are co-located with source code and in the playground for integration tests.

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
