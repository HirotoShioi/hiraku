import type { ModalHandle } from "./factory/types";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";

/**
 * ModalInstanceからModalHandleを生成する
 * @template TResult - closeした際に返されるデータの型
 * @param modal - 対象のModalInstance
 * @param open - モーダルを表示する関数（省略時は即座に解決するPromiseを返す）
 * @returns モーダルを操作するためのModalHandle
 * @example
 * const handle = createHandle<MyResultType>(instance, () => {
 *   useModalStore.getState().add(instance);
 *   useModalStore.getState().present(instance.id);
 *   return Promise.resolve();
 * });
 */
export function createHandle<TResult>(
	modal: ModalInstance,
	open?: () => Promise<void>,
): ModalHandle<TResult> {
	const { close, updateProps } = useModalStore.getState();
	return {
		id: modal.id,
		open: open ?? (() => Promise.resolve()),
		close: (data, role) => close(modal.id, data, role),
		updateProps: (props) => updateProps(modal.id, props),
		onDidClose: () => modal.didPromise,
	};
}
