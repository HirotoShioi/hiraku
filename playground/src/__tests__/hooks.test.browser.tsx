/**
 * useModal フックのブラウザ統合テスト
 */
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "@/components/ui/button";
import {
	createAlertDialog,
	createDialog,
	createSheet,
	ModalProvider,
	modalController,
	useModal,
	useModalStore,
} from "../../../src";
import { ConfirmDialog, DeleteAlert, SettingsSheet } from "./test-components";

// =============================================================================
// useModal フック テストスイート
// =============================================================================

describe("useModal フック", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
	});

	// 各テスト用のコンポーネントファクトリー
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
								title: "useModalテスト",
								message: "フックから開きました",
							});
						}}
					>
						モーダルを開く
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

	it("useModalでモーダルを開閉できる", async () => {
		const { Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// 初期状態の確認
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");

		// モーダルを開く
		await page.getByTestId("open-modal-btn").click();

		// モーダルが開いた状態を確認
		await expect.element(page.getByTestId("is-open")).toHaveTextContent("open");
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId("dialog-title"))
			.toHaveTextContent("useModalテスト");

		// キャンセルボタンで閉じる
		await page.getByTestId("cancel-btn").click();

		// 閉じた状態を確認
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.not.toBeInTheDocument();
	});

	it("useModalでcloseにデータを渡すと結果を取得できる", async () => {
		const { controller, Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// 初期状態の確認
		await expect.element(page.getByTestId("data")).toHaveTextContent("none");
		await expect.element(page.getByTestId("role")).toHaveTextContent("none");

		// モーダルを開く
		await page.getByTestId("open-modal-btn").click();
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();

		// コントローラー経由でデータ付きで閉じる
		await controller.close({ data: { accepted: true }, role: "confirm" });

		// 結果が反映されていることを確認
		await expect
			.element(page.getByTestId("is-open"))
			.toHaveTextContent("closed");
		await expect.element(page.getByTestId("role")).toHaveTextContent("confirm");
		await expect.element(page.getByTestId("data")).toHaveTextContent("true");
	});

	it("useModalで既に開いている場合は二重に開かない", async () => {
		const { controller, Component } = createUseModalTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// モーダルを開く
		await page.getByTestId("open-modal-btn").click();
		await expect
			.element(page.getByTestId("confirm-dialog"))
			.toBeInTheDocument();

		// isOpen()がtrueを返すことを確認
		expect(controller.isOpen()).toBe(true);

		// モーダルは1つだけ
		expect(modalController.getCount()).toBe(1);

		await controller.close();
	});

	// Sheetに対するuseModalテスト
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
						シートを開く
					</Button>
					<span data-testid="sheet-state">
						{sheet.isOpen ? "open" : "closed"}
					</span>
				</div>
			);
		}

		return { controller, Component: UseModalSheetTestComponent };
	}

	it("useModalでSheetを開閉できる", async () => {
		const { Component } = createUseModalSheetTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// 初期状態
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("closed");

		// シートを開く
		await page.getByTestId("open-sheet-btn").click();

		// シートが開いた
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("open");
		await expect
			.element(page.getByTestId("settings-sheet"))
			.toBeInTheDocument();

		// Escapeで閉じる
		await userEvent.keyboard("{Escape}");

		// 閉じた
		await expect
			.element(page.getByTestId("sheet-state"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("settings-sheet"))
			.not.toBeInTheDocument();
	});

	// AlertDialogに対するuseModalテスト
	function createUseModalAlertTestComponent() {
		const controller = createAlertDialog(DeleteAlert);

		function UseModalAlertTestComponent() {
			const alert = useModal(controller);

			return (
				<div>
					<Button
						data-testid="open-alert-btn"
						onClick={() => {
							alert.open({ itemName: "テストアイテム" });
						}}
					>
						アラートを開く
					</Button>
					<span data-testid="alert-state">
						{alert.isOpen ? "open" : "closed"}
					</span>
				</div>
			);
		}

		return { controller, Component: UseModalAlertTestComponent };
	}

	it("useModalでAlertDialogを開閉できる", async () => {
		const { Component } = createUseModalAlertTestComponent();
		render(
			<>
				<ModalProvider />
				<Component />
			</>,
		);

		// 初期状態
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("closed");

		// アラートを開く
		await page.getByTestId("open-alert-btn").click();

		// アラートが開いた
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("open");
		await expect.element(page.getByTestId("delete-alert")).toBeInTheDocument();
		await expect
			.element(page.getByText("「テストアイテム」を削除します"))
			.toBeInTheDocument();

		// アクションボタンで閉じる
		await page.getByTestId("alert-action").click();

		// 閉じた
		await expect
			.element(page.getByTestId("alert-state"))
			.toHaveTextContent("closed");
		await expect
			.element(page.getByTestId("delete-alert"))
			.not.toBeInTheDocument();
	});

	// 複数のuseModalを同時に使用するテスト
	function MultipleModalsComponent() {
		// コンポーネント内でコントローラーを作成（React.useMemoで安定化）
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
						dialog.open({ title: "ダイアログ", message: "テスト" });
						sheet.open({ side: "left" });
					}}
				>
					両方開く
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

	it("useModalで複数のモーダルを同時に管理できる", async () => {
		render(
			<>
				<ModalProvider />
				<MultipleModalsComponent />
			</>,
		);

		// 両方開く
		await page.getByTestId("open-both-btn").click();

		// 両方開いた状態を確認
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

		// 全て閉じる
		await modalController.closeAll();

		await expect
			.element(page.getByTestId("dialog-state"))
			.toHaveTextContent("dialog-closed");
		await expect
			.element(page.getByTestId("sheet-modal-state"))
			.toHaveTextContent("sheet-closed");
	});
});
