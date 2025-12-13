import { create } from "zustand";
import type { ModalResult } from "../shared/types";
import type { ModalInstance, ModalState } from "./types";

const updateModal = (
	modals: ModalInstance[],
	id: string,
	updates: Partial<ModalInstance>,
) => modals.map((m) => (m.id === id ? { ...m, ...updates } : m));

const MODAL_ANIMATION_DURATION = 300;

export const useModalStore = create<ModalState>((set, get) => ({
	modals: [],

	add: (modal) => set((s) => ({ modals: [...s.modals, modal] })),

	present: (id) =>
		set((s) => ({
			modals: updateModal(s.modals, id, { open: true }),
		})),

	updateProps: (id, props) =>
		set((s) => ({
			modals: updateModal(s.modals, id, { props: props }),
		})),

	close: (id, data, role = "dismiss") => {
		const { modals } = get();
		const target = id ? modals.find((m) => m.id === id) : modals.at(-1);
		if (!target || target.closing) return Promise.resolve(false);

		const payload: ModalResult = { data, role };
		set((s) => ({
			modals: updateModal(s.modals, target.id, { open: false, closing: true }),
		}));

		setTimeout(() => {
			target.resolveDid(payload);
			set((s) => ({
				modals: s.modals.filter((m) => m.id !== target.id),
			}));
		}, MODAL_ANIMATION_DURATION);

		return Promise.resolve(true);
	},

	closeAll: async () => {
		const modals = get().modals;
		await Promise.all(modals.map((m) => get().close(m.id)));
	},

	getTop: () => {
		return get().modals.at(-1);
	},
}));
