# monorepo構成への移行

## 背景

shadcnがradix-uiだけではなく、base-uiライブラリのコンポーネントも提供するようになった。hirakuとしてもbase-uiに対応していきたいたいめ、monorepo構成に移行することにした。

## monorepo構成の概要

packagesディレクトリを作成し、その中に以下の3つのパッケージを配置する。
- `@hirotoshioi/hiraku-base-ui` : base-uiライブラリのコンポーネントを配置
- `@hirotoshioi/hiraku-core` : 共通のユーティリティ関数や型定義を配置 
- `@hirotoshioi/hiraku` : shadcnのradix-uiコンポーネントを配置

また、examplesディレクトリを作成し、各パッケージの使用例を配置する。
- `base-ui` : hiraku-base-uiの使用例
- `radix-ui` : shadcnのradix-uiコンポーネントの使用例


### パッケージごとの概要

- `@hirotoshioi/hiraku-base-ui`
  - base-uiライブラリをpeerDependencyとして持つ
  - coreパッケージに依存
- `@hirotoshioi/hiraku-core`
  - 共通のユーティリティ関数や型定義を提供
  - 他の2つのパッケージから依存される
  - zustandのみに依存
- `@hirotoshioi/hiraku`
  - shadcnのradix-uiコンポーネントを提供
  - coreパッケージに依存
  - peerDependencyとしてradix-uiを持つ

## 実装方針

- npm workspacesを使用してmonorepoを構成する。
- 各パッケージは独立してビルド・テストが可能
- turborepoを使う
- それぞれのパッケージに対してtsdownでパッケージ化する
- biomeの設定をmonorepo全体で共有する。
- ほとんとのロジックをcoreパッケージに移動する
- shadcn、base-uiはcoreに依存する形にする。providerのみをそれぞれ実装する。coreを再エクスポートする形にする。
- バージョンは一括して管理する

## 参考資料

- [biome](https://biomejs.dev/guides/big-projects/#monorepo)
- [base-ui](https://base-ui.com/react/overview/quick-start)
- [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces)