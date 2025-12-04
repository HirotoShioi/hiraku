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
import { createHandle } from "../utils";
import type { Modal, ModalHandle } from "./types";

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
): ModalHandle<TResult> {
	const id = createId();
	const did = createDeferred<ModalResult<TResult>>();

	const instance: ModalInstance<TProps, TResult> = {
		...options,
		id,
		open: false,
		closing: false,
		didPromise: did.promise,
		resolveDid: did.resolve,
	};

	const open = () => {
		store().add(instance);
		store().present(id);
		return Promise.resolve();
	};

	return createHandle<TResult>(instance, open);
}

function createController<TResult = unknown, TProps = unknown>(options: {
	component: ComponentType<TProps>;
	/** ラッパーコンポーネント（'dialog' | 'sheet' | 'alert-dialog' またはカスタム）@default 'dialog' */
	wrapper?: ModalWrapperType;
}): {
	open: (props?: TProps) => Promise<void>;
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	onDidClose: () => Promise<ModalResult<TResult>>;
	isOpen: () => boolean;
} {
	let currentHandle: ModalHandle<TResult> | undefined;

	const open = async (props?: TProps): Promise<void> => {
		// 既に開いている場合は何もしない
		if (
			currentHandle &&
			store().modals.some(
				(m) => m.id === currentHandle?.id && m.open && !m.closing,
			)
		) {
			return;
		}

		currentHandle = createModalInstance<TProps, TResult>({
			component: options.component,
			props: props ?? ({} as TProps),
			wrapper: options.wrapper,
		});

		await currentHandle.open();
	};

	const close = async (closeOptions?: {
		data?: TResult;
		role?: ModalRole;
	}): Promise<boolean> => {
		if (!currentHandle) {
			return false;
		}
		return currentHandle.close(closeOptions?.data, closeOptions?.role);
	};

	const onDidClose = async (): Promise<ModalResult<TResult>> => {
		if (!currentHandle) {
			return {};
		}
		const result = await currentHandle.onDidClose();
		currentHandle = undefined;
		return result;
	};

	const isOpen = (): boolean => {
		if (!currentHandle) {
			return false;
		}
		return store().modals.some(
			(m) => m.id === currentHandle?.id && m.open && !m.closing,
		);
	};

	return {
		open,
		close,
		onDidClose,
		isOpen,
	};
}

/**
 * モーダルコントローラーを作成する内部関数
 * コンポーネントの型からPropsを自動推論
 */
function createModal<TComponent extends ComponentType<any>, TResult>(
	wrapper: ModalWrapperType,
	component: TComponent,
): Modal<TComponent, TResult> {
	type TProps = GetComponentProps<TComponent>;

	const controller = createController<TResult, TProps>({
		component: component as ComponentType<TProps>,
		wrapper,
	});

	return {
		open: ((...args: OptionalPropsArgs<TProps>) => {
			const [props] = args;
			return controller.open(props as TProps);
		}) as Modal<TComponent, TResult>["open"],
		close: controller.close,
		onDidClose: controller.onDidClose,
		isOpen: controller.isOpen,
		returns<R>() {
			return createModal<TComponent, R>(wrapper, component);
		},
	};
}

function createModalStarter(wrapper: ModalWrapperType) {
	return <TComponent extends ComponentType<any>>(
		component: TComponent,
	): Modal<TComponent, unknown> => {
		return createModal<TComponent, unknown>(wrapper, component);
	};
}

/**
 * Sheetモーダルコントローラーを作成する
 * @param component - 表示するReactコンポーネント（Propsは自動推論）
 * @example
 * // 基本形
 * const mySheet = createSheet(MySheet);
 *
 * // 戻り値の型を指定
 * const mySheet = createSheet(MySheet).returns<MyResult>();
 */
export const createSheet = createModalStarter("sheet");

/**
 * Dialogモーダルコントローラーを作成する
 * @param component - 表示するReactコンポーネント（Propsは自動推論）
 * @example
 * const myDialog = createDialog(MyDialog);
 * const myDialog = createDialog(MyDialog).returns<MyResult>();
 */
export const createDialog = createModalStarter("dialog");

/**
 * AlertDialogモーダルコントローラーを作成する
 * @param component - 表示するReactコンポーネント（Propsは自動推論）
 * @example
 * const myAlert = createAlertDialog(MyAlert);
 * const myAlert = createAlertDialog(MyAlert).returns<MyResult>();
 */
export const createAlertDialog = createModalStarter("alert-dialog");
