import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ModalProvider } from "./provider";
import { useModalStore } from "./store";
import type { ModalInstance } from "./store/types";

// テスト用のモックモーダルコンポーネント
function TestModalContent({ title }: { title: string }) {
	return <div data-testid="modal-content">{title}</div>;
}

function AnotherModalContent({ message }: { message: string }) {
	return <div data-testid="another-modal-content">{message}</div>;
}

// テスト用のモックモーダルインスタンスを作成
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

	describe("初期レンダリング", () => {
		it("モーダルがない場合、何もレンダリングされない", () => {
			const { container } = render(<ModalProvider />);

			expect(container.innerHTML).toBe("");
		});
	});

	describe("モーダルのレンダリング", () => {
		it("モーダルがstoreにある場合、レンダリングされる", () => {
			const modal = createMockModalInstance({
				props: { title: "Hello World" },
			});
			useModalStore.setState({ modals: [modal] });

			render(<ModalProvider />);

			expect(screen.getByTestId("modal-content")).toHaveTextContent(
				"Hello World",
			);
		});

		it("複数のモーダルが同時にレンダリングされる", () => {
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
