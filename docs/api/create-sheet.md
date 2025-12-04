# createSheet

Creates a sheet (slide-out panel) modal controller.

## Signature

```tsx
function createSheet<T extends ComponentType<any>>(
  component: T
): ModalController<T>;
```

## Usage

```tsx
import { createSheet } from "@hirotoshioi/hiraku";

const mySheet = createSheet(MySheetComponent);
```

## With Return Type

```tsx
const mySheet = createSheet(MySheetComponent).returns<ResultType>();
```

## Controller Methods

Same as [createDialog](/api/create-dialog):

- `open(props)` - Opens the sheet
- `close(result?)` - Closes the sheet
- `onDidClose()` - Promise that resolves on close
- `isOpen()` - Check if sheet is open

## Example

```tsx
import { createSheet } from "@hirotoshioi/hiraku";
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
await filterSheet.open({ categories: ["Electronics", "Books", "Clothing"] });
const result = await filterSheet.onDidClose();

if (result.data) {
  applyFilters(result.data);
}
```
