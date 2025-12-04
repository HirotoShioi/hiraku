import type {
	GetComponentProps,
	ModalResult,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";

/**
 * Modal handle exposed to consumers.
 * @template TResult - Data returned when dismissed.
 */
export interface ModalHandle<TResult = unknown> {
	/** Unique modal ID */
	id: string;
	/**
	 * Show the modal.
	 * @returns Promise that resolves once the modal is displayed.
	 * @example
	 * await controller.open({ title: "Hello" });
	 */
	open: () => Promise<void>;
	/**
	 * Close the modal.
	 * @param data - Data returned on close.
	 * @param role - Reason for closing ("confirm", "cancel", etc.).
	 * @returns Whether close succeeded.
	 * @example
	 * await handle.close({ success: true }, "confirm");
	 */
	close: (data?: TResult, role?: ModalRole) => Promise<boolean>;
	/**
	 * Update modal props.
	 * @param props - New props (partial update).
	 * @example
	 * handle.updateProps({ title: "Updated Title" });
	 */
	updateProps: (props: unknown) => void;
	/**
	 * Promise that resolves after the modal is fully closed.
	 * Called after the close animation finishes.
	 * @returns ModalResult containing close data and role.
	 * @example
	 * const { data, role } = await modal.onDidClose();
	 * console.log("Modal closed with:", data);
	 */
	onDidClose: () => Promise<ModalResult<TResult>>;
}

/**
 * Typed modal controller.
 * Binds the component ahead of time so open/close/onDidClose are type-safe.
 * Props are inferred from the component type.
 * @template TComponent - React component type.
 * @template TResult - Data returned when closed.
 * @example
 * const mySheet = createSheet(MySheet);
 * await mySheet.open({ title: "Hello" });
 * const { data, role } = await mySheet.onDidClose();
 */
export interface Modal<TComponent, TResult = unknown> {
	/**
	 * Show the modal.
	 * If props are empty/all optional, arguments can be omitted.
	 */
	open: (
		...args: OptionalPropsArgs<GetComponentProps<TComponent>>
	) => Promise<void>;
	/**
	 * Close the modal.
	 */
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	/**
	 * Resolves when the modal is fully closed.
	 */
	onDidClose: () => Promise<ModalResult<TResult>>;
	/**
	 * Check whether the modal is currently open.
	 */
	isOpen: () => boolean;
	/**
	 * Specify the return type when closing.
	 * @example
	 * const mySheet = createSheet(MySheet).returns<{ accepted: boolean }>();
	 */
	returns<R>(): Modal<TComponent, R>;
}
