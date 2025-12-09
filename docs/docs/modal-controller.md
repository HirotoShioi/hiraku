# Modal Controller

The `modalController` provides global utilities for managing all modals.

## Import

```tsx
import { modalController } from "@hirotoshioi/hiraku";
```

## Methods

### closeAll()

Close all open modals:

```tsx
// Close all modals immediately
modalController.closeAll();
```

Useful for:
- Navigation changes
- Logout actions
- Error recovery

```tsx
// Example: Close modals on route change
useEffect(() => {
  return () => {
    modalController.closeAll();
  };
}, [pathname]);
```

### isOpen()

Check if any modal is currently open:

```tsx
if (modalController.isOpen()) {
  console.log("A modal is open");
}
```

### getCount()

Get the number of open modals:

```tsx
const count = modalController.getCount();
console.log(`${count} modals are open`);
```

### getTop()

Get the topmost (most recently opened) modal instance:

```tsx
const topModal = modalController.getTop();
if (topModal) {
  console.log("Top modal ID:", topModal.id);
}
```

