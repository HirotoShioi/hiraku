import { Button } from "@/components/ui/button";
import {
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { createSheet } from "../../../../src";

interface TodoItem {
	id: string;
	title: string;
	completed: boolean;
}

export interface TodoListSheetProps {
	todos: TodoItem[];
}

// Propsはコンポーネントから自動推論
export const todoListSheet = createSheet(TodoListSheet);

export function TodoListSheet({ todos = [] }: TodoListSheetProps) {
	return (
		<SheetContent side="bottom" className="h-[80vh] flex flex-col">
			<SheetClose />
			<SheetHeader>
				<SheetTitle>Todo List</SheetTitle>
				<SheetDescription>タスクを管理しましょう。</SheetDescription>
			</SheetHeader>

			<div className="flex-1 overflow-y-auto space-y-2">
				{todos.length === 0 ? (
					<p className="text-center text-muted-foreground text-sm">
						タスクはありません
					</p>
				) : (
					todos.map((todo) => (
						<div
							key={todo.id}
							className="flex items-center justify-between p-2 border rounded-md"
						>
							<div className="flex items-center gap-2">
								<span
									className={
										todo.completed ? "line-through text-muted-foreground" : ""
									}
								>
									{todo.title}
								</span>
							</div>
						</div>
					))
				)}
			</div>

			<SheetFooter className="mt-auto pt-4">
				<Button variant="outline" onClick={() => void todoListSheet.close()}>
					閉じる
				</Button>
			</SheetFooter>
		</SheetContent>
	);
}

const URL = "https://jsonplaceholder.typicode.com/todos?_limit=5";

/**
 * 非同期でデータを取得してからモーダルを開く例
 */
export const openTodoListSheet = async () => {
	const todos = (await fetch(URL).then((res) => res.json())) as TodoItem[];
	await todoListSheet.open({ todos });
};
