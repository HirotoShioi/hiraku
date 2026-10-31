/**
 * Task checks for the Intent skills shipped in packages/radix-ui/skills.
 *
 * Each test asserts a behavior that a skill recommends or warns about.
 */

import {
	createAlertDialog,
	createDialog,
	ModalProvider,
	modalController,
	useModal,
	useModalStore,
} from "@hirotoshioi/hiraku-radix-ui";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

const CLOSE_DELAY = 300;

function HelloDialog({ name }: { name: string }) {
	return (
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content data-testid="hello">
				<Dialog.Title>Hello, {name}</Dialog.Title>
				<Dialog.Description>hiraku rendered this dialog.</Dialog.Description>
			</Dialog.Content>
		</Dialog.Portal>
	);
}

function NestedRootDialog() {
	return (
		<Dialog.Root open>
			<Dialog.Portal>
				<Dialog.Content data-testid="nested">
					<Dialog.Title>Nested</Dialog.Title>
					<Dialog.Description>Wrong pattern</Dialog.Description>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function ConfirmDelete({ itemName }: { itemName: string }) {
	return (
		<AlertDialog.Portal>
			<AlertDialog.Overlay />
			<AlertDialog.Content data-testid="confirm-delete">
				<AlertDialog.Title>Delete {itemName}?</AlertDialog.Title>
				<AlertDialog.Description>
					This cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	);
}

async function setup() {
	useModalStore.setState({ modals: [] });
	await render(<ModalProvider />);
}

describe("skill: getting-started", () => {
	it("renders content-only components inside the provider's Root", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		await helloDialog.open({ name: "Ada" });
		await expect.element(page.getByText("Hello, Ada")).toBeVisible();
	});

	it("shows a modal opened before the provider mounts once it mounts", async () => {
		useModalStore.setState({ modals: [] });
		const helloDialog = createDialog(HelloDialog);
		await helloDialog.open({ name: "Late" });
		expect(document.querySelector("[data-testid=hello]")).toBeNull();
		await render(<ModalProvider />);
		await expect.element(page.getByText("Hello, Late")).toBeVisible();
	});

	it("closes on Escape with the correct pattern", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		await helloDialog.open({ name: "Esc" });
		await expect.element(page.getByTestId("hello")).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await expect.poll(() => helloDialog.isOpen()).toBe(false);
	});

	it("does not close on Escape when the component nests its own Root (mistake)", async () => {
		await setup();
		const nested = createDialog(NestedRootDialog);
		await nested.open();
		await expect.element(page.getByTestId("nested")).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await new Promise((r) => setTimeout(r, CLOSE_DELAY + 100));
		expect(nested.isOpen()).toBe(true);
		await modalController.closeAll();
	});
});

describe("skill: open-and-await-result", () => {
	it("resolves onDidClose with the data and role passed to close", async () => {
		await setup();
		const confirmDelete = createAlertDialog(ConfirmDelete).returns<boolean>();
		await confirmDelete.open({ itemName: "Report" });
		await expect.element(page.getByTestId("confirm-delete")).toBeVisible();
		const resultPromise = confirmDelete.onDidClose();
		expect(await confirmDelete.close({ data: true, role: "confirm" })).toBe(
			true,
		);
		expect(confirmDelete.isOpen()).toBe(false);
		expect(await resultPromise).toEqual({ data: true, role: "confirm" });
	});

	it("defaults the role to dismiss and resolves dismiss on Escape", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog).returns<string>();
		await helloDialog.open({ name: "A" });
		const first = helloDialog.onDidClose();
		await helloDialog.close();
		expect(await first).toEqual({ data: undefined, role: "dismiss" });

		await helloDialog.open({ name: "B" });
		await expect.element(page.getByTestId("hello")).toBeVisible();
		const second = helloDialog.onDidClose();
		await userEvent.keyboard("{Escape}");
		expect(await second).toEqual({ data: undefined, role: "dismiss" });
	});

	it("resolves {} immediately when onDidClose is called before open (mistake)", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		const early = await helloDialog.onDidClose();
		expect(early).toEqual({});
	});

	it("open() resolves before the user answers", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		await helloDialog.open({ name: "Wait" });
		expect(helloDialog.isOpen()).toBe(true);
		await helloDialog.close();
	});

	it("does not reach the open modal from a second controller (mistake)", async () => {
		await setup();
		const first = createDialog(HelloDialog);
		const second = createDialog(HelloDialog);
		await first.open({ name: "Owned" });
		expect(await second.close()).toBe(false);
		expect(await second.onDidClose()).toEqual({});
		expect(first.isOpen()).toBe(true);
		await first.close();
	});

	it("ignores a second open() while open and keeps the first props", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		await helloDialog.open({ name: "First" });
		await helloDialog.open({ name: "Second" });
		expect(useModalStore.getState().modals).toHaveLength(1);
		await expect.element(page.getByText("Hello, First")).toBeVisible();
		await helloDialog.close();
	});

	it("returns false from close() when nothing is open", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog);
		expect(await helloDialog.close()).toBe(false);
	});
});

