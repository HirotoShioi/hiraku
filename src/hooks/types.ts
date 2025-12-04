import type {
	GetComponentProps,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";

/**
 * Return type of the useModal hook.
 */
export interface UseModalReturn<TComponent, TResult = unknown> {
	isOpen: boolean;
	open: (...args: OptionalPropsArgs<GetComponentProps<TComponent>>) => void;
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	data: TResult | null;
	role: ModalRole | null;
}
