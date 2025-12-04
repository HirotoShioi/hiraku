import { useState } from "react";
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

export interface SampleSheetProps {
	title: string;
	description: string;
}

interface SampleSheetResult {
	accepted: boolean;
}

// createSheet(Component).returns<T>() で型付きコントローラーを作成
export const sampleSheetModal =
	createSheet(SampleSheet).returns<SampleSheetResult>();

export function SampleSheet(props: SampleSheetProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = async () => {
		setIsLoading(true);
		// 読み込み中のシミュレーション
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		await sampleSheetModal.close({
			data: { accepted: true },
			role: "confirm",
		});
	};

	return (
		<SheetContent side="bottom">
			<SheetClose disabled={isLoading} />
			<SheetHeader>
				<SheetTitle>{props.title}</SheetTitle>
				<SheetDescription>
					{isLoading
						? "読み込み中は閉じることができません..."
						: props.description}
				</SheetDescription>
			</SheetHeader>
			<SheetFooter>
				<Button
					variant="outline"
					disabled={isLoading}
					onClick={() => void sampleSheetModal.close()}
				>
					キャンセル
				</Button>
				<Button disabled={isLoading} onClick={() => void handleConfirm()}>
					{isLoading ? "読み込み中..." : "確認"}
				</Button>
			</SheetFooter>
		</SheetContent>
	);
}
