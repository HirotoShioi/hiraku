# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React modal state management library built on top of Radix UI primitives (@radix-ui/react-dialog and @radix-ui/react-alert-dialog). It provides a type-safe, promise-based API for managing modals with support for sheets, dialogs, and alert dialogs.

**Key Design Philosophy:**
- "pushmodal" style architecture: The library manages the Radix UI Root component, users implement Content and below
- Promise-based API: Modal interactions return promises that resolve when the modal closes
- Type-safe: Component props are automatically inferred from React components
- Zustand-based state management: All modal state is centralized in a Zustand store

## Build and Development Commands

```bash
# Install dependencies
npm install

# Build the library (uses tsdown)
npm run build

# Watch mode for development
npm run dev

# Run unit tests (Vitest)
npm run test

# Type checking
npm run typecheck

# Run the playground (Vite dev server)
npm run play

# Publish workflow
npm run release  # Bumps version and publishes
```

## Architecture

### Core Components

**[src/store/index.ts](src/store/index.ts)** - Zustand store managing modal state
- Maintains array of `ModalInstance` objects
- Handles modal lifecycle: add, present, close, closeAll
- Uses 300ms animation duration for close transitions
- Stores resolve callbacks for promise-based API

**[src/factory/index.ts](src/factory/index.ts)** - Modal controller factories
- `createDialog()`, `createSheet()`, `createAlertDialog()` - Create modal controllers for components
- Each factory returns a `Modal` object with: `open()`, `close()`, `onDidClose()`, `isOpen()`, `returns<T>()`
- Type inference: Automatically extracts component props and makes them required/optional based on TypeScript types
- Controllers manage their own instance lifecycle

**[src/provider.tsx](src/provider.tsx)** - React Provider component
- Must be placed at app root
- Renders all active modals from Zustand store
- Maps wrapper type strings ('dialog', 'sheet', 'alert-dialog') to Radix UI Root components
- Handles Suspense boundaries for lazy-loaded modal components

**[src/hooks/index.ts](src/hooks/index.ts)** - React hooks
- `useModal(controller)` - Primary hook for using modals in components
- Returns: `{ isOpen, open, close, data, role }`
- Automatically cleans up on unmount
- Manages result state reactively

**[src/modal-controller.ts](src/modal-controller.ts)** - Global utilities
- `modalController.closeAll()` - Close all open modals
- `modalController.getTop()` - Get topmost modal handle
- `modalController.getCount()` - Count open modals
- `modalController.isOpen()` - Check if any modal is open

### Type System

**[src/shared/types.ts](src/shared/types.ts)** - Core type definitions
- `ModalRole`: 'confirm' | 'cancel' | 'dismiss' | string
- `ModalResult<T>`: Contains data and role from modal closure
- `GetComponentProps<T>`: Extracts props from React component types
- `OptionalPropsArgs<T>`: Makes props optional if all properties are optional
- `ModalWrapperType`: 'dialog' | 'sheet' | 'alert-dialog' or custom component

**[src/utils.ts](src/utils.ts)** - Utility functions
- `createHandle()` - Converts ModalInstance to ModalHandle for external API

### Modal Lifecycle

1. **Creation**: Factory creates controller with component reference
2. **Opening**:
   - Controller creates ModalInstance with unique ID
   - Instance added to store, marked as open
   - Creates deferred promise for result
3. **Rendering**: Provider renders all open modals with their Radix wrappers
4. **Closing**:
   - Store marks modal as closing, sets open=false
   - After 300ms animation, resolves promise and removes from store
5. **Result**: Promise resolves with `{ data, role }` object

## Development Patterns

### Creating a Modal

```typescript
// 1. Define your modal component
interface MyModalProps {
  title: string;
  onConfirm: () => void;
}

function MyModal(props: MyModalProps) {
  // Implement using Radix Dialog.Content, etc.
}

// 2. Create controller (props are auto-inferred)
const myModal = createDialog(MyModal).returns<MyResult>();

// 3. Use in component
const modal = useModal(myModal);

// Open with type-safe props
await modal.open({ title: "Hello", onConfirm: () => {} });
```

### Wrapper Types

- **dialog**: Standard modal dialog (default)
- **sheet**: Side sheet/drawer
- **alert-dialog**: Alert dialog with backdrop click disabled
- Custom: Pass any component accepting `{ open, onOpenChange, children }`

### Testing

Uses Vitest with Happy DOM and React Testing Library. Test setup in [tests/setup.ts](tests/setup.ts).

## Dependencies

**Peer Dependencies** (required by consuming apps):
- react, react-dom ^19.2.0
- @radix-ui/react-dialog ^1.1.15
- @radix-ui/react-alert-dialog ^1.1.15

**Core Dependency**:
- zustand ^5.0.9 - State management

**Build Tools**:
- tsdown - TypeScript bundler
- vite (rolldown-vite variant) - Dev server for playground
- vitest - Testing framework
