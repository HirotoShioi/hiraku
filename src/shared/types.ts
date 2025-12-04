/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";

/**
 * Role describing why a modal was closed.
 */
export type ModalRole = "confirm" | "cancel" | "dismiss" | (string & {});

/**
 * Result returned when a modal is closed.
 */
export interface ModalResult<T = unknown> {
	data?: T;
	role?: ModalRole;
}

/**
 * Utility to prettify object types for IDE display.
 */
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * Extract props type from React.ComponentType / React.Component.
 * @example
 * type Props = GetComponentProps<typeof MyComponent>; // { title: string }
 */
export type GetComponentProps<T> = T extends
	| ComponentType<infer P>
	| React.Component<infer P>
	? Prettify<P>
	: never;

type IsObject<T> =
	Prettify<T> extends Record<string | number | symbol, unknown> ? T : never;

type HasKeys<T> = keyof T extends never ? never : T;

/**
 * Determine whether props can be omitted.
 * - Empty object (Record<string, never>): true
 * - All properties optional: true
 * - Has required properties: false
 */
type IsPropsOptional<T> = keyof T extends never
	? true
	: Partial<T> extends T
		? true
		: false;

/**
 * pushmodal style: omit args when props are empty/optional, require when props are mandatory.
 * Rest-parameter variant.
 */
export type OptionalPropsArgs<TProps> =
	HasKeys<IsObject<Prettify<TProps>>> extends never
		? [] // No props / empty object -> no args needed
		: IsPropsOptional<TProps> extends true
			? [props?: TProps] // All optional -> argument optional
			: [props: TProps]; // Has required props -> argument required

/**
 * Modal wrapper component type (Dialog.Root, Sheet.Root, AlertDialog.Root, etc.).
 */
export type ModalWrapperComponent = ComponentType<{
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}>;

/**
 * Modal wrapper type: 'dialog' | 'sheet' | 'alert-dialog' or a custom component.
 */
export type ModalWrapperType =
	| "dialog"
	| "sheet"
	| "alert-dialog"
	| ModalWrapperComponent;
