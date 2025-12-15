import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDialog } from "../factory";
import { useModalStore } from "../store";
import { useModal } from "./index";

// Mock component for tests
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
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe("initial state", () => {
		it("isOpen/data/role have default values", () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			expect(result.current.isOpen).toBe(false);
			expect(result.current.data).toBeNull();
			expect(result.current.role).toBeNull();
		});
	});

	describe("open", () => {
		it("sets isOpen true after open()", async () => {
			const dialog = createDialog(TestComponent);
			const { result } = renderHook(() => useModal(dialog));

			await act(async () => {
				void result.current.open({ title: "Test" });
			});

			expect(result.current.isOpen).toBe(true);
		});

		it("does nothing when already open", async () => {
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
		it("sets closing state when close() is called", async () => {
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

	describe("cleanup on unmount", () => {
		it("closes the modal on unmount", async () => {
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

	describe("data and role state", () => {
		it("resets data and role on reopen", async () => {
			const dialog = createDialog(TestComponent).returns<{ value: number }>();
			const { result } = renderHook(() => useModal(dialog));

			// First open and close with data
			await act(async () => {
				void result.current.open({ title: "First" });
			});
			await act(async () => {
				await result.current.close({ data: { value: 42 }, role: "confirm" });
			});

			// Wait for close to complete
			vi.advanceTimersByTime(300);

			await act(async () => {
				// Allow state updates to settle
				await Promise.resolve();
			});

			expect(result.current.data).toEqual({ value: 42 });
			expect(result.current.role).toBe("confirm");

			// Reopen - data and role should be reset to null
			await act(async () => {
				void result.current.open({ title: "Second" });
			});

			expect(result.current.isOpen).toBe(true);
			expect(result.current.data).toBeNull();
			expect(result.current.role).toBeNull();
		});
	});
});
