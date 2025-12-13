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
import { createSheet } from "@hirotoshioi/hiraku";

export interface SampleSheetProps {
	title: string;
	description: string;
}

interface SampleSheetResult {
	accepted: boolean;
}

// Create a typed controller with createSheet(Component).returns<T>()
export const sampleSheetModal =
	createSheet(SampleSheet).returns<SampleSheetResult>();

export function SampleSheet(props: SampleSheetProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleConfirm = async () => {
		setIsLoading(true);
		// Simulate loading
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
					{isLoading ? "You cannot close while loading..." : props.description}
				</SheetDescription>
			</SheetHeader>
			<SheetFooter>
				<Button
					variant="outline"
					disabled={isLoading}
					onClick={() => void sampleSheetModal.close()}
				>
					Cancel
				</Button>
				<Button disabled={isLoading} onClick={() => void handleConfirm()}>
					{isLoading ? "Loading..." : "Confirm"}
				</Button>
			</SheetFooter>
		</SheetContent>
	);
}
