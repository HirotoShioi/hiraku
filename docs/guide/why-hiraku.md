# Philosophy

In this section, I'll talk about the concept and philosophy behind hiraku.

## Motivation

Every time I implemented modals in React, I kept running into the same frustration.

The parent component manages the open/close state and passes `isOpen` and `onClose` as props to the modal. It seems like a simple pattern, but as applications grow, problems start to surface.

```tsx
function Parent() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <MyDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

The problem with this pattern is clear. You just want to open a modal, yet the parent component is burdened with state management responsibilities. When dealing with multiple modals, `useState` calls proliferate and code becomes bloated.

What's even worse is the **tight coupling**. Modals are bound to their parent components, and when you want to open them from somewhere else, prop drilling hell awaits. Opening from outside React components? Impossible.

Why does something as simple as "opening a modal" have to be this complicated?

## The Approach

hiraku solves this problem by delegating state management to a **global modal controller**.

Separate modal state management from React's component tree, and open modals from anywhere by simply calling `modal.open()`. That's hiraku's answer.

```tsx
import { confirmDialog } from "./modals/confirm-dialog";

function Parent() {
  // This is no longer needed
  // const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => confirmDialog.open({ message: "Are you sure?" })}>Open</button>
    </> 
  );
}
```

A global store powered by Zustand manages the modal lifecycle. It natively supports Radix UI's Dialog, Sheet, and AlertDialog, integrating seamlessly with shadcn/ui.

No compromises on TypeScript either. Props are automatically inferred, and return values are fully type-safe.

## Design Principles

hiraku's design is built on three principles.

### 1. Loose Coupling

Modals don't depend on parent components. Open what you want, from where you want. That's it.

### 2. Type Safety

Props types, return value types—everything is inferred. No escaping to `any`. An uncompromising type system.

### 3. Leverage Existing Assets

Use your Radix UI and shadcn/ui components as-is. Existing modal components can be migrated with minimal changes.

---

hiraku makes modal management in React simple, type-safe, and decoupled. Open modals from anywhere without the boilerplate. Focus on building great user experiences, not wrestling with state or prop drilling.