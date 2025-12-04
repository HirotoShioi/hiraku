import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModalStore } from "../store";
import { createAlertDialog, createDialog, createSheet } from "./index";

// テスト用のモックコンポーネント
interface TestProps {
	title: string;
	description?: string;
}

function TestComponent(_props: TestProps) {
	return null;
}

// 必須propsなしのコンポーネント
interface OptionalProps {
	title?: string;
}

function OptionalPropsComponent(_props: OptionalProps) {
	return null;
}

describe("Factory", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("createDialog", () => {
		it("open()でモーダルがstoreに追加される", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.wrapper).toBe("dialog");
			expect(modals[0]?.open).toBe(true);
		});

		it("propsが正しく渡される", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test Title", description: "Test Desc" });

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.props).toEqual({
				title: "Test Title",
				description: "Test Desc",
			});
		});
	});

	describe("createSheet", () => {
		it("wrapperがsheetになる", async () => {
			const sheet = createSheet(TestComponent);

			await sheet.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.wrapper).toBe("sheet");
		});
	});

	describe("createAlertDialog", () => {
		it("wrapperがalert-dialogになる", async () => {
			const alertDialog = createAlertDialog(TestComponent);

			await alertDialog.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.wrapper).toBe("alert-dialog");
		});
	});

	describe("open", () => {
		it("既に開いている場合は何もしない", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "First" });
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.props).toEqual({ title: "First" });
		});

		it("propsが全てオプショナルの場合、引数を省略できる", async () => {
			const dialog = createDialog(OptionalPropsComponent);

			await dialog.open();

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
		});
	});

	describe("close", () => {
		it("モーダルをcloseできる", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });
			const result = await dialog.close();

			expect(result).toBe(true);
			const modals = useModalStore.getState().modals;
			expect(modals[0]?.closing).toBe(true);
		});

		it("開いていない場合はfalseを返す", async () => {
			const dialog = createDialog(TestComponent);

			const result = await dialog.close();

			expect(result).toBe(false);
		});
	});

	describe("isOpen", () => {
		it("モーダルが開いている場合trueを返す", async () => {
			const dialog = createDialog(TestComponent);

			expect(dialog.isOpen()).toBe(false);

			await dialog.open({ title: "Test" });

			expect(dialog.isOpen()).toBe(true);
		});

		it("closingの場合はfalseを返す", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });
			await dialog.close();

			expect(dialog.isOpen()).toBe(false);
		});
	});

	describe("onDidClose", () => {
		it("close完了時にresultを返す", async () => {
			const dialog = createDialog(TestComponent).returns<{ value: number }>();

			await dialog.open({ title: "Test" });

			const closePromise = dialog.onDidClose();
			await dialog.close({ data: { value: 42 }, role: "confirm" });

			vi.advanceTimersByTime(300);

			const result = await closePromise;
			expect(result).toEqual({ data: { value: 42 }, role: "confirm" });
		});

		it("開いていない状態でonDidCloseを呼ぶと空のresultで即resolve", async () => {
			const dialog = createDialog(TestComponent);

			const result = await dialog.onDidClose();

			expect(result).toEqual({});
		});
	});

	describe("エッジケース", () => {
		it("close後に再度openできる", async () => {
			const dialog = createDialog(TestComponent);

			// 1回目
			await dialog.open({ title: "First" });
			await dialog.close();
			vi.advanceTimersByTime(300);

			expect(useModalStore.getState().modals).toHaveLength(0);

			// 2回目
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.props).toEqual({ title: "Second" });
		});

		it("closeを複数回呼んでも安全", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });

			const result1 = await dialog.close();
			const result2 = await dialog.close();

			expect(result1).toBe(true);
			expect(result2).toBe(false); // 既にclosing
		});

		it("closing中（アニメーション300ms内）でも新しいインスタンスとして開ける", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "First" });
			await dialog.close();

			// まだ300ms経過していない（closing中）
			vi.advanceTimersByTime(100);

			// closing中でも新しいインスタンスを作成できる
			// （これにより、素早い再オープンが可能）
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			// 旧インスタンス（closing中）と新インスタンスの2つが存在
			expect(modals).toHaveLength(2);
			expect(modals[0]?.closing).toBe(true);
			expect(modals[1]?.open).toBe(true);
		});

		it("異なるコントローラーは独立して動作する", async () => {
			const dialog1 = createDialog(TestComponent);
			const dialog2 = createDialog(TestComponent);

			await dialog1.open({ title: "Dialog 1" });
			await dialog2.open({ title: "Dialog 2" });

			expect(useModalStore.getState().modals).toHaveLength(2);
			expect(dialog1.isOpen()).toBe(true);
			expect(dialog2.isOpen()).toBe(true);

			await dialog1.close();

			expect(dialog1.isOpen()).toBe(false);
			expect(dialog2.isOpen()).toBe(true);
		});
	});
});
