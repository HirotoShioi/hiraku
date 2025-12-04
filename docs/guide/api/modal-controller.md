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
