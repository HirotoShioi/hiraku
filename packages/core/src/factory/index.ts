/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type {
	GetComponentProps,
	ModalResult,
	ModalRole,
	ModalWrapperType,
	OptionalPropsArgs,
} from "../shared/types";
import { useModalStore } from "../store";
import type { ModalCreateOptions, ModalInstance } from "../store/types";
import type { Modal, ModalOptions, ModalRef } from "./types";

const store = () => useModalStore.getState();

const createId = () =>
	crypto.randomUUID?.() ?? Math.random().toString(16).slice(2);

const createDeferred = <T>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { promise, resolve };
};

function createModalInstance<TProps = unknown, TResult = unknown>(
	options: ModalCreateOptions<TProps>,
): ModalInstance<TProps, TResult> {
	const did = createDeferred<ModalResult<TResult>>();
	return {
		...options,
		id: createId(),
		open: false,
		closing: false,
		didPromise: did.promise,
		resolveDid: did.resolve,
	};
}

function createRef<TProps, TResult>(
	instance: ModalInstance<TProps, TResult>,
): ModalRef<TProps, TResult> {
	const { id } = instance;
	return {
		id,
		result: instance.didPromise,
		update: (props) => {
			const current = store().modals.find((m) => m.id === id);
			if (!current) return;
			store().updateProps(id, { ...current.props, ...props });
		},
		close: (closeOptions) =>
			store().close(id, closeOptions?.data, closeOptions?.role),
		isOpen: () =>
			store().modals.some((m) => m.id === id && m.open && !m.closing),
	};
}

function createController<TResult = unknown, TProps = unknown>(options: {
	component: ComponentType<TProps>;
	/** Wrapper component ('dialog' | 'sheet' | 'alert-dialog' or custom). @default 'dialog' */
	wrapper?: ModalWrapperType;
	exitDuration?: number | undefined;
}): {
	open: (props?: TProps) => Promise<ModalRef<TProps, TResult>>;
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	onDidClose: () => Promise<ModalResult<TResult>>;
	isOpen: () => boolean;
} {
	let current: ModalRef<TProps, TResult> | undefined;

	const open = async (props?: TProps): Promise<ModalRef<TProps, TResult>> => {
		// No-op if an instance is already open and not closing
		if (current?.isOpen()) {
			return current;
		}

		const instance = createModalInstance<TProps, TResult>({
			component: options.component,
			props: props ?? ({} as TProps),
			wrapper: options.wrapper,
			exitDuration: options.exitDuration,
		});
		current = createRef(instance);

		store().add(instance);
		store().present(instance.id);
		return current;
	};

	const close = async (closeOptions?: {
		data?: TResult;
		role?: ModalRole;
	}): Promise<boolean> => {
		if (!current) {
			return false;
		}
		return current.close(closeOptions);
	};

	const onDidClose = async (): Promise<ModalResult<TResult>> => {
		if (!current) {
			return {};
		}
		const ref = current;
		const result = await ref.result;
		// Keep the reference if the modal was reopened while we were waiting
		if (current === ref) {
			current = undefined;
		}
		return result;
	};

	const isOpen = (): boolean => current?.isOpen() ?? false;

	return {
		open,
		close,
		onDidClose,
		isOpen,
	};
}

/**
 * Internal helper to create a modal controller.
 * Automatically infers Props from the component type.
 */
function createModal<TComponent extends ComponentType<any>, TResult>(
	wrapper: ModalWrapperType,
	component: TComponent,
	modalOptions: ModalOptions | undefined,
): Modal<TComponent, TResult> {
	type TProps = GetComponentProps<TComponent>;

	const controller = createController<TResult, TProps>({
		component: component as ComponentType<TProps>,
		wrapper,
		exitDuration: modalOptions?.exitDuration,
	});

	const open = (...args: OptionalPropsArgs<TProps>) => {
		const [props] = args;
		return controller.open(props as TProps);
	};

	return {
		open,
		openAsync: (...args: OptionalPropsArgs<TProps>) =>
			open(...args).then((ref) => ref.result),
		close: controller.close,
		onDidClose: controller.onDidClose,
		isOpen: controller.isOpen,
		returns<R>() {
			return createModal<TComponent, R>(wrapper, component, modalOptions);
		},
	};
}

function createModalStarter(wrapper: ModalWrapperType) {
	return <TComponent extends ComponentType<any>>(
		component: TComponent,
		options?: ModalOptions,
	): Modal<TComponent, unknown> => {
		return createModal<TComponent, unknown>(wrapper, component, options);
	};
}

/**
 * Create a Sheet modal controller.
 * @param component - React component to render (props are inferred)
 * @param options - Optional settings such as exitDuration
 * @example
 * // Basic usage
 * const mySheet = createSheet(MySheet);
 *
 * // Specify return type
 * const mySheet = createSheet(MySheet).returns<MyResult>();
 */
export const createSheet = createModalStarter("sheet");

/**
 * Create a Dialog modal controller.
 * @param component - React component to render (props are inferred)
 * @param options - Optional settings such as exitDuration
 * @example
 * const myDialog = createDialog(MyDialog);
 * const myDialog = createDialog(MyDialog).returns<MyResult>();
 */
export const createDialog = createModalStarter("dialog");

/**
 * Create an AlertDialog modal controller.
 * @param component - React component to render (props are inferred)
 * @param options - Optional settings such as exitDuration
 * @example
 * const myAlert = createAlertDialog(MyAlert);
 * const myAlert = createAlertDialog(MyAlert).returns<MyResult>();
 */
export const createAlertDialog = createModalStarter("alert-dialog");
