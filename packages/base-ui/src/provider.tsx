"use client";

import { AlertDialog } from "@base-ui/react";
import { Dialog } from "@base-ui/react/dialog";
import type { ModalInstance } from "@hirotoshioi/hiraku-core";
import { ModalContextProvider, useModalStore } from "@hirotoshioi/hiraku-core";
import { Suspense, useEffect } from "react";

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
	const isBuiltIn = typeof modal.wrapper !== "function";

	// Built-in Roots report when the close animation ends, so the store skips its timer
	useEffect(() => {
		if (!isBuiltIn) return;
		const store = useModalStore.getState();
		store.manageExit(modal.id);
		return () => {
			// Unmounted mid-close (e.g. the provider itself unmounted): finish now
			useModalStore.getState().completeClose(modal.id);
		};
	}, [modal.id, isBuiltIn]);

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

	if (typeof modal.wrapper === "function") {
		const Wrapper = modal.wrapper;
		return (
			<Wrapper open={modal.open} onOpenChange={onOpenChange}>
				{content}
			</Wrapper>
		);
	}

	const Root = getRootComponent(modal.wrapper);
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
