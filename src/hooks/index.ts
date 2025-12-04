import { useCallback, useEffect, useRef, useState } from "react";
import type { Modal } from "../factory/types";
import type {
	GetComponentProps,
	ModalResult,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";
import type { UseModalReturn } from "./types";

/**
 * モーダルコントローラーのためのフック
 * @template TComponent - Reactコンポーネントの型
 * @template TResult - closeした際に返されるデータの型
 * @example
 * const sampleSheetModal = createSheet(SampleSheet).returns<SampleSheetResult>();
 *
 * // フックで使用
 * const sheet = useModal(sampleSheetModal);
 *
 * return (
 *   <>
 *     <Button onClick={() => sheet.open({ title: "Hello", description: "World" })}>開く</Button>
 *     <p>結果: {sheet.role} {sheet.data?.accepted}</p>
 *   </>
 * );
 */
export function useModal<TComponent, TResult = unknown>(
	controller: Modal<TComponent, TResult>,
): UseModalReturn<TComponent, TResult> {
	type TProps = GetComponentProps<TComponent>;

	const [result, setResult] = useState<ModalResult<TResult> | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const controllerRef = useRef(controller);

	// コントローラーをRefで保持
	useEffect(() => {
		controllerRef.current = controller;
	});

	const open = useCallback((...args: OptionalPropsArgs<TProps>) => {
		// 既に開いている場合は何もしない
		if (controllerRef.current.isOpen()) {
			return;
		}

		setResult(null);
		setIsOpen(true);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(controllerRef.current.open as (...args: any[]) => Promise<void>)(...args);

		// 閉じた時の結果を非同期で取得（openの戻り値は待たない）
		void controllerRef.current.onDidClose().then((closeResult) => {
			setResult(closeResult);
			setIsOpen(false);
		});
	}, []);

	const close = useCallback(
		async (options?: { data?: TResult; role?: ModalRole }) => {
			return controllerRef.current.close(options);
		},
		[],
	);

	// コンポーネントのアンマウント時にモーダルを閉じる
	useEffect(() => {
		return () => {
			if (controllerRef.current.isOpen()) {
				void controllerRef.current.close();
			}
		};
	}, []);

	return {
		isOpen,
		open: open as UseModalReturn<TComponent, TResult>["open"],
		close,
		data: result?.data ?? null,
		role: result?.role ?? null,
	};
}
