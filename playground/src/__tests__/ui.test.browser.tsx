/**
 * Browser integration tests (using shadcn/ui components).
 *
 * Exercises Radix UI-based shadcn/ui components in a real browser environment.
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
// Test suite
// =============================================================================

describe("shadcn/ui Modal Integration", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		render(<ModalProvider />);
	});

	describe("Dialog (confirmation)", () => {
		it("opens dialog and shows title", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "Save changes",
				message: "Do you want to save changes?",
			});

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();
			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("Save changes");
		});

		it("closes via cancel button", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "Test",
				message: "Test message",
			});

			await page.getByTestId("cancel-btn").click();

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.not.toBeInTheDocument();
		});

		it("closes with Escape key", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			await confirmDialog.open({
				title: "Test",
				message: "Test message",
			});

			await userEvent.keyboard("{Escape}");

			await expect
				.element(page.getByTestId("confirm-dialog"))
				.not.toBeInTheDocument();
		});

		it("invokes onConfirm callback", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			let confirmed = false;

			await confirmDialog.open({
				title: "Test",
				message: "Test message",
				onConfirm: () => {
					confirmed = true;
				},
			});

			await page.getByTestId("confirm-btn").click();

			expect(confirmed).toBe(true);
		});
	});

	describe("AlertDialog (delete confirm)", () => {
		it("opens alert dialog and shows content", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "Important file" });

			await expect
				.element(page.getByTestId("delete-alert"))
				.toBeInTheDocument();
			await expect
				.element(
					page.getByText(
						'Delete "Important file". This action cannot be undone.',
					),
				)
				.toBeInTheDocument();
		});

		it("closes via action button", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "Test file" });

			await page.getByTestId("alert-action").click();

			await expect
				.element(page.getByTestId("delete-alert"))
				.not.toBeInTheDocument();
		});

		it("closes via cancel button", async () => {
			const deleteAlert = createAlertDialog(DeleteAlert);

			await deleteAlert.open({ itemName: "Test file" });

			await page.getByTestId("alert-cancel").click();

			await expect
				.element(page.getByTestId("delete-alert"))
				.not.toBeInTheDocument();
		});
	});

	describe("Sheet (side panel)", () => {
		it("opens sheet and shows content", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({ side: "right" });

			await expect
				.element(page.getByTestId("settings-sheet"))
				.toBeInTheDocument();
			await expect.element(page.getByTestId("sheet-body")).toBeInTheDocument();
		});

		it("can open from the left side", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({ side: "left" });

			await expect
				.element(page.getByTestId("settings-sheet"))
				.toBeInTheDocument();
		});

		it("closes with Escape key", async () => {
			const settingsSheet = createSheet(SettingsSheet);

			await settingsSheet.open({});

			await userEvent.keyboard("{Escape}");

			await expect
				.element(page.getByTestId("settings-sheet"))
				.not.toBeInTheDocument();
		});
	});

	describe("Promise API", () => {
		it("returns result via onDidClose", async () => {
			const confirmDialog = createDialog(ConfirmDialog).returns<{
				confirmed: boolean;
			}>();

			await confirmDialog.open({
				title: "Test",
				message: "Please confirm",
			});

			const closePromise = confirmDialog.onDidClose();
			await confirmDialog.close({ data: { confirmed: true }, role: "confirm" });

			const result = await closePromise;
			expect(result.data).toEqual({ confirmed: true });
			expect(result.role).toBe("confirm");
		});
	});

	describe("Multiple modals", () => {
		it("opens multiple modals simultaneously", async () => {
			const dialog1 = createDialog(ConfirmDialog);
			const dialog2 = createDialog(ConfirmDialog);

			await dialog1.open({ title: "Dialog 1", message: "First" });
			await dialog2.open({ title: "Dialog 2", message: "Second" });

			expect(modalController.getCount()).toBe(2);
		});

		it("closeAll closes everything", async () => {
			const dialog = createDialog(ConfirmDialog);
			const sheet = createSheet(SettingsSheet);

			await dialog.open({ title: "Dialog", message: "Test" });
			await sheet.open({});

			expect(modalController.getCount()).toBe(2);

			await modalController.closeAll();

			expect(modalController.getCount()).toBe(0);
		});
	});

	describe("State management", () => {
		it("isOpen() reflects open/close state", async () => {
			const dialog = createDialog(ConfirmDialog);

			expect(dialog.isOpen()).toBe(false);

			await dialog.open({ title: "Test", message: "Confirm" });
			expect(dialog.isOpen()).toBe(true);

			await dialog.close();
			expect(dialog.isOpen()).toBe(false);
		});

		it("can reopen after closing", async () => {
			const dialog = createDialog(ConfirmDialog);

			// First run
			await dialog.open({ title: "First", message: "Test" });
			await dialog.close();

			// Second run
			await dialog.open({ title: "Second", message: "Test" });

			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("Second");
		});
	});

	describe("Async modal usage", () => {
		it("await dialog.open() works inside async function", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			// Simulate an async process
			async function performAsyncOperation() {
				// Mock async work (API call, etc.)
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Open a dialog mid-process
				await confirmDialog.open({
					title: "Processing",
					message: "Continue processing?",
				});

				return "completed";
			}

			// Start async function
			const operationPromise = performAsyncOperation();

			// Wait for dialog to appear
			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();
			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("Processing");

			// Close dialog
			await confirmDialog.close();

			// Ensure async work completes
			const result = await operationPromise;
			expect(result).toBe("completed");
		});

		it("opens modals from multiple async processes back to back", async () => {
			const dialog1 = createDialog(ConfirmDialog);
			const dialog2 = createDialog(ConfirmDialog);

			// Start two async processes in parallel
			async function asyncProcess1() {
				await new Promise((resolve) => setTimeout(resolve, 50));
				await dialog1.open({
					title: "Process 1",
					message: "First process",
				});
				return "process1";
			}

			async function asyncProcess2() {
				await new Promise((resolve) => setTimeout(resolve, 100));
				await dialog2.open({
					title: "Process 2",
					message: "Second process",
				});
				return "process2";
			}

			const promise1 = asyncProcess1();
			const promise2 = asyncProcess2();

			// Wait for both dialogs to show
			await expect
				.element(page.getByText("Process 1"))
				.toBeInTheDocument();
			await expect
				.element(page.getByText("Process 2"))
				.toBeInTheDocument();

			// Two dialogs are open
			expect(modalController.getCount()).toBe(2);

			// Close both
			await modalController.closeAll();

			// Both processes complete
			const [result1, result2] = await Promise.all([promise1, promise2]);
			expect(result1).toBe("process1");
			expect(result2).toBe("process2");
		});

		it("opens modal inside Promise.all async workflow", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			// Run multiple async tasks via Promise.all
			async function runParallelTasks() {
				const results = await Promise.all([
					// Task 1: simple async work
					(async () => {
						await new Promise((resolve) => setTimeout(resolve, 50));
						return "task1";
					})(),
					// Task 2: open a dialog
					(async () => {
						await new Promise((resolve) => setTimeout(resolve, 80));
						await confirmDialog.open({
							title: "Confirm",
							message: "Dialog during parallel tasks",
						});
						return "task2";
					})(),
				]);
				return results;
			}

			const tasksPromise = runParallelTasks();

			// Wait for dialog to appear
			await expect
				.element(page.getByTestId("confirm-dialog"))
				.toBeInTheDocument();

			// Close dialog
			await confirmDialog.close();

			// All tasks resolve
			const results = await tasksPromise;
			expect(results).toEqual(["task1", "task2"]);
		});

		it("opens modal inside try-catch async flow", async () => {
			const confirmDialog = createDialog(ConfirmDialog);

			async function asyncWithErrorHandling() {
				try {
					// Some async work
					await new Promise((resolve) => setTimeout(resolve, 50));

					// Show confirmation dialog when an error occurs
					await confirmDialog.open({
						title: "Error occurred",
						message: "Retry?",
					});

					return "handled";
				} catch {
					return "error";
				}
			}

			const promise = asyncWithErrorHandling();

			await expect
				.element(page.getByTestId("dialog-title"))
				.toHaveTextContent("Error occurred");

			await confirmDialog.close();

			const result = await promise;
			expect(result).toBe("handled");
		});

		it("opens modal asynchronously inside a loop", async () => {
			const confirmDialog = createDialog(ConfirmDialog);
			const openedTitles: string[] = [];

			async function processItems() {
				const items = ["Item 1", "Item 2", "Item 3"];

				for (const item of items) {
					await new Promise((resolve) => setTimeout(resolve, 30));
					await confirmDialog.open({
						title: item,
						message: `Processing ${item}`,
					});
					openedTitles.push(item);
					await confirmDialog.close();
				}

				return openedTitles;
			}

			const result = await processItems();

			expect(result).toEqual(["Item 1", "Item 2", "Item 3"]);
			expect(confirmDialog.isOpen()).toBe(false);
		});
	});
});
