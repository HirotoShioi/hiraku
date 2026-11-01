/**
 * Browser tests for openAsync, ModalRef, useModalContext, and close timing.
 */

import {
	createDialog,
	ModalProvider,
	useModalContext,
	useModalStore,
} from "@hirotoshioi/hiraku-radix-ui";
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

describe("close timing (Radix UI)", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [], exitDuration: 300 });
	});

	it("waits for ModalProvider's exitDuration", async () => {
		render(<ModalProvider exitDuration={50} />);
		const dialog = createDialog(SelfClosingDialog).returns<string>();
		const ref = await dialog.open({ label: "provider" });
		await expect.element(page.getByTestId("self-closing")).toBeVisible();

		const start = performance.now();
		await ref.close();
		await ref.result;

		expect(performance.now() - start).toBeLessThan(290);
	});

	it("the controller's exitDuration overrides the provider's", async () => {
		render(<ModalProvider />);
		const dialog = createDialog(SelfClosingDialog, {
			exitDuration: 50,
		}).returns<string>();
		const ref = await dialog.open({ label: "controller" });
		await expect.element(page.getByTestId("self-closing")).toBeVisible();

		const start = performance.now();
		await ref.close();
		await ref.result;

		expect(performance.now() - start).toBeLessThan(290);
	});
});
