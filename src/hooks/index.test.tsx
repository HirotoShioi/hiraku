import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDialog } from "../factory";
import { useModalStore } from "../store";
import { useModal } from "./index";

// テスト用のモックコンポーネント
interface TestProps {
	title: string;
	description?: string;
}

function TestComponent(_props: TestProps) {
	return null;
}

describe("useModal", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("初期状態", () => {
		it("isOpen/data/roleは初期値を持つ", () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			expect(result.current.isOpen).toBe(false);
			expect(result.current.data).toBeNull();
			expect(result.current.role).toBeNull();
		});
	});

	describe("open", () => {
		it("open()でisOpenがtrueになる", async () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			await act(async () => {
				void result.current.open({ title: "Test" });
			});

			expect(result.current.isOpen).toBe(true);
		});

		it("既に開いている場合は何もしない", async () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			await act(async () => {
				void result.current.open({ title: "First" });
			});

			await act(async () => {
				void result.current.open({ title: "Second" });
			});

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
		});
	});

	describe("close", () => {
		it("close()を呼び出すとclosing状態になる", async () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			await act(async () => {
				void result.current.open({ title: "Test" });
			});

			await act(async () => {
				const closeResult = await result.current.close({ role: "confirm" });
				expect(closeResult).toBe(true);
			});

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.closing).toBe(true);
		});
	});

	describe("アンマウント時のcleanup", () => {
		it("アンマウント時にモーダルが閉じる", async () => {
			const dialog = createDialog(TestComponent);
			const { result, unmount } = renderHook(() => useModal(dialog));

			await act(async () => {
				void result.current.open({ title: "Test" });
			});

			expect(useModalStore.getState().modals).toHaveLength(1);

			unmount();

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.closing).toBe(true);
		});
	});
});
