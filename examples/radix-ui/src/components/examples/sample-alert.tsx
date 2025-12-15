import { createAlertDialog } from "@hirotoshioi/hiraku-radix-ui";
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface SampleAlertProps {
	title: string;
	message: string;
}

interface SampleAlertResult {
	confirmed: boolean;
}

export const sampleAlert =
	createAlertDialog(SampleAlert).returns<SampleAlertResult>();

export function SampleAlert(props: SampleAlertProps) {
	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{props.title}</AlertDialogTitle>
				<AlertDialogDescription>{props.message}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel
					onClick={() => void sampleAlert.close({ role: "cancel" })}
				>
					Cancel
				</AlertDialogCancel>
				<AlertDialogAction
					onClick={() =>
						void sampleAlert.close({
							data: { confirmed: true },
							role: "confirm",
						})
					}
				>
					Continue
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}
