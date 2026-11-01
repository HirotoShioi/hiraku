/**
 * Browser tests for openAsync, ModalRef, useModalContext, and close timing.
 */

import {
	createDialog,
	ModalProvider,
	useModalContext,
	useModalStore,
} from "@hirotoshioi/hiraku-base-ui";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

function SelfClosingDialog({ label }: { label: string }) {
	const modal = useModalContext<string>();
	return (
		<DialogContent data-testid="self-closing">
			<DialogTitle data-testid="self-closing-title">{label}</DialogTitle>
			<DialogDescription>
				Closes itself through useModalContext
			</DialogDescription>
			<Button
				data-testid="self-close"
				onClick={() => void modal.close({ data: label, role: "confirm" })}
			>
				Done
			</Button>
		</DialogContent>
	);
}

describe("openAsync / ModalRef / useModalContext", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		render(<ModalProvider />);
	});

	it("openAsync resolves with the result passed to useModalContext().close", async () => {
		const dialog = createDialog(SelfClosingDialog).returns<string>();

		const resultPromise = dialog.openAsync({ label: "first" });
		await page.getByTestId("self-close").click();

		await expect(resultPromise).resolves.toEqual({
			data: "first",
			role: "confirm",
		});
		await expect
			.element(page.getByTestId("self-closing"))
			.not.toBeInTheDocument();
	});

	it("the same component works with several controllers", async () => {
		const a = createDialog(SelfClosingDialog).returns<string>();
		const b = createDialog(SelfClosingDialog).returns<string>();

		const resultA = a.openAsync({ label: "a" });
		await page.getByTestId("self-close").click();
		await expect(resultA).resolves.toMatchObject({ data: "a" });

		const resultB = b.openAsync({ label: "b" });
		await page.getByTestId("self-close").click();
		await expect(resultB).resolves.toMatchObject({ data: "b" });
	});

	it("ref.update changes the props of the open modal", async () => {
		const dialog = createDialog(SelfClosingDialog).returns<string>();

		const ref = await dialog.open({ label: "before" });
		ref.update({ label: "after" });

		await expect
			.element(page.getByTestId("self-closing-title"))
			.toHaveTextContent("after");
		await ref.close({ role: "cancel" });
		await expect(ref.result).resolves.toEqual({
			data: undefined,
			role: "cancel",
		});
	});
});

function SlowExitDialog() {
	return (
		<DialogContent data-testid="slow-exit" className="duration-500">
			<DialogTitle>Slow exit</DialogTitle>
			<DialogDescription>Closes with a 500ms animation</DialogDescription>
		</DialogContent>
	);
}

describe("close timing (Base UI)", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		render(<ModalProvider />);
	});

	it("resolves when the close animation ends instead of after a fixed 300ms", async () => {
		// The shadcn DialogContent close animation is 100ms
		const dialog = createDialog(SelfClosingDialog).returns<string>();
		const ref = await dialog.open({ label: "timing" });
		await expect.element(page.getByTestId("self-closing")).toBeVisible();

		const start = performance.now();
		await ref.close();
		await ref.result;

		expect(performance.now() - start).toBeLessThan(290);
		expect(useModalStore.getState().modals).toHaveLength(0);
	});

	it("keeps a modal with a longer close animation mounted past 300ms", async () => {
		const dialog = createDialog(SlowExitDialog);
		const ref = await dialog.open();
		await expect.element(page.getByTestId("slow-exit")).toBeVisible();

		const start = performance.now();
		await ref.close();
		await new Promise((r) => setTimeout(r, 350));
		expect(useModalStore.getState().modals).toHaveLength(1);

		await ref.result;
		expect(performance.now() - start).toBeGreaterThanOrEqual(450);
	});
});

describe("provider lifecycle (Base UI)", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [], exitDuration: 300 });
	});

	it("still resolves close() after the provider unmounts while the modal is open", async () => {
		const { unmount } = await render(<ModalProvider />);
		const dialog = createDialog(SelfClosingDialog).returns<string>();
		const ref = await dialog.open({ label: "orphan" });
		await expect.element(page.getByTestId("self-closing")).toBeVisible();

		unmount();
		await ref.close({ data: "closed", role: "confirm" });

		await expect(ref.result).resolves.toEqual({
			data: "closed",
			role: "confirm",
		});
		expect(useModalStore.getState().modals).toHaveLength(0);
	});

	it("resolves a modal closed right after open()", async () => {
		render(<ModalProvider />);
		const dialog = createDialog(SlowExitDialog);
		const ref = await dialog.open();
		await ref.close();

		await expect(ref.result).resolves.toMatchObject({ role: "dismiss" });
	});
});
