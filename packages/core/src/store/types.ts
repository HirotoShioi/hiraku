/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type { ModalResult, ModalRole, ModalWrapperType } from "../shared/types";

export interface ModalCreateOptions<TProps = unknown> {
	component: ComponentType<TProps>;
	props: TProps | undefined;
	/** Wrapper component (default: 'dialog') */
	wrapper: ModalWrapperType | undefined;
	/** Close animation duration in ms for this modal. Falls back to the store's exitDuration. */
	exitDuration?: number | undefined;
}

export interface ModalInstance<TProps = any, TResult = any>
	extends ModalCreateOptions<TProps> {
	id: string;
	open: boolean;
	closing: boolean;
	didPromise: Promise<ModalResult<TResult>>;
	resolveDid: (value: ModalResult<TResult>) => void;
	/** Result passed to close(), delivered once the close animation completes */
	result?: ModalResult<TResult> | undefined;
	/** The provider reports when the close animation completes, so no timer is used */
	exitManaged?: boolean | undefined;
}

export interface ModalState {
	modals: ModalInstance[];
	/** Default close animation duration in ms (default: 300) */
	exitDuration: number;
	add: (modal: ModalInstance) => void;
	present: (id: string) => void;
	updateProps: (id: string, props: unknown) => void;
	close: (id?: string, data?: unknown, role?: ModalRole) => Promise<boolean>;
	closeAll: () => Promise<void>;
	getTop: () => ModalInstance | undefined;
	/** Set the default close animation duration in ms */
	setExitDuration: (ms: number) => void;
	/**
	 * Mark (or unmark) a modal whose close completion is reported by the provider via completeClose.
	 * Marking cancels a close timer that is already running.
	 */
	manageExit: (id: string, managed?: boolean) => void;
	/** Finish closing a modal: resolve its result and remove it from the store */
	completeClose: (id: string) => void;
}
