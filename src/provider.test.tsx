import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ModalProvider } from "./provider";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";

// Mock modal components for tests
function TestModalContent({ title }: { title: string }) {
	return <div data-testid="modal-content">{title}</div>;
}

function AnotherModalContent({ message }: { message: string }) {
	return <div data-testid="another-modal-content">{message}</div>;
}

// Create a mock modal instance for tests
function createMockModalInstance(
	overrides: Partial<ModalInstance> = {},
): ModalInstance {
	const resolveDid = vi.fn();
	return {
		id: crypto.randomUUID(),
		component: TestModalContent,
		props: { title: "Test Modal" },
		wrapper: "dialog",
		open: true,
		closing: false,
		didPromise: new Promise((resolve) => {
			resolveDid.mockImplementation(resolve);
		}),
		resolveDid,
		...overrides,
	};
}

describe("ModalProvider", () => {
	beforeEach(() => {
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("initial render", () => {
		it("renders nothing when there are no modals", () => {
			const { container } = render(<ModalProvider />);

			expect(container.innerHTML).toBe("");
		});
	});

	describe("modal rendering", () => {
		it("renders a modal when one exists in the store", () => {
			const modal = createMockModalInstance({
				props: { title: "Hello World" },
			});
			useModalStore.setState({ modals: [modal] });

			render(<ModalProvider />);

			expect(screen.getByTestId("modal-content")).toHaveTextContent(
				"Hello World",
			);
		});

		it("renders multiple modals simultaneously", () => {
			const modal1 = createMockModalInstance({
				component: TestModalContent,
				props: { title: "First Modal" },
			});
			const modal2 = createMockModalInstance({
				component: AnotherModalContent,
				props: { message: "Second Modal" },
			});
			useModalStore.setState({ modals: [modal1, modal2] });

			render(<ModalProvider />);

			expect(screen.getByTestId("modal-content")).toHaveTextContent(
				"First Modal",
			);
			expect(screen.getByTestId("another-modal-content")).toHaveTextContent(
				"Second Modal",
			);
		});
	});
});
