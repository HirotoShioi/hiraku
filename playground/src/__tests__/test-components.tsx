/**
 * Shared modal components for tests.
 */
import {
	AlertDialogAction,
	AlertDialogCancel,
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
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

// =============================================================================
// Confirmation dialog
// =============================================================================

export interface ConfirmDialogProps {
	title: string;
	message: string;
	onConfirm?: () => void;
}

export function ConfirmDialog({
	title,
	message,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<DialogContent data-testid="confirm-dialog">
			<DialogHeader>
				<DialogTitle data-testid="dialog-title">{title}</DialogTitle>
				<DialogDescription>{message}</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button variant="outline" data-testid="cancel-btn">
						Cancel
					</Button>
				</DialogClose>
				<Button data-testid="confirm-btn" onClick={onConfirm}>
					Confirm
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

// =============================================================================
// Delete confirmation alert
// =============================================================================

export interface DeleteAlertProps {
	itemName: string;
}

export function DeleteAlert({ itemName }: DeleteAlertProps) {
	return (
		<AlertDialogContent data-testid="delete-alert">
			<AlertDialogHeader>
				<AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
				<AlertDialogDescription>
					Delete "{itemName}". This action cannot be undone.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel data-testid="alert-cancel">Cancel</AlertDialogCancel>
				<AlertDialogAction data-testid="alert-action">Delete</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}

// =============================================================================
// Settings sheet
// =============================================================================

export interface SettingsSheetProps {
	side?: "left" | "right";
}

export function SettingsSheet({ side = "right" }: SettingsSheetProps) {
	return (
		<SheetContent side={side} data-testid="settings-sheet">
			<SheetHeader>
				<SheetTitle>Settings</SheetTitle>
				<SheetDescription>Change application settings.</SheetDescription>
			</SheetHeader>
			<div className="p-4" data-testid="sheet-body">
				<p>Settings content</p>
			</div>
		</SheetContent>
	);
}

// =============================================================================
// Dynamic content dialog (for updateProps testing)
// =============================================================================

export interface DynamicDialogProps {
	count: number;
	message: string;
}

export function DynamicDialog({ count, message }: DynamicDialogProps) {
	return (
		<DialogContent data-testid="dynamic-dialog">
			<DialogHeader>
				<DialogTitle data-testid="dynamic-title">Count: {count}</DialogTitle>
				<DialogDescription data-testid="dynamic-message">
					{message}
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose asChild>
					<Button variant="outline" data-testid="dynamic-close">
						Close
					</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	);
}
