import type { ModalRole } from "../shared/types";

/**
 * Return type of the useModalContext hook.
 * @template TResult - Data returned when closed.
 */
export interface ModalContextValue<TResult = unknown> {
	/** ID of the modal this component is rendered in */
	id: string;
	/** Whether the modal is playing its close animation */
	isClosing: boolean;
	/**
	 * Close the modal this component is rendered in.
	 * @returns false if it is already closing.
	 */
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
}
