import type { ModalHandle } from "./factory/types";
import { useModalStore } from "./store";
import { createHandle } from "./utils";

const store = () => useModalStore.getState();

/**
 * モーダル管理用のユーティリティ
 */
export const modalController = {
	/**
	 * 全てのモーダルを一括でcloseする
	 * @example
	 * await modal.closeAll();
	 */
	closeAll(): Promise<void> {
		return store().closeAll();
	},
	/**
	 * 最前面のモーダルを取得する
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
	 * 現在開いているモーダルの数を取得する
	 * @example
	 * const count = modal.getCount();
	 */
	getCount(): number {
		return store().modals.filter((m) => m.open && !m.closing).length;
	},
	/**
	 * モーダルが開いているかどうかを確認する
	 * @example
	 * if (modal.isOpen()) {
	 *   console.log("モーダルが開いています");
	 * }
	 */
	isOpen(): boolean {
		return store().modals.some((m) => m.open && !m.closing);
	},
};
