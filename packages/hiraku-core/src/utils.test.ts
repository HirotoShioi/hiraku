import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";
import { createHandle } from "./utils";

function createMockModalInstance(
	overrides: Partial<ModalInstance> = {},
): ModalInstance {
	const resolveDid = vi.fn();
	return {
		id: crypto.randomUUID(),
		component: () => null,
		props: {},
		wrapper: "dialog",
		open: false,
		closing: false,
		didPromise: new Promise((resolve) => {
			resolveDid.mockImplementation(resolve);
		}),
		resolveDid,
		...overrides,
	};
}

describe("createHandle", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns a ModalHandle with correct id", () => {
		const modal = createMockModalInstance({ id: "test-id" });

		const handle = createHandle(modal);

		expect(handle.id).toBe("test-id");
	});

	it("close() calls store.close with correct arguments", async () => {
		const modal = createMockModalInstance({ open: true });
		useModalStore.getState().add(modal);

		const handle = createHandle(modal);
		const result = await handle.close({ success: true }, "confirm");

		expect(result).toBe(true);

		const storeModal = useModalStore.getState().modals[0];
		expect(storeModal?.closing).toBe(true);

		vi.advanceTimersByTime(300);
		expect(modal.resolveDid).toHaveBeenCalledWith({
			data: { success: true },
			role: "confirm",
		});
	});

	it("updateProps() calls store.updateProps", () => {
		const modal = createMockModalInstance({ props: { title: "old" } });
		useModalStore.getState().add(modal);

		const handle = createHandle(modal);
		handle.updateProps({ title: "new" });

		const storeModal = useModalStore.getState().modals[0];
		expect(storeModal?.props).toEqual({ title: "new" });
	});

	it("onDidClose() returns the modal's didPromise", async () => {
		const modal = createMockModalInstance({ open: true });
		useModalStore.getState().add(modal);

		const handle = createHandle(modal);
		const closePromise = handle.onDidClose();

		// closePromise should be the same as modal.didPromise
		expect(closePromise).toBe(modal.didPromise);

		// Resolve it through close
		await handle.close({ value: 42 }, "confirm");
		vi.advanceTimersByTime(300);

		const result = await closePromise;
		expect(result).toEqual({ data: { value: 42 }, role: "confirm" });
	});

	it("open() defaults to resolved promise when not provided", async () => {
		const modal = createMockModalInstance();

		const handle = createHandle(modal);

		// Should return resolved promise immediately
		await expect(handle.open()).resolves.toBeUndefined();
	});

	it("open() uses provided function when given", async () => {
		const modal = createMockModalInstance();
		const openFn = vi.fn().mockResolvedValue(undefined);

		const handle = createHandle(modal, openFn);
		await handle.open();

		expect(openFn).toHaveBeenCalledTimes(1);
	});
});
