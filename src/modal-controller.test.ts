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
		it("全てのモーダルをcloseする", async () => {
			const modal1 = createMockModalInstance({ open: true });
			const modal2 = createMockModalInstance({ open: true });
			useModalStore.setState({ modals: [modal1, modal2] });

			await modalController.closeAll();

			const modals = useModalStore.getState().modals;
			expect(modals.every((m) => m.closing)).toBe(true);
		});
	});

	describe("getTop", () => {
		it("最上位のモーダルハンドルを返す", () => {
			const modal1 = createMockModalInstance();
			const modal2 = createMockModalInstance();
			useModalStore.setState({ modals: [modal1, modal2] });

			const top = modalController.getTop();

			expect(top).toBeDefined();
			expect(top?.id).toBe(modal2.id);
		});

		it("モーダルがない場合はundefinedを返す", () => {
			const top = modalController.getTop();

			expect(top).toBeUndefined();
		});
	});

	describe("getCount", () => {
		it("開いているモーダルの数を返す（closingは除く）", () => {
			const modal1 = createMockModalInstance({ open: true, closing: false });
			const modal2 = createMockModalInstance({ open: true, closing: true });
			useModalStore.setState({ modals: [modal1, modal2] });

			expect(modalController.getCount()).toBe(1);
		});
	});

	describe("isOpen", () => {
		it("モーダルが開いている場合はtrueを返す", () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.setState({ modals: [modal] });

			expect(modalController.isOpen()).toBe(true);
		});

		it("モーダルがない場合はfalseを返す", () => {
			expect(modalController.isOpen()).toBe(false);
		});

		it("closingのモーダルのみの場合はfalseを返す", () => {
			const modal = createMockModalInstance({ open: true, closing: true });
			useModalStore.setState({ modals: [modal] });

			expect(modalController.isOpen()).toBe(false);
		});
	});
});
