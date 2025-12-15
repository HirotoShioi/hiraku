import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { modalController } from "./modal-controller";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";

function createMockModalInstance(
	overrides: Partial<ModalInstance> = {},
): ModalInstance {
	const resolveDid = vi.fn();
	return {
		id: crypto.randomUUID(),
		component: () => null,
		props: {},
		wrapper: "dialog",
		open: true,
		closing: false,
		didPromise: new Promise((resolve) => {
			resolveDid.mockImplementation(resolve);
		}),
		resolveDid,
		...overrides,
	};
}

describe("modalController", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("closeAll", () => {
		it("closes every modal", async () => {
			const modal1 = createMockModalInstance({ open: true });
			const modal2 = createMockModalInstance({ open: true });
			useModalStore.setState({ modals: [modal1, modal2] });

			await modalController.closeAll();

			const modals = useModalStore.getState().modals;
			expect(modals.every((m) => m.closing)).toBe(true);
		});
	});

	describe("getTop", () => {
		it("returns the topmost modal handle", () => {
			const modal1 = createMockModalInstance();
			const modal2 = createMockModalInstance();
			useModalStore.setState({ modals: [modal1, modal2] });

			const top = modalController.getTop();

			expect(top).toBeDefined();
			expect(top?.id).toBe(modal2.id);
		});

		it("returns undefined when no modals exist", () => {
			const top = modalController.getTop();

			expect(top).toBeUndefined();
		});
	});

	describe("getCount", () => {
		it("returns the count of open modals (excluding closing)", () => {
			const modal1 = createMockModalInstance({ open: true, closing: false });
			const modal2 = createMockModalInstance({ open: true, closing: true });
			useModalStore.setState({ modals: [modal1, modal2] });

			expect(modalController.getCount()).toBe(1);
		});
	});

	describe("isOpen", () => {
		it("returns true when a modal is open", () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.setState({ modals: [modal] });

			expect(modalController.isOpen()).toBe(true);
		});

		it("returns false when there are no modals", () => {
			expect(modalController.isOpen()).toBe(false);
		});

		it("returns false when only closing modals remain", () => {
			const modal = createMockModalInstance({ open: true, closing: true });
			useModalStore.setState({ modals: [modal] });

			expect(modalController.isOpen()).toBe(false);
		});
	});
});
