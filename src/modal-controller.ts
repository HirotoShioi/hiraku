import type { ModalHandle } from "./factory/types";
import { useModalStore } from "./store";
import { createHandle } from "./utils";

const store = () => useModalStore.getState();

/**
 * Utility helpers for managing modals.
 */
export const modalController = {
	/**
	 * Close every modal at once.
	 * @example
	 * await modal.closeAll();
	 */
	closeAll(): Promise<void> {
		return store().closeAll();
	},
	/**
	 * Get the topmost modal.
	 * @example
	 * const topModal = modal.getTop();
	 * if (topModal) {
	 *   await topModal.close();
	 * }
	 */
	getTop<TResult = unknown>(): ModalHandle<TResult> | undefined {
		const top = store().getTop();
		return top ? createHandle<TResult>(top) : undefined;
	},
	/**
	 * Count how many modals are open (excluding closing).
	 * @example
	 * const count = modal.getCount();
	 */
	getCount(): number {
		return store().modals.filter((m) => m.open && !m.closing).length;
	},
	/**
	 * Check whether any modal is open.
	 * @example
	 * if (modal.isOpen()) {
	 *   console.log("A modal is open");
	 * }
	 */
	isOpen(): boolean {
		return store().modals.some((m) => m.open && !m.closing);
	},
};
