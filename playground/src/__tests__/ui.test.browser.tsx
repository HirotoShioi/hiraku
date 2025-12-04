/**
 * ブラウザ統合テスト（shadcn/uiコンポーネント使用）
 *
 * 実際のブラウザ環境でRadix UIベースのshadcn/uiコンポーネントをテスト
 */
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
	createAlertDialog,
	createDialog,
	createSheet,
	ModalProvider,
	modalController,
	useModalStore,
} from "../../../src";
import { ConfirmDialog, DeleteAlert, SettingsSheet } from "./test-components";

// =============================================================================
// テストスイート
// =============================================================================

describe("shadcn/ui Modal Integration", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		render(<ModalProvider />);
	});

	describe("Dialog（確認ダイアログ）", () => {
		it("ダイアログを開いてタイトルが表示される", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "変更を保存",
				message: "変更を保存しますか？",
			});

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();
			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("変更を保存");
		});

		it("キャンセルボタンで閉じる", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "テスト",
				message: "テストメッセージ",
			});

			await page.getByTestId("cancel-btn").click();

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.not.toBeInTheDocument();
		});

		it("Escapeキーで閉じる", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "テスト",
				message: "テストメッセージ",
			});

			await userEvent.keyboard("{Escape}");

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.not.toBeInTheDocument();
		});

		it("onConfirmコールバックが呼ばれる", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			let confirmed = false;

			await confirmDialog.open({
				title: "テスト",
				message: "テストメッセージ",
				onConfirm: () => {
					confirmed = true;
				},
			});

			await page.getByTestId("confirm-btn").click();

			expect(confirmed).toBe(true);
		});
	});

	describe("AlertDialog（削除確認）", () => {
		it("アラートダイアログを開いて内容が表示される", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "重要なファイル" });

			await expect
				.element(page.getByTestId("delete-alert"))
				.toBeInTheDocument();
			await expect
				.element(page.getByText("「重要なファイル」を削除します"))
				.toBeInTheDocument();
		});

		it("アクションボタンで閉じる", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "テストファイル" });

			await page.getByTestId("alert-action").click();

			await expect
				.element(page.getByTestId("delete-alert"))
				.not.toBeInTheDocument();
		});

		it("キャンセルボタンで閉じる", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "テストファイル" });

			await page.getByTestId("alert-cancel").click();

			await expect
				.element(page.getByTestId("delete-alert"))
				.not.toBeInTheDocument();
		});
	});

	describe("Sheet（サイドパネル）", () => {
		it("Sheetを開いてコンテンツが表示される", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({ side: "right" });

			await expect
				.element(page.getByTestId("settings-sheet"))
				.toBeInTheDocument();
			await expect.element(page.getByTestId("sheet-body")).toBeInTheDocument();
		});

		it("左側から開ける", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({ side: "left" });

			await expect
				.element(page.getByTestId("settings-sheet"))
				.toBeInTheDocument();
		});

		it("Escapeキーで閉じる", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({});

			await userEvent.keyboard("{Escape}");

			await expect
				.element(page.getByTestId("settings-sheet"))
				.not.toBeInTheDocument();
		});
	});

	describe("Promise API", () => {
		it("onDidCloseで結果を取得できる", async () => {
			const confirmDialog = createDialog(ConfirmDialog).returns<{
				confirmed: boolean;
			}>();

			await confirmDialog.open({
				title: "テスト",
				message: "確認してください",
			});

			const closePromise = confirmDialog.onDidClose();
			await confirmDialog.close({ data: { confirmed: true }, role: "confirm" });

			const result = await closePromise;
			expect(result.data).toEqual({ confirmed: true });
			expect(result.role).toBe("confirm");
		});
	});

	describe("複数モーダル", () => {
		it("複数のモーダルを同時に開ける", async () => {
			const dialog1 = createDialog(ConfirmDialog);
			const dialog2 = createDialog(ConfirmDialog);

			await dialog1.open({ title: "ダイアログ1", message: "1つ目" });
			await dialog2.open({ title: "ダイアログ2", message: "2つ目" });

			expect(modalController.getCount()).toBe(2);
		});

		it("closeAllで全て閉じる", async () => {
			const dialog = createDialog(ConfirmDialog);
			const sheet = createSheet(SettingsSheet);

			await dialog.open({ title: "ダイアログ", message: "テスト" });
			await sheet.open({});

			expect(modalController.getCount()).toBe(2);

			await modalController.closeAll();

			expect(modalController.getCount()).toBe(0);
		});
	});

	describe("状態管理", () => {
		it("isOpen()で開閉状態を確認できる", async () => {
			const dialog = createDialog(ConfirmDialog);

			expect(dialog.isOpen()).toBe(false);

			await dialog.open({ title: "テスト", message: "確認" });
			expect(dialog.isOpen()).toBe(true);

			await dialog.close();
			expect(dialog.isOpen()).toBe(false);
		});

		it("閉じた後に再度開ける", async () => {
			const dialog = createDialog(ConfirmDialog);

			// 1回目
			await dialog.open({ title: "1回目", message: "テスト" });
			await dialog.close();

			// 2回目
			await dialog.open({ title: "2回目", message: "テスト" });

			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("2回目");
		});
	});

	describe("非同期処理中のモーダル表示", () => {
		it("非同期関数内でawait dialog.open()が正しく動作する", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			// 非同期処理をシミュレート
			async function performAsyncOperation() {
				// 模擬的な非同期処理（APIコールなど）
				await new Promise((resolve) => setTimeout(resolve, 100));

				// 非同期処理の途中でダイアログを開く
				await confirmDialog.open({
					title: "非同期処理中",
					message: "処理を続行しますか？",
				});

				return "completed";
			}

			// 非同期関数を開始
			const operationPromise = performAsyncOperation();

			// ダイアログが表示されるのを待つ
			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();
			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("非同期処理中");

			// ダイアログを閉じる
			await confirmDialog.close();

			// 非同期処理が完了することを確認
			const result = await operationPromise;
			expect(result).toBe("completed");
		});

		it("複数の非同期処理から連続してモーダルを開ける", async () => {
			const dialog1 = createDialog(ConfirmDialog);
			const dialog2 = createDialog(ConfirmDialog);

			// 2つの非同期処理を並行して開始
			async function asyncProcess1() {
				await new Promise((resolve) => setTimeout(resolve, 50));
				await dialog1.open({ title: "処理1", message: "1つ目の処理" });
				return "process1";
			}

			async function asyncProcess2() {
				await new Promise((resolve) => setTimeout(resolve, 100));
				await dialog2.open({ title: "処理2", message: "2つ目の処理" });
				return "process2";
			}

			const promise1 = asyncProcess1();
			const promise2 = asyncProcess2();

			// 両方のダイアログが表示されるのを待つ
			await expect.element(page.getByText("処理1")).toBeInTheDocument();
			await expect.element(page.getByText("処理2")).toBeInTheDocument();

			// 2つのダイアログが開いている
			expect(modalController.getCount()).toBe(2);

			// 両方閉じる
			await modalController.closeAll();

			// 両方の処理が完了する
			const [result1, result2] = await Promise.all([promise1, promise2]);
			expect(result1).toBe("process1");
			expect(result2).toBe("process2");
		});

		it("Promise.allと組み合わせた非同期処理でモーダルが開く", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			// 複数の非同期タスクをPromise.allで実行
			async function runParallelTasks() {
				const results = await Promise.all([
					// タスク1: 単純な非同期処理
					(async () => {
						await new Promise((resolve) => setTimeout(resolve, 50));
						return "task1";
					})(),
					// タスク2: ダイアログを開く処理
					(async () => {
						await new Promise((resolve) => setTimeout(resolve, 80));
						await confirmDialog.open({
							title: "確認",
							message: "並列処理中のダイアログ",
						});
						return "task2";
					})(),
				]);
				return results;
			}

			const tasksPromise = runParallelTasks();

			// ダイアログが表示されるのを待つ
			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();

			// ダイアログを閉じる
			await confirmDialog.close();

			// 全タスクが完了
			const results = await tasksPromise;
			expect(results).toEqual(["task1", "task2"]);
		});

		it("try-catch内の非同期処理でモーダルが開く", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			async function asyncWithErrorHandling() {
				try {
					// 何らかの非同期処理
					await new Promise((resolve) => setTimeout(resolve, 50));

					// エラーが発生した場合に確認ダイアログを表示
					await confirmDialog.open({
						title: "エラー発生",
						message: "リトライしますか？",
					});

					return "handled";
				} catch {
					return "error";
				}
			}

			const promise = asyncWithErrorHandling();

			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("エラー発生");

			await confirmDialog.close();

			const result = await promise;
			expect(result).toBe("handled");
		});

		it("ループ内で非同期にモーダルを開ける", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			const openedTitles: string[] = [];

			async function processItems() {
				const items = ["アイテム1", "アイテム2", "アイテム3"];

				for (const item of items) {
					await new Promise((resolve) => setTimeout(resolve, 30));
					await confirmDialog.open({
						title: item,
						message: `${item}を処理中`,
					});
					openedTitles.push(item);
					await confirmDialog.close();
				}

				return openedTitles;
			}

			const result = await processItems();

			expect(result).toEqual(["アイテム1", "アイテム2", "アイテム3"]);
			expect(confirmDialog.isOpen()).toBe(false);
		});
	});
});
