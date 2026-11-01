import { renderHook } from "@testing-library/react";
import { forwardRef, memo, type ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { isBuiltInWrapper, useProviderExitDuration } from "./provider-utils";
import { useModalStore } from "./store";

describe("isBuiltInWrapper", () => {
	it("treats names and undefined as built-in", () => {
		expect(isBuiltInWrapper(undefined)).toBe(true);
		expect(isBuiltInWrapper("dialog")).toBe(true);
		expect(isBuiltInWrapper("alert-dialog")).toBe(true);
	});

	it("treats function, memo, and forwardRef components as custom", () => {
		const Root = ({ children }: { children?: ReactNode }) => <>{children}</>;
		expect(isBuiltInWrapper(Root)).toBe(false);
		expect(isBuiltInWrapper(memo(Root))).toBe(false);
		expect(
			isBuiltInWrapper(
				forwardRef<HTMLDivElement, { children?: ReactNode }>((props, _ref) => (
					<>{props.children}</>
				)),
			),
		).toBe(false);
	});
});

describe("useProviderExitDuration", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [], exitDuration: 300 });
	});

	it("keeps the remaining provider's value when another provider unmounts", () => {
		const first = renderHook(() => useProviderExitDuration(100));
		const second = renderHook(() => useProviderExitDuration(500));
		expect(useModalStore.getState().exitDuration).toBe(500);

		first.unmount();
		expect(useModalStore.getState().exitDuration).toBe(500);

		second.unmount();
		expect(useModalStore.getState().exitDuration).toBe(300);
	});

	it("does nothing when exitDuration is undefined", () => {
		useModalStore.getState().setExitDuration(700);
		const { unmount } = renderHook(() => useProviderExitDuration(undefined));
		unmount();
		expect(useModalStore.getState().exitDuration).toBe(700);
	});
});
