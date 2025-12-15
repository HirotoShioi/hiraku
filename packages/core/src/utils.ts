import type { ModalHandle } from "./factory/types";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";

/**
 * Build a ModalHandle from a ModalInstance.
 * @template TResult - Data returned on close.
 * @param modal - Target ModalInstance.
 * @param open - Function that shows the modal (defaults to a resolved promise).
 * @returns ModalHandle for manipulating the modal.
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
