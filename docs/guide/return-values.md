# Return Values

hiraku supports type-safe return values from modals using the `.returns<T>()` method.

## Defining Return Types

```tsx
interface FormData {
  name: string;
  email: string;
}

function UserFormDialog() {
  const [form, setForm] = useState<FormData>({ name: "", email: "" });

  return (
    <DialogContent>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Button onClick={() => userFormDialog.close({ data: form, role: "confirm" })}>
        Submit
      </Button>
    </DialogContent>
  );
}

// Specify the return type
export const userFormDialog = createDialog(UserFormDialog).returns<FormData>();
```

## Receiving Return Values

Use `onDidClose()` to receive the result:

```tsx
async function handleCreateUser() {
  await userFormDialog.open();
  
  const result = await userFormDialog.onDidClose();
  // result: { data?: FormData, role?: ModalRole }

  if (result.role === "confirm" && result.data) {
    await createUser(result.data);
  }
}
```

## Result Structure

The `onDidClose()` promise resolves with:

```tsx
interface ModalResult<T> {
  data?: T;          // The return value (if any)
  role?: ModalRole;  // How the modal was closed
}

type ModalRole = "confirm" | "cancel" | "dismiss" | (string & {});
```

## Examples

### Boolean Confirmation

```tsx
export const confirmDialog = createDialog(ConfirmDialog).returns<boolean>();

// Usage
const { data, role } = await confirmDialog.onDidClose();
if (role === "confirm" && data === true) {
  // Confirmed
}
```

### Form Data

```tsx
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export const contactDialog = createDialog(ContactDialog).returns<ContactForm>();

// Usage
const { data } = await contactDialog.onDidClose();
if (data) {
  await sendMessage(data);
}
```

### Selection

```tsx
export const colorPicker = createDialog(ColorPickerDialog).returns<string>();

// Usage
const { data: selectedColor } = await colorPicker.onDidClose();
if (selectedColor) {
  applyColor(selectedColor);
}
```

### Multiple Values

```tsx
interface FilterResult {
  categories: string[];
  priceRange: [number, number];
  sortBy: "price" | "date" | "name";
}

export const filterSheet = createSheet(FilterSheet).returns<FilterResult>();
```

## No Return Value

If you don't need a return value, simply omit `.returns()`:

```tsx
export const infoDialog = createDialog(InfoDialog);

// Still get the role
const { role } = await infoDialog.onDidClose();
if (role === "dismiss") {
  // User dismissed the dialog
}
```