describe("skill: modal-state-in-components", () => {
	it("tracks isOpen, data, and role for opens made through the hook", async () => {
		await setup();
		const confirmDelete = createAlertDialog(ConfirmDelete).returns<boolean>();
		function DeleteButton() {
			const modal = useModal(confirmDelete);
			return (
				<>
					<button
						type="button"
						onClick={() => modal.open({ itemName: "Report" })}
					>
						Delete
					</button>
					<span data-testid="state">
						{String(modal.isOpen)}:{String(modal.role)}:{String(modal.data)}
					</span>
				</>
			);
		}
		await render(<DeleteButton />);
		await expect
			.element(page.getByTestId("state"))
			.toHaveTextContent("false:null:null");
		await page.getByRole("button", { name: "Delete" }).click();
		await expect
			.element(page.getByTestId("state"))
			.toHaveTextContent("true:null:null");
		await confirmDelete.close({ data: true, role: "confirm" });
		await expect
			.element(page.getByTestId("state"))
			.toHaveTextContent("false:confirm:true");
	});

	it("does not reflect opens made outside the hook (mistake)", async () => {
		const helloDialog = createDialog(HelloDialog);
		function Status() {
			const modal = useModal(helloDialog);
			return <span data-testid="status">{String(modal.isOpen)}</span>;
		}
		useModalStore.setState({ modals: [] });
		await render(
			<>
				<Status />
				<ModalProvider />
			</>,
		);
		await helloDialog.open({ name: "Elsewhere" });
		await expect.element(page.getByText("Hello, Elsewhere")).toBeVisible();
		await expect.element(page.getByTestId("status")).toHaveTextContent("false");
		await helloDialog.close();
	});

	it("closes a modal opened through the hook when its component unmounts", async () => {
		useModalStore.setState({ modals: [] });
		const helloDialog = createDialog(HelloDialog);
		function Owner() {
			const modal = useModal(helloDialog);
			return (
				<button type="button" onClick={() => modal.open({ name: "Owned" })}>
					Open
				</button>
			);
		}
		function Page() {
			const [show, setShow] = useState(true);
			return (
				<>
					{show && <Owner />}
					<button type="button" onClick={() => setShow(false)}>
						Leave
					</button>
				</>
			);
		}
		await render(<Page />);
		await page.getByRole("button", { name: "Open" }).click();
		expect(helloDialog.isOpen()).toBe(true);
		const result = helloDialog.onDidClose();
		await page.getByRole("button", { name: "Leave" }).click();
		expect(await result).toEqual({ data: undefined, role: "dismiss" });
	});

	it("keeps a modal opened elsewhere open when a hook user unmounts", async () => {
		useModalStore.setState({ modals: [] });
		const helloDialog = createDialog(HelloDialog);
		function Watcher() {
			useModal(helloDialog);
			return null;
		}
		function Page() {
			const [show, setShow] = useState(true);
			return (
				<>
					{show && <Watcher />}
					<button type="button" onClick={() => setShow(false)}>
						Leave
					</button>
				</>
			);
		}
		await render(<Page />);
		await helloDialog.open({ name: "Elsewhere" });
		await page.getByRole("button", { name: "Leave" }).click();
		await new Promise((r) => setTimeout(r, CLOSE_DELAY + 100));
		expect(helloDialog.isOpen()).toBe(true);
		await helloDialog.close();
	});

	it("getTop().close takes positional arguments", async () => {
		await setup();
		const helloDialog = createDialog(HelloDialog).returns<unknown>();
		await helloDialog.open({ name: "Top" });
		const wrong = helloDialog.onDidClose();
		await modalController.getTop()?.close({ data: 1, role: "confirm" });
		expect(await wrong).toEqual({
			data: { data: 1, role: "confirm" },
			role: "dismiss",
		});

		await helloDialog.open({ name: "Top" });
		const right = helloDialog.onDidClose();
		await modalController.getTop()?.close(1, "confirm");
		expect(await right).toEqual({ data: 1, role: "confirm" });
	});

	it("closeAll() resolves while modals are still closing", async () => {
		await setup();
		const a = createDialog(HelloDialog);
		const b = createAlertDialog(ConfirmDelete);
		await a.open({ name: "A" });
		await b.open({ itemName: "B" });
		expect(modalController.getCount()).toBe(2);
		await modalController.closeAll();
		expect(modalController.isOpen()).toBe(false);
		expect(modalController.getCount()).toBe(0);
		expect(modalController.getTop()).toBeDefined();
		await expect.poll(() => useModalStore.getState().modals.length).toBe(0);
	});
});
