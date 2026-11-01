import { create } from "zustand";
import type { ModalResult } from "../shared/types";
import type { ModalInstance, ModalState } from "./types";

const updateModal = (
	modals: ModalInstance[],
	id: string,
	updates: Partial<ModalInstance>,
) => modals.map((m) => (m.id === id ? { ...m, ...updates } : m));

export const DEFAULT_EXIT_DURATION = 300;

// Pending close timers by modal ID, so a provider can take over or cancel them
const exitTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearExitTimer = (id: string) => {
	clearTimeout(exitTimers.get(id));
	exitTimers.delete(id);
};

export const useModalStore = create<ModalState>((set, get) => ({
	modals: [],
	exitDuration: DEFAULT_EXIT_DURATION,

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

		const result: ModalResult = { data, role };
		set((s) => ({
			modals: updateModal(s.modals, target.id, {
				open: false,
				closing: true,
				result,
			}),
		}));

		// Providers that can detect the end of the close animation call completeClose themselves
		if (!target.exitManaged) {
			exitTimers.set(
				target.id,
				setTimeout(
					() => get().completeClose(target.id),
					target.exitDuration ?? get().exitDuration,
				),
			);
		}

		return Promise.resolve(true);
	},

	closeAll: async () => {
		const modals = get().modals;
		await Promise.all(modals.map((m) => get().close(m.id)));
	},

	getTop: () => {
		return get().modals.at(-1);
	},

	setExitDuration: (ms) => set({ exitDuration: ms }),

	manageExit: (id, managed = true) => {
		// The provider now reports completion, so a timer started earlier must not cut the animation
		if (managed) clearExitTimer(id);
		set((s) => ({
			modals: updateModal(s.modals, id, { exitManaged: managed }),
		}));
	},

	completeClose: (id) => {
		const target = get().modals.find((m) => m.id === id);
		if (!target?.closing) return;

		clearExitTimer(id);
		target.resolveDid(target.result ?? { role: "dismiss" });
		set((s) => ({
			modals: s.modals.filter((m) => m.id !== id),
		}));
	},
}));
