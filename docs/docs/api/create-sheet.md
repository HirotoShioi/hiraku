# createSheet

Creates a sheet (slide-out panel) modal controller.

## Signature

```tsx
function createSheet<T extends ComponentType<any>>(
  component: T,
  options?: ModalOptions
): ModalController<T>;
```

## Usage

```tsx
import { createSheet } from "@hirotoshioi/hiraku-radix-ui";

const mySheet = createSheet(MySheetComponent);
```

## With Return Type

```tsx
const mySheet = createSheet(MySheetComponent).returns<ResultType>();
```

## With Options

`options` is the same as for [createDialog](/docs/api/create-dialog#with-options):

```tsx
const mySheet = createSheet(MySheetComponent, { exitDuration: 200 });
```

## Controller Methods

Same as [createDialog](/docs/api/create-dialog):

- `openAsync(props)` - Opens the sheet and resolves with `{ data, role }` when it closes
- `open(props)` - Opens the sheet and returns a `ModalRef`
- `close(result?)` - Closes the sheet
- `onDidClose()` - Promise that resolves on close
- `isOpen()` - Check if sheet is open

## Example

```tsx
import { createSheet } from "@hirotoshioi/hiraku-radix-ui";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FilterProps {
  categories: string[];
}

function FilterSheet({ categories }: FilterProps) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Filter</SheetTitle>
      </SheetHeader>
      <div>
        {categories.map((cat) => (
          <label key={cat}>
            <input
              type="checkbox"
              checked={selected.includes(cat)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected([...selected, cat]);
                } else {
                  setSelected(selected.filter((c) => c !== cat));
                }
              }}
            />
            {cat}
          </label>
        ))}
      </div>
      <button onClick={() => filterSheet.close({ data: selected, role: "confirm" })}>
        Apply Filters
      </button>
    </SheetContent>
  );
}

export const filterSheet = createSheet(FilterSheet).returns<string[]>();

// Usage
const result = await filterSheet.openAsync({
  categories: ["Electronics", "Books", "Clothing"],
});

if (result.data) {
  applyFilters(result.data);
}
```
