"use client";

import { AlertDialog } from "@base-ui/react";
import { Dialog } from "@base-ui/react/dialog";
import type { ModalInstance } from "@hirotoshioi/hiraku-core";
import {
	isBuiltInWrapper,
	ModalContextProvider,
	useModalStore,
	useProviderExitDuration,
} from "@hirotoshioi/hiraku-core";
import { Suspense, useEffect, useState } from "react";

/**
 * Resolve a built-in wrapper type to the corresponding Base UI Root component.
 */
function getRootComponent(wrapper: ModalInstance["wrapper"]) {
	switch (wrapper) {
		case "alert-dialog":
			return AlertDialog.Root;
		default:
			return Dialog.Root;
	}
}

export interface ModalProviderProps {
	/**
	 * Close animation duration in ms for custom wrapper components.
	 * Built-in wrappers ('dialog' | 'sheet' | 'alert-dialog') detect the end of the
	 * close animation with Base UI's onOpenChangeComplete and ignore this.
	 * @default 300
	 */
	exitDuration?: number;
}

function ModalItem({ modal }: { modal: ModalInstance }) {
	const ModalComponent = modal.component;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const props = modal.props ?? {};
	const { wrapper } = modal;
	const isBuiltIn = isBuiltInWrapper(wrapper);
	// Base UI reports the end of a close only for a Root that was mounted open
	const [firstRenderedOpen] = useState(modal.open);

	// Built-in Roots report when the close animation ends, so the store skips its timer
	useEffect(() => {
		if (!isBuiltIn || !firstRenderedOpen) return;
		useModalStore.getState().manageExit(modal.id);
		return () => {
			const store = useModalStore.getState();
			if (store.modals.find((m) => m.id === modal.id)?.closing) {
				// Unmounted mid-close (e.g. the provider itself unmounted): finish now
				store.completeClose(modal.id);
			} else {
				// No one will report the close anymore, so fall back to the timer
				store.manageExit(modal.id, false);
			}
		};
	}, [modal.id, isBuiltIn, firstRenderedOpen]);

	const onOpenChange = (open: boolean) => {
		if (!open) {
			void useModalStore.getState().close(modal.id, undefined, "dismiss");
		}
	};

	const content = (
		<ModalContextProvider id={modal.id}>
			<Suspense>
				<ModalComponent {...props} />
			</Suspense>
		</ModalContextProvider>
	);

	if (!isBuiltInWrapper(wrapper)) {
		const Wrapper = wrapper;
		return (
			<Wrapper open={modal.open} onOpenChange={onOpenChange}>
				{content}
			</Wrapper>
		);
	}

	const Root = getRootComponent(wrapper);
	return (
		<Root
			open={modal.open}
			onOpenChange={onOpenChange}
			onOpenChangeComplete={(open) => {
				if (!open) {
					useModalStore.getState().completeClose(modal.id);
				}
			}}
		>
			{content}
		</Root>
	);
}

/**
 * Provider that renders all active modals.
 * Place this at the app root.
 *
 * Base UI style: the library controls the Root, users implement the Content.
 */
export function ModalProvider({ exitDuration }: ModalProviderProps = {}) {
	const modals = useModalStore((state) => state.modals);

	useProviderExitDuration(exitDuration);

	return (
		<>
			{modals.map((modal) => (
				<ModalItem key={modal.id} modal={modal} />
			))}
		</>
	);
}
