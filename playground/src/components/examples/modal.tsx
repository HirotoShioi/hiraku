import { useState } from "react";
import { sampleAlert } from "@/components/examples/sample-alert";
import { editProfileDialog } from "@/components/examples/sample-dialog";
import { sampleSheetModal } from "@/components/examples/sample-sheet";
import { openTodoListSheet } from "@/components/examples/todo-list-sheet";
import { Button } from "@/components/ui/button";

export function ImperativeDemo() {
	const [result, setResult] = useState<string>("");

	const openSheet = async () => {
		await sampleSheetModal.open({
			title: "Sheet from anywhere",
			description:
				"Open and close from any file with sheetController.create(...).",
		});
		const { data, role } = await sampleSheetModal.onDidClose();
		if (role === "confirm" && data?.accepted) {
			setResult("confirmed ✅");
		} else if (role) {
			setResult(`${role} ❎`);
		} else {
			setResult("closed ❌");
		}
	};

	const openAlert = async () => {
		await sampleAlert.open({
			title: "Are you sure?",
			message: "This action cannot be undone. Do you really want to delete?",
		});
		const { data, role } = await sampleAlert.onDidClose();
		if (role === "confirm" && data?.confirmed) {
			setResult("confirmed ✅");
		} else {
			setResult("closed ❌");
		}
	};

	const handleOpenTodoListSheet = async () => {
		await openTodoListSheet();
	};

	const openDialog = async () => {
		await editProfileDialog.open({
			initialName: "Pedro Duarte",
			initialUsername: "@peduarte",
		});
		const { data, role } = await editProfileDialog.onDidClose();
		if (role === "confirm" && data) {
			setResult(`Saved: Name=${data.name}, Username=${data.username} ✅`);
		} else if (role === "cancel") {
			setResult("canceled ❎");
		} else {
			setResult("closed ❌");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-3">
				<Button onClick={() => void openSheet()}>Open sheet</Button>
				<Button variant="destructive" onClick={() => void openAlert()}>
					Open alert
				</Button>
				<Button onClick={() => void handleOpenTodoListSheet()}>
					Open todo list
				</Button>
				<Button onClick={() => void openDialog()}>Open dialog</Button>
			</div>

			{result && (
				<div className="rounded-md border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
					Result: {result}
				</div>
			)}
		</div>
	);
}
