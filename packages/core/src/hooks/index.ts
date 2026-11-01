import { useCallback, useEffect, useRef, useState } from "react";
import type { Modal } from "../factory/types";
import type {
	GetComponentProps,
	ModalResult,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";
import type { UseModalReturn } from "./types";

/**
 * Hook for working with a modal controller.
 * @template TComponent - React component type.
 * @template TResult - Data returned when closed.
 * @example
 * const sampleSheetModal = createSheet(SampleSheet).returns<SampleSheetResult>();
 *
 * // In a component
 * const sheet = useModal(sampleSheetModal);
 *
 * return (
 *   <>
 *     <Button onClick={() => sheet.open({ title: "Hello", description: "World" })}>
 *       Open
 *     </Button>
 *     <p>Result: {sheet.role} {sheet.data?.accepted}</p>
 *   </>
 * );
 */
export function useModal<TComponent, TResult = unknown>(
	controller: Modal<TComponent, TResult>,
): UseModalReturn<TComponent, TResult> {
	type TProps = GetComponentProps<TComponent>;

	const [result, setResult] = useState<ModalResult<TResult> | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const controllerRef = useRef(controller);
	// Whether the modal currently open was opened through this hook
	const openedHereRef = useRef(false);

	// Keep controller in a ref
	useEffect(() => {
		controllerRef.current = controller;
	});

	const open = useCallback((...args: OptionalPropsArgs<TProps>) => {
		// No-op if already open
		if (controllerRef.current.isOpen()) {
			return;
		}

		setResult(null);
		setIsOpen(true);
		openedHereRef.current = true;
		// Wait for this modal's own result (do not block the caller)
		void controllerRef.current
			.open(...args)
			.then((ref) => ref.result)
			.then((closeResult) => {
				openedHereRef.current = false;
				setResult(closeResult);
				setIsOpen(false);
			});
	}, []);

	const close = useCallback(
		async (options?: { data?: TResult; role?: ModalRole }) => {
			return controllerRef.current.close(options);
		},
		[],
	);

	// Close the modal this hook opened when the component unmounts
	useEffect(() => {
		return () => {
			if (openedHereRef.current && controllerRef.current.isOpen()) {
				void controllerRef.current.close();
			}
		};
	}, []);

	return {
		isOpen,
		open: open as UseModalReturn<TComponent, TResult>["open"],
		close,
		data: result?.data ?? null,
		role: result?.role ?? null,
	};
}
