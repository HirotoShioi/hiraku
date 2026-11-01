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
 * Options accepted by createDialog / createSheet / createAlertDialog.
 */
export interface ModalOptions {
	/**
	 * Close animation duration in ms. The modal stays mounted this long after close()
	 * before it is removed and onDidClose resolves.
	 * Overrides the ModalProvider's exitDuration. Base UI built-in wrappers detect the
	 * end of the animation themselves and ignore this.
	 */
	exitDuration?: number | undefined;
}

/**
 * Reference to a single opened modal, returned by open().
 * @template TProps - Props of the modal component.
 * @template TResult - Data returned when closed.
 * @example
 * const ref = await uploadDialog.open({ progress: 0 });
 * ref.update({ progress: 50 });
 * const { data, role } = await ref.result;
 */
export interface ModalRef<TProps, TResult = unknown> {
	/** Unique modal ID */
	readonly id: string;
	/** Resolves with this modal's result after its close animation finishes. */
	readonly result: Promise<ModalResult<TResult>>;
	/**
	 * Merge new props into this modal's current props.
	 * @example
	 * ref.update({ progress: 50 });
	 */
	update: (props: Partial<TProps>) => void;
	/**
	 * Close this modal.
	 * @returns false if it is already closing or closed.
	 */
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	/** Whether this modal is open and not closing. */
	isOpen: () => boolean;
}

/**
 * Typed modal controller.
 * Binds the component ahead of time so open/close/onDidClose are type-safe.
 * Props are inferred from the component type.
 * @template TComponent - React component type.
 * @template TResult - Data returned when closed.
 * @example
 * const mySheet = createSheet(MySheet).returns<MyResult>();
 * const { data, role } = await mySheet.openAsync({ title: "Hello" });
 */
export interface Modal<TComponent, TResult = unknown> {
	/**
	 * Show the modal and return a reference to it.
	 * If this controller's modal is already open, nothing changes and the open modal's reference is returned.
	 * If props are empty/all optional, arguments can be omitted.
	 * @example
	 * const ref = await mySheet.open({ title: "Hello" });
	 * const { data, role } = await ref.result;
	 */
	open: (
		...args: OptionalPropsArgs<GetComponentProps<TComponent>>
	) => Promise<ModalRef<GetComponentProps<TComponent>, TResult>>;
	/**
	 * Show the modal and wait for its result.
	 * @example
	 * const { data, role } = await mySheet.openAsync({ title: "Hello" });
	 */
	openAsync: (
		...args: OptionalPropsArgs<GetComponentProps<TComponent>>
	) => Promise<ModalResult<TResult>>;
	/**
	 * Close the modal.
	 */
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	/**
	 * Resolves when the modal is fully closed.
	 * Resolves immediately with {} if the modal was never opened.
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
