import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModalStore } from "./index";
import type { ModalInstance } from "./types";

// テスト用のモックモーダルインスタンスを作成
function createMockModalInstance(
	overrides: Partial<ModalInstance> = {},
): ModalInstance {
	const resolveDid = vi.fn();
	return {
		id: crypto.randomUUID(),
		component: () => null,
		props: {},
		wrapper: "dialog",
		open: false,
		closing: false,
		didPromise: new Promise((resolve) => {
			resolveDid.mockImplementation(resolve);
		}),
		resolveDid,
		...overrides,
	};
}

describe("useModalStore", () => {
	beforeEach(() => {
		// 各テスト前にstoreをリセット
		useModalStore.setState({ modals: [] });
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("add", () => {
		it("モーダルをstoreに追加できる", () => {
			const modal = createMockModalInstance();
			useModalStore.getState().add(modal);

			expect(useModalStore.getState().modals).toHaveLength(1);
			expect(useModalStore.getState().modals[0]).toEqual(modal);
		});
	});

	describe("present", () => {
		it("指定したIDのモーダルをopen: trueにする", () => {
			const modal = createMockModalInstance({ open: false });
			useModalStore.getState().add(modal);

			useModalStore.getState().present(modal.id);

			const updatedModal = useModalStore.getState().modals[0];
			expect(updatedModal?.open).toBe(true);
		});
	});

	describe("updateProps", () => {
		it("指定したIDのモーダルのpropsを更新できる", () => {
			const modal = createMockModalInstance({ props: { title: "old" } });
			useModalStore.getState().add(modal);

			useModalStore.getState().updateProps(modal.id, { title: "new" });

			const updatedModal = useModalStore.getState().modals[0];
			expect(updatedModal?.props).toEqual({ title: "new" });
		});
	});

	describe("close", () => {
		it("指定したIDのモーダルをclose状態にし、300ms後に削除される", async () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal);

			const result = await useModalStore.getState().close(modal.id);

			expect(result).toBe(true);
			const updatedModal = useModalStore.getState().modals[0];
			expect(updatedModal?.open).toBe(false);
			expect(updatedModal?.closing).toBe(true);

			// 300ms経過で削除
			vi.advanceTimersByTime(300);
			expect(useModalStore.getState().modals).toHaveLength(0);
		});

		it("close時にdata/roleでresolveDidが呼ばれる", async () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal);

			await useModalStore
				.getState()
				.close(modal.id, { success: true }, "confirm");

			vi.advanceTimersByTime(300);

			expect(modal.resolveDid).toHaveBeenCalledWith({
				data: { success: true },
				role: "confirm",
			});
		});

		it("既にclosingのモーダルはcloseしない", async () => {
			const modal = createMockModalInstance({ open: true, closing: true });
			useModalStore.getState().add(modal);

			const result = await useModalStore.getState().close(modal.id);

			expect(result).toBe(false);
		});

		it("IDを省略すると最後のモーダルをcloseする", async () => {
			const modal1 = createMockModalInstance({ open: true });
			const modal2 = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal1);
			useModalStore.getState().add(modal2);

			await useModalStore.getState().close();

			const modals = useModalStore.getState().modals;
			expect(modals[0]?.closing).toBe(false);
			expect(modals[1]?.closing).toBe(true);
		});
	});

	describe("closeAll", () => {
		it("全てのモーダルをcloseする", async () => {
			const modal1 = createMockModalInstance({ open: true });
			const modal2 = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal1);
			useModalStore.getState().add(modal2);

			await useModalStore.getState().closeAll();

			const modals = useModalStore.getState().modals;
			expect(modals.every((m) => m.closing)).toBe(true);

			vi.advanceTimersByTime(300);

			expect(useModalStore.getState().modals).toHaveLength(0);
		});
	});

	describe("getTop", () => {
		it("最後に追加されたモーダルを返す", () => {
			const modal1 = createMockModalInstance();
			const modal2 = createMockModalInstance();
			useModalStore.getState().add(modal1);
			useModalStore.getState().add(modal2);

			const top = useModalStore.getState().getTop();

			expect(top?.id).toBe(modal2.id);
		});

		it("モーダルがない場合はundefinedを返す", () => {
			const top = useModalStore.getState().getTop();
			expect(top).toBeUndefined();
		});
	});

	describe("エッジケース", () => {
		it("連続したclose呼び出しでも安全に処理される", async () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal);

			// 同時に複数回closeを呼ぶ
			const results = await Promise.all([
				useModalStore.getState().close(modal.id),
				useModalStore.getState().close(modal.id),
				useModalStore.getState().close(modal.id),
			]);

			// 最初の1回だけ成功、残りは失敗
			expect(results.filter(Boolean)).toHaveLength(1);

			vi.advanceTimersByTime(300);
			expect(useModalStore.getState().modals).toHaveLength(0);
		});

		it("closeAllとclose同時呼び出しでも安全", async () => {
			const modal1 = createMockModalInstance({ open: true });
			const modal2 = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal1);
			useModalStore.getState().add(modal2);

			// closeAllと個別closeを同時に呼ぶ
			await Promise.all([
				useModalStore.getState().closeAll(),
				useModalStore.getState().close(modal1.id),
			]);

			vi.advanceTimersByTime(300);
			expect(useModalStore.getState().modals).toHaveLength(0);
		});

		it("存在しないIDでcloseしても安全", async () => {
			const result = await useModalStore.getState().close("non-existent-id");
			expect(result).toBe(false);
		});

		it("空の配列でcloseAllしても安全", async () => {
			await useModalStore.getState().closeAll();
			expect(useModalStore.getState().modals).toHaveLength(0);
		});

		it("大量のモーダルを追加・削除しても正常に動作", async () => {
			const modals = Array.from({ length: 10 }, () =>
				createMockModalInstance({ open: true }),
			);

			for (const m of modals) {
				useModalStore.getState().add(m);
			}
			expect(useModalStore.getState().modals).toHaveLength(10);

			await useModalStore.getState().closeAll();
			vi.advanceTimersByTime(300);

			expect(useModalStore.getState().modals).toHaveLength(0);
		});

		it("closeのタイマー（300ms）前後で状態が正しい", async () => {
			const modal = createMockModalInstance({ open: true });
			useModalStore.getState().add(modal);

			await useModalStore.getState().close(modal.id);

			// 100ms時点: まだ存在（closing状態）
			vi.advanceTimersByTime(100);
			expect(useModalStore.getState().modals).toHaveLength(1);
			expect(useModalStore.getState().modals[0]?.closing).toBe(true);

			// 200ms時点: まだ存在
			vi.advanceTimersByTime(100);
			expect(useModalStore.getState().modals).toHaveLength(1);

			// 300ms時点: 削除される
			vi.advanceTimersByTime(100);
			expect(useModalStore.getState().modals).toHaveLength(0);
		});
	});
});
