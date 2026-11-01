import {
	type Context,
	createContext,
	createElement,
	type ReactNode,
	useCallback,
	useContext,
} from "react";
import type { ModalRole } from "../shared/types";
import { useModalStore } from "../store";
import type { ModalContextValue } from "./types";

// Created on first use so that importing the package from a React Server Component
// does not call createContext, which is unavailable there.
let modalIdContext: Context<string | null> | undefined;
const getModalIdContext = () => {
	modalIdContext ??= createContext<string | null>(null);
	return modalIdContext;
};

/**
 * Provide the modal ID to the modal component rendered inside.
 * Used by ModalProvider implementations; apps do not need to render it.
 * @internal
 */
export function ModalContextProvider({
	id,
	children,
}: {
	id: string;
	children?: ReactNode;
}) {
	return createElement(getModalIdContext().Provider, { value: id }, children);
}

/**
 * Access the modal this component is rendered in.
 * Lets a modal component close itself without importing its controller,
 * so the same component can be used by several controllers.
 * @template TResult - Data returned when closed.
 * @throws If called outside a modal rendered by ModalProvider.
 * @example
 * function ConfirmDialog({ message }: Props) {
 *   const modal = useModalContext<boolean>();
 *   return (
 *     <Button onClick={() => modal.close({ data: true, role: "confirm" })}>
 *       OK
 *     </Button>
 *   );
 * }
 */
export function useModalContext<
	TResult = unknown,
>(): ModalContextValue<TResult> {
	const id = useContext(getModalIdContext());
	if (id === null) {
		throw new Error(
			"useModalContext must be used inside a modal rendered by ModalProvider.",
		);
	}

	const isClosing = useModalStore(
		(state) => state.modals.find((m) => m.id === id)?.closing ?? false,
	);

	const close = useCallback(
		(options?: { data?: TResult; role?: ModalRole }) =>
			useModalStore.getState().close(id, options?.data, options?.role),
		[id],
	);

	return { id, isClosing, close };
}
