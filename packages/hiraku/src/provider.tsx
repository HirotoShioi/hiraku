"use client";

import type {
	ModalRole,
	ModalWrapperComponent,
	ModalWrapperType,
} from "@hirotoshioi/hiraku-core";
import { useModalStore } from "@hirotoshioi/hiraku-core";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Suspense } from "react";

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

/**
 * Provider that renders all active modals.
 * Place this at the app root.
 *
 * pushmodal style: the library controls the Root, users implement the Content.
 */
export function ModalProvider() {
	const modals = useModalStore((state) => state.modals);
	const close = useModalStore((state) => state.close);

	const handleClose = (id: string, role: ModalRole = "dismiss") => {
		void close(id, undefined, role);
	};

	return (
		<>
			{modals.map((modal) => {
				const ModalComponent = modal.component;
				const Wrapper = getWrapperComponent(modal.wrapper);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const props = modal.props ?? {};

				const onOpenChange = (open: boolean) => {
					if (!open) {
						handleClose(modal.id, "dismiss");
					}
				};

				return (
					<Wrapper key={modal.id} open={modal.open} onOpenChange={onOpenChange}>
						<Suspense>
							<ModalComponent {...props} />
						</Suspense>
					</Wrapper>
				);
			})}
		</>
	);
}
