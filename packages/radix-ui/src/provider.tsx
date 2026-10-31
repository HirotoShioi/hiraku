"use client";

import type {
	ModalInstance,
	ModalWrapperComponent,
	ModalWrapperType,
} from "@hirotoshioi/hiraku-core";
import { ModalContextProvider, useModalStore } from "@hirotoshioi/hiraku-core";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Suspense, useEffect } from "react";

/**
 * Resolve a wrapper type to the corresponding Radix UI Root component.
 */
function getWrapperComponent(
	wrapper: ModalWrapperType | undefined,
): ModalWrapperComponent {
	if (typeof wrapper === "function") {
		return wrapper;
	}
	switch (wrapper) {
		case "sheet":
			return DialogPrimitive.Root;
		case "alert-dialog":
			return AlertDialogPrimitive.Root;
		default:
			return DialogPrimitive.Root;
	}
}

export interface ModalProviderProps {
	/**
	 * Close animation duration in ms. Radix UI does not report when the close
	 * animation ends, so modals stay mounted this long after close().
	 * Match it to your Content's exit animation. Per-modal exitDuration overrides it.
	 * @default 300
	 */
	exitDuration?: number;
}

function ModalItem({ modal }: { modal: ModalInstance }) {
	const ModalComponent = modal.component;
	const Wrapper = getWrapperComponent(modal.wrapper);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const props = modal.props ?? {};

	const onOpenChange = (open: boolean) => {
		if (!open) {
			void useModalStore.getState().close(modal.id, undefined, "dismiss");
		}
	};

	return (
		<Wrapper open={modal.open} onOpenChange={onOpenChange}>
			<ModalContextProvider id={modal.id}>
				<Suspense>
					<ModalComponent {...props} />
				</Suspense>
			</ModalContextProvider>
		</Wrapper>
	);
}

/**
 * Provider that renders all active modals.
 * Place this at the app root.
 *
 * pushmodal style: the library controls the Root, users implement the Content.
 */
export function ModalProvider({ exitDuration }: ModalProviderProps = {}) {
	const modals = useModalStore((state) => state.modals);

	useEffect(() => {
		if (exitDuration === undefined) return;
		const { exitDuration: previous, setExitDuration } =
			useModalStore.getState();
		setExitDuration(exitDuration);
		return () => setExitDuration(previous);
	}, [exitDuration]);

	return (
		<>
			{modals.map((modal) => (
				<ModalItem key={modal.id} modal={modal} />
			))}
		</>
	);
}
