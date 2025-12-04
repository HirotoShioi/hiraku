/**
 * テスト用共通モーダルコンポーネント
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
// 確認ダイアログ
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
						キャンセル
					</Button>
				</DialogClose>
				<Button data-testid="confirm-btn" onClick={onConfirm}>
					確認
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

// =============================================================================
// 削除確認アラート
// =============================================================================

export interface DeleteAlertProps {
	itemName: string;
}

export function DeleteAlert({ itemName }: DeleteAlertProps) {
	return (
		<AlertDialogContent data-testid="delete-alert">
			<AlertDialogHeader>
				<AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
				<AlertDialogDescription>
					「{itemName}」を削除します。この操作は取り消せません。
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel data-testid="alert-cancel">
					キャンセル
				</AlertDialogCancel>
				<AlertDialogAction data-testid="alert-action">削除</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}

// =============================================================================
// 設定シート
// =============================================================================

export interface SettingsSheetProps {
	side?: "left" | "right";
}

export function SettingsSheet({ side = "right" }: SettingsSheetProps) {
	return (
		<SheetContent side={side} data-testid="settings-sheet">
			<SheetHeader>
				<SheetTitle>設定</SheetTitle>
				<SheetDescription>アプリケーションの設定を変更します</SheetDescription>
			</SheetHeader>
			<div className="p-4" data-testid="sheet-body">
				<p>設定コンテンツ</p>
			</div>
		</SheetContent>
	);
}
