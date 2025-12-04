# modalController

Global utilities for managing all modals.

## Import

```tsx
import { modalController } from "@hirotoshioi/hiraku";
```

## Methods

### closeAll()

Closes all open modals.

```tsx
modalController.closeAll();
```

**Use cases:**
- Route navigation
- Logout
- Error recovery

```tsx
// Close all modals on route change
useEffect(() => {
  return () => modalController.closeAll();
}, [pathname]);
```

### isOpen()

Returns whether any modal is currently open.

```tsx
if (modalController.isOpen()) {
  console.log("A modal is open");
}
```

**Returns:** `boolean`

### getCount()

Returns the number of open modals.

```tsx
const count = modalController.getCount();
console.log(`${count} modals open`);
```

**Returns:** `number`

### getTop()

Returns the topmost (most recently opened) modal instance.

```tsx
const top = modalController.getTop();
if (top) {
  console.log("Top modal:", top.id);
}
```

**Returns:** `ModalInstance | undefined`

## Examples

### Navigation Guard

```tsx
function useNavigationGuard() {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modalController.isOpen()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
```

### Close on Route Change

```tsx
// Next.js App Router
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { modalController } from "@hirotoshioi/hiraku";

export function RouteChangeHandler() {
  const pathname = usePathname();

  useEffect(() => {
    modalController.closeAll();
  }, [pathname]);

  return null;
}
```

### Keyboard Shortcut

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Close all modals with Ctrl+Escape
    if (e.ctrlKey && e.key === "Escape") {
      modalController.closeAll();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```
