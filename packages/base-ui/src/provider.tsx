"use client";

import { AlertDialog } from "@base-ui/react";
import { Dialog } from "@base-ui/react/dialog";
import type {
	ModalRole,
	ModalWrapperComponent,
	ModalWrapperType,
} from "@hirotoshioi/hiraku-core";
import { useModalStore } from "@hirotoshioi/hiraku-core";
import { Suspense } from "react";

/**
 * Resolve a wrapper type to the corresponding Base UI Root component.
 */
function getWrapperComponent(
	wrapper: ModalWrapperType | undefined,
): ModalWrapperComponent {
	if (typeof wrapper === "function") {
		return wrapper;
	}
	switch (wrapper) {
		case "sheet":
			return Dialog.Root;
		case "alert-dialog":
			return AlertDialog.Root;
		default:
			return Dialog.Root;
	}
}

/**
 * Provider that renders all active modals.
 * Place this at the app root.
 *
 * Base UI style: the library controls the Root, users implement the Content.
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
