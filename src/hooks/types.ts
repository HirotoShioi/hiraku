import type {
	GetComponentProps,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";

/**
 * useModalフックの戻り値の型
 */
export interface UseModalReturn<TComponent, TResult = unknown> {
	isOpen: boolean;
	open: (...args: OptionalPropsArgs<GetComponentProps<TComponent>>) => void;
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	data: TResult | null;
	role: ModalRole | null;
}
