/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type { ModalResult, ModalRole, ModalWrapperType } from "../shared/types";

export interface ModalCreateOptions<TProps = unknown> {
	component: ComponentType<TProps>;
	props: TProps | undefined;
	/** ラッパーコンポーネント（デフォルト: 'dialog'） */
	wrapper: ModalWrapperType | undefined;
}

export interface ModalInstance<TProps = any, TResult = any>
	extends ModalCreateOptions<TProps> {
	id: string;
	open: boolean;
	closing: boolean;
	didPromise: Promise<ModalResult<TResult>>;
	resolveDid: (value: ModalResult<TResult>) => void;
}

export interface ModalState {
	modals: ModalInstance[];
	add: (modal: ModalInstance) => void;
	present: (id: string) => void;
	updateProps: (id: string, props: unknown) => void;
	close: (id?: string, data?: unknown, role?: ModalRole) => Promise<boolean>;
	closeAll: () => Promise<void>;
	getTop: () => ModalInstance | undefined;
}
