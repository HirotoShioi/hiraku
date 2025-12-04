import {
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAlertDialog, createDialog } from "../../../../src";

const profileUpdatedAlert = createAlertDialog(ProfileUpdatedAlert);

function ProfileUpdatedAlert() {
	return (
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>完了</AlertDialogTitle>
				<AlertDialogDescription>
					プロフィールを変更しました
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogAction
					onClick={() => void profileUpdatedAlert.close({ role: "confirm" })}
				>
					OK
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}

interface EditProfileDialogProps {
	initialName?: string;
	initialUsername?: string;
}

interface ProfileData {
	name: string;
	username: string;
}

export const editProfileDialog =
	createDialog(EditProfileDialog).returns<ProfileData>();

function EditProfileDialog({
	initialName = "Pedro Duarte",
	initialUsername = "@peduarte",
}: EditProfileDialogProps) {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name") as string,
			username: formData.get("username") as string,
		};
		await profileUpdatedAlert.open();
		await profileUpdatedAlert.onDidClose();
		await editProfileDialog.close({ data, role: "confirm" });
	};

	const handleCancel = () => {
		void editProfileDialog.close({ role: "cancel" });
	};

	return (
		<DialogContent className="sm:max-w-[425px]">
			<form onSubmit={handleSubmit}>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you&apos;re done.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-3">
						<Label htmlFor="name-1">Name</Label>
						<Input id="name-1" name="name" defaultValue={initialName} />
					</div>
					<div className="grid gap-3">
						<Label htmlFor="username-1">Username</Label>
						<Input
							id="username-1"
							name="username"
							defaultValue={initialUsername}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="submit">Save changes</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
