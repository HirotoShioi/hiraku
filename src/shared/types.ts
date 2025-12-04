/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";

/**
 * モーダルを閉じる際のrole
 */
export type ModalRole = "confirm" | "cancel" | "dismiss" | (string & {});

/**
 * モーダルを閉じた際の結果
 */
export interface ModalResult<T = unknown> {
	data?: T;
	role?: ModalRole;
}

/**
 * オブジェクト型を整形する（IDEでの表示を改善）
 */
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

/**
 * React.ComponentType / React.Component からPropsの型を抽出する
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
 * propsが省略可能かどうかを判定する型
 * - 空オブジェクト（Record<string, never>）の場合: true
 * - 全プロパティがオプショナルの場合: true
 * - 必須プロパティがある場合: false
 */
type IsPropsOptional<T> = keyof T extends never
	? true
	: Partial<T> extends T
		? true
		: false;

/**
 * pushmodalスタイル: Propsが空/オプショナルなら引数不要、必須プロパティがあれば必須
 * rest parameters版（可変長引数）
 */
export type OptionalPropsArgs<TProps> =
	HasKeys<IsObject<Prettify<TProps>>> extends never
		? [] // Propsがない/空の場合は引数不要
		: IsPropsOptional<TProps> extends true
			? [props?: TProps] // 全プロパティがオプショナルなら省略可能
			: [props: TProps]; // 必須プロパティがあれば必須

/**
 * モーダルのラッパーコンポーネントの型
 * Radix UIのDialog.Root, Sheet.Root, AlertDialog.Rootなどに対応
 */
export type ModalWrapperComponent = ComponentType<{
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}>;

/**
 * モーダルのラッパータイプ
 * 'dialog' | 'sheet' | 'alert-dialog' またはカスタムコンポーネント
 */
export type ModalWrapperType =
	| "dialog"
	| "sheet"
	| "alert-dialog"
	| ModalWrapperComponent;
