import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModalStore } from "../store";
import { createAlertDialog, createDialog, createSheet } from "./index";

// Mock component for tests
interface TestProps {
	title: string;
	description?: string;
}

function TestComponent(_props: TestProps) {
	return null;
}

// Component with no required props
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
		it("adds a modal to the store on open()", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.wrapper).toBe("dialog");
			expect(modals[0]?.open).toBe(true);
		});

		it("passes props correctly", async () => {
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
		it("sets wrapper to sheet", async () => {
			const sheet = createSheet(TestComponent);

			await sheet.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.wrapper).toBe("sheet");
		});
	});

	describe("createAlertDialog", () => {
		it("sets wrapper to alert-dialog", async () => {
			const alertDialog = createAlertDialog(TestComponent);

			await alertDialog.open({ title: "Test" });

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.wrapper).toBe("alert-dialog");
		});
	});

	describe("open", () => {
		it("does nothing if already open", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "First" });
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.props).toEqual({ title: "First" });
		});

		it("allows omitting args when all props are optional", async () => {
			const dialog = createDialog(OptionalPropsComponent);

			await dialog.open();

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
		});
	});

	describe("close", () => {
		it("can close a modal", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });
			const result = await dialog.close();

			expect(result).toBe(true);
			const modals = useModalStore.getState().modals;
			expect(modals[0]?.closing).toBe(true);
		});

		it("returns false when not open", async () => {
			const dialog = createDialog(TestComponent);

			const result = await dialog.close();

			expect(result).toBe(false);
		});
	});

	describe("isOpen", () => {
		it("returns true when modal is open", async () => {
			const dialog = createDialog(TestComponent);

			expect(dialog.isOpen()).toBe(false);

			await dialog.open({ title: "Test" });

			expect(dialog.isOpen()).toBe(true);
		});

		it("returns false when closing", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });
			await dialog.close();

			expect(dialog.isOpen()).toBe(false);
		});
	});

	describe("onDidClose", () => {
		it("returns result when close finishes", async () => {
			const dialog = createDialog(TestComponent).returns<{ value: number }>();

			await dialog.open({ title: "Test" });

			const closePromise = dialog.onDidClose();
			await dialog.close({ data: { value: 42 }, role: "confirm" });

			vi.advanceTimersByTime(300);

			const result = await closePromise;
			expect(result).toEqual({ data: { value: 42 }, role: "confirm" });
		});

		it("resolves immediately with empty result if not open", async () => {
			const dialog = createDialog(TestComponent);

			const result = await dialog.onDidClose();

			expect(result).toEqual({});
		});
	});

	describe("edge cases", () => {
		it("can open again after close", async () => {
			const dialog = createDialog(TestComponent);

			// First open
			await dialog.open({ title: "First" });
			await dialog.close();
			vi.advanceTimersByTime(300);

			expect(useModalStore.getState().modals).toHaveLength(0);

			// Second open
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			expect(modals).toHaveLength(1);
			expect(modals[0]?.props).toEqual({ title: "Second" });
		});

		it("is safe to call close multiple times", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "Test" });

			const result1 = await dialog.close();
			const result2 = await dialog.close();

			expect(result1).toBe(true);
			expect(result2).toBe(false); // already closing
		});

		it("can open a new instance while the previous one is closing", async () => {
			const dialog = createDialog(TestComponent);

			await dialog.open({ title: "First" });
			await dialog.close();

			// Still within the 300ms closing window
			vi.advanceTimersByTime(100);

			// A new instance can be created while closing
			// (allows quick reopen)
			await dialog.open({ title: "Second" });

			const modals = useModalStore.getState().modals;
			// Closing instance and new instance coexist
			expect(modals).toHaveLength(2);
			expect(modals[0]?.closing).toBe(true);
			expect(modals[1]?.open).toBe(true);
		});

		it("different controllers operate independently", async () => {
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
