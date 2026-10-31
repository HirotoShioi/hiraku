import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDialog } from "../factory";
import { useModalStore } from "../store";
import { ModalContextProvider, useModalContext } from "./index";

function SelfClosing() {
	const modal = useModalContext<string>();
	return (
		<button
			type="button"
			onClick={() => void modal.close({ data: "done", role: "confirm" })}
		>
			{modal.isClosing ? "closing" : "open"}
		</button>
	);
}

// Minimal stand-in for a UI package's ModalProvider
function TestProvider() {
	const modals = useModalStore((state) => state.modals);
	return (
		<>
			{modals.map((modal) => {
				const Component = modal.component;
				return (
					<ModalContextProvider key={modal.id} id={modal.id}>
						<Component {...(modal.props ?? {})} />
					</ModalContextProvider>
				);
			})}
		</>
	);
}

describe("useModalContext", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("closes its own modal and exposes isClosing", async () => {
		const dialog = createDialog(SelfClosing).returns<string>();
		render(<TestProvider />);

		const ref = await act(() => dialog.open());
		expect(screen.getByRole("button").textContent).toBe("open");

		act(() => screen.getByRole("button").click());
		expect(screen.getByRole("button").textContent).toBe("closing");

		act(() => vi.advanceTimersByTime(300));
		await expect(ref.result).resolves.toEqual({
			data: "done",
			role: "confirm",
		});
	});

	it("throws outside a modal", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => renderHook(() => useModalContext())).toThrow(
			"useModalContext must be used inside a modal rendered by ModalProvider.",
		);
	});
});
