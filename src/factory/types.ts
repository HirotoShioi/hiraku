import type {
	GetComponentProps,
	ModalResult,
	ModalRole,
	OptionalPropsArgs,
} from "../shared/types";

/**
 * モーダルハンドル（操作用）
 * @template TResult - dismissした際に返されるデータの型
 */
export interface ModalHandle<TResult = unknown> {
	/** モーダルの一意なID */
	id: string;
	/**
	 * モーダルを表示する
	 * @returns モーダルが表示されたら解決するPromise
	 * @example
	 * await controller.open({ title: "Hello" });
	 */
	open: () => Promise<void>;
	/**
	 * モーダルを閉じる
	 * @param data - 閉じる際に返すデータ
	 * @param role - 閉じた理由（"confirm", "cancel"など）
	 * @returns closeが成功したかどうか
	 * @example
	 * await handle.close({ success: true }, "confirm");
	 */
	close: (data?: TResult, role?: ModalRole) => Promise<boolean>;
	/**
	 * モーダルのpropsを更新する
	 * @param props - 新しいprops（部分更新）
	 * @example
	 * handle.updateProps({ title: "Updated Title" });
	 */
	updateProps: (props: unknown) => void;
	/**
	 * モーダルが完全に閉じた時に解決するPromise
	 * アニメーション完了後に呼ばれる
	 * @returns close時のデータとroleを含むModalResult
	 * @example
	 * const { data, role } = await modal.onDidClose();
	 * console.log("Modal closed with:", data);
	 */
	onDidClose: () => Promise<ModalResult<TResult>>;
}

/**
 * 型付きモーダルコントローラー
 * コンポーネントを事前にバインドし、open/close/onDidCloseを型安全に使える
 * コンポーネントの型からPropsを自動推論する
 * @template TComponent - Reactコンポーネントの型
 * @template TResult - closeした際に返されるデータの型
 * @example
 * const mySheet = createSheet(MySheet);
 * await mySheet.open({ title: "Hello" });
 * const { data, role } = await mySheet.onDidClose();
 */
export interface Modal<TComponent, TResult = unknown> {
	/**
	 * モーダルを表示する
	 * Propsが空/全てオプショナルの場合は引数省略可能
	 */
	open: (
		...args: OptionalPropsArgs<GetComponentProps<TComponent>>
	) => Promise<void>;
	/**
	 * モーダルを閉じる
	 */
	close: (options?: { data?: TResult; role?: ModalRole }) => Promise<boolean>;
	/**
	 * モーダルが完全に閉じた時に解決するPromise
	 */
	onDidClose: () => Promise<ModalResult<TResult>>;
	/**
	 * モーダルが現在開いているかどうかを確認する
	 */
	isOpen: () => boolean;
	/**
	 * closeした際の戻り値の型を指定する
	 * @example
	 * const mySheet = createSheet(MySheet).returns<{ accepted: boolean }>();
	 */
	returns<R>(): Modal<TComponent, R>;
}
