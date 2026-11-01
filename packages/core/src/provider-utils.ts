import { useEffect } from "react";
import type { ModalWrapperType } from "./shared/types";
import { DEFAULT_EXIT_DURATION, useModalStore } from "./store";

/**
 * Whether a wrapper is one of the built-in names rather than a custom component.
 * Custom components may be objects (React.memo / forwardRef), so check for a string.
 * @internal
 */
export function isBuiltInWrapper(
	wrapper: ModalWrapperType | undefined,
): wrapper is Extract<ModalWrapperType, string> | undefined {
	return wrapper === undefined || typeof wrapper === "string";
}

/**
 * Apply a ModalProvider's exitDuration prop to the store while it is mounted.
 * On unmount it resets the default only if no other provider has changed it since.
 * Used by ModalProvider implementations.
 * @internal
 */
export function useProviderExitDuration(exitDuration: number | undefined) {
	useEffect(() => {
		if (exitDuration === undefined) return;
		useModalStore.getState().setExitDuration(exitDuration);
		return () => {
			const store = useModalStore.getState();
			if (store.exitDuration === exitDuration) {
				store.setExitDuration(DEFAULT_EXIT_DURATION);
			}
		};
	}, [exitDuration]);
}
