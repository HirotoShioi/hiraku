/**
 * Browser integration tests for the useModal hook.
 */

import {
	createAlertDialog,
	createDialog,
	createSheet,
	ModalProvider,
	modalController,
	useModal,
	useModalStore,
} from "@hirotoshioi/hiraku-base-ui";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DeleteAlert, SettingsSheet } from "./test-components";

// =============================================================================
// useModal hook test suite
// =============================================================================

describe("useModal hook", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
	});

	// Component factory used in multiple tests
	function createUseModalTestComponent() {
		const controller = createDialog(ConfirmDialog).returns<{
			accepted: boolean;
		}>();

		function UseModalTestComponent() {
			const modal = useModal(controller);

			return (
				<div>
					<Button
						data-testid="open-modal-btn"
						onClick={() => {
							modal.open({
								title: "useModal test",
								message: "Opened from the hook",
							});
						}}
					>
						Open modal
					</Button>
					<div data-testid="modal-state">
						<span data-testid="is-open">
							{modal.isOpen ? "open" : "closed"}
						</span>
						<span data-testid="role">{modal.role ?? "none"}</span>
						<span data-testid="data">
							{modal.data?.accepted !== undefined
								? String(modal.data.accepted)
								: "none"}
						</span>
					</div>
				</div>
			);
		}

		return { controller, Component: UseModalTestComponent };
	}

	it("opens and closes a modal via useModal", async () => {
		const { Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// Verify initial state
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");

		// Open modal
		await page.getByTestId("open-modal-btn").click();

		// Confirm modal opened
		await expect.element(page.getByTestId("is-open")).toHaveTextContent("open");
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId("dialog-title"))
			.toHaveTextContent("useModal test");

		// Close with cancel button
		await page.getByTestId("cancel-btn").click();

		// Confirm closed
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.not.toBeInTheDocument();
	});

	it("returns result when closing with data via useModal", async () => {
		const { controller, Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// Verify initial state
		await expect.element(page.getByTestId("data")).toHaveTextContent("none");
		await expect.element(page.getByTestId("role")).toHaveTextContent("none");

		// Open modal
		await page.getByTestId("open-modal-btn").click();
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();

		// Close via controller with data
		await controller.close({ data: { accepted: true }, role: "confirm" });

		// Confirm result is reflected
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");
		await expect.element(page.getByTestId("role")).toHaveTextContent("confirm");
		await expect.element(page.getByTestId("data")).toHaveTextContent("true");
	});

	it("does not open twice when already open", async () => {
		const { controller, Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// Open modal
		await page.getByTestId("open-modal-btn").click();
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();

		// Confirm isOpen() returns true
		expect(controller.isOpen()).toBe(true);

		// Only one modal exists
		expect(modalController.getCount()).toBe(1);

		await controller.close();
	});

	// useModal tests for Sheet
	function createUseModalSheetTestComponent() {
		const controller = createSheet(SettingsSheet);

		function UseModalSheetTestComponent() {
			const sheet = useModal(controller);

			return (
				<div>
					<Button
						data-testid="open-sheet-btn"
						onClick={() => {
							sheet.open({ side: "right" });
						}}
					>
						Open sheet
					</Button>
					<span data-testid="sheet-state">
						{sheet.isOpen ? "open" : "closed"}
					</span>
				</div>
			);
		}

		return { controller, Component: UseModalSheetTestComponent };
	}

	it("opens and closes a Sheet via useModal", async () => {
		const { Component } = createUseModalSheetTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// Initial state
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("closed");

		// Open sheet
		await page.getByTestId("open-sheet-btn").click();

		// Sheet opened
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("open");
		await expect
			.element(page.getByTestId("settings-sheet"))
			.toBeInTheDocument();

		// Close with Escape
		await userEvent.keyboard("{Escape}");

		// Closed
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("settings-sheet"))
			.not.toBeInTheDocument();
	});

	// useModal tests for AlertDialog
	function createUseModalAlertTestComponent() {
		const controller = createAlertDialog(DeleteAlert);

		function UseModalAlertTestComponent() {
			const alert = useModal(controller);

			return (
				<div>
					<Button
						data-testid="open-alert-btn"
						onClick={() => {
							alert.open({ itemName: "Test item" });
						}}
					>
						Open alert
					</Button>
					<span data-testid="alert-state">
						{alert.isOpen ? "open" : "closed"}
					</span>
				</div>
			);
		}

		return { controller, Component: UseModalAlertTestComponent };
	}

	it("opens and closes an AlertDialog via useModal", async () => {
		const { Component } = createUseModalAlertTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// Initial state
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("closed");

		// Open alert
		await page.getByTestId("open-alert-btn").click();

		// Alert opened
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("open");
		await expect.element(page.getByTestId("delete-alert")).toBeInTheDocument();
		await expect
			.element(
				page.getByText('Delete "Test item". This action cannot be undone.'),
			)
			.toBeInTheDocument();

		// Close via action button
		await page.getByTestId("alert-action").click();

		// Closed
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("delete-alert"))
			.not.toBeInTheDocument();
	});

	// Test using multiple useModal instances at once
	function MultipleModalsComponent() {
		// Create controllers inside the component (memoized for stability)
		const dialogController = React.useMemo(
			() => createDialog(ConfirmDialog),
			[],
		);
		const sheetController = React.useMemo(() => createSheet(SettingsSheet), []);
		const dialog = useModal(dialogController);
		const sheet = useModal(sheetController);

		return (
			<div>
				<Button
					data-testid="open-both-btn"
					onClick={() => {
						dialog.open({ title: "Dialog", message: "Test" });
						sheet.open({ side: "left" });
					}}
				>
					Open both
				</Button>
				<span data-testid="dialog-state">
					{dialog.isOpen ? "dialog-open" : "dialog-closed"}
				</span>
				<span data-testid="sheet-modal-state">
					{sheet.isOpen ? "sheet-open" : "sheet-closed"}
				</span>
			</div>
		);
	}

	it("manages multiple modals simultaneously via useModal", async () => {
		render(
			<>
				<ModalProvider />
				<MultipleModalsComponent />
			</>,
		);

		// Open both
		await page.getByTestId("open-both-btn").click();

		// Confirm both are open
		await expect
			.element(page.getByTestId("dialog-state"))
			.toHaveTextContent("dialog-open");
		await expect
			.element(page.getByTestId("sheet-modal-state"))
			.toHaveTextContent("sheet-open");
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId("settings-sheet"))
			.toBeInTheDocument();

		// Close all
		await modalController.closeAll();

		await expect
			.element(page.getByTestId("dialog-state"))
			.toHaveTextContent("dialog-closed");
		await expect
			.element(page.getByTestId("sheet-modal-state"))
			.toHaveTextContent("sheet-closed");
	});
});
