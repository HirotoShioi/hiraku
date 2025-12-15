# monorepo移行タスクリスト

## フェーズ1: 初期セットアップ

### 1.1 monorepo基盤の構築
- [ ] ルートディレクトリに `packages/` ディレクトリを作成
- [ ] ルートディレクトリに `examples/` ディレクトリを作成
- [ ] ルート `package.json` に npm workspaces の設定を追加
- [ ] turborepo の設定ファイル (`turbo.json`) を作成
- [ ] ルート直下の既存ファイル（README.md、LICENSE等）の配置を確認

### 1.2 共通設定の準備
- [ ] biome の設定をルートに配置し、monorepo全体で共有できるように設定
- [ ] TypeScript の設定を共通化（`tsconfig.base.json` 等）
- [ ] 共通の `.gitignore` を更新

## フェーズ2: coreパッケージの作成

### 2.1 パッケージ構造の作成
- [ ] `packages/hiraku-core/` ディレクトリを作成
- [ ] `packages/hiraku-core/package.json` を作成（パッケージ名: `@hirotoshioi/hiraku-core`）
- [ ] `packages/hiraku-core/tsconfig.json` を作成
- [ ] `packages/hiraku-core/tsdown.config.ts` を作成

### 2.2 コアロジックの移行
- [ ] 既存の `src/factory/` をcoreパッケージに移動
- [ ] 既存の `src/store/` をcoreパッケージに移動
- [ ] 既存の `src/hooks/` をcoreパッケージに移動
- [ ] 既存の `src/shared/` をcoreパッケージに移動
- [ ] 既存の `src/modal-controller.ts` をcoreパッケージに移動
- [ ] 既存の `src/utils.ts` をcoreパッケージに移動
- [ ] coreパッケージの export を整理（`index.ts` 作成）

### 2.3 依存関係の設定
- [ ] `zustand` を dependencies に追加
- [ ] `react` と `react-dom` を peerDependencies に追加
- [ ] ビルドとテストが通ることを確認

## フェーズ3: radix-uiパッケージの作成

### 3.1 パッケージ構造の作成
- [ ] `packages/hiraku/` ディレクトリを作成
- [ ] `packages/hiraku/package.json` を作成（パッケージ名: `@hirotoshioi/hiraku`）
- [ ] `packages/hiraku/tsconfig.json` を作成
- [ ] `packages/hiraku/tsdown.config.ts` を作成

### 3.2 Radix UI固有の実装
- [ ] 既存の `src/provider.tsx` を移行（Radix UI用）
- [ ] coreパッケージへの依存関係を追加（`@hirotoshioi/hiraku-core`）
- [ ] Radix UI関連のpeerDependenciesを設定（`@radix-ui/react-dialog`、`@radix-ui/react-alert-dialog`）
- [ ] coreパッケージの再エクスポートを設定
- [ ] ビルドとテストが通ることを確認

### 3.3 既存資産の移行
- [ ] 既存の README.md を更新・移行
- [ ] 既存のテストファイルを移行
- [ ] 既存の playground を examples に移行するか検討

## フェーズ4: base-uiパッケージの作成

### 4.1 パッケージ構造の作成
- [ ] `packages/hiraku-base-ui/` ディレクトリを作成
- [ ] `packages/hiraku-base-ui/package.json` を作成（パッケージ名: `@hirotoshioi/hiraku-base-ui`）
- [ ] `packages/hiraku-base-ui/tsconfig.json` を作成
- [ ] `packages/hiraku-base-ui/tsdown.config.ts` を作成

### 4.2 Base UI固有の実装
- [ ] Base UI用のProviderコンポーネントを実装
- [ ] coreパッケージへの依存関係を追加（`@hirotoshioi/hiraku-core`）
- [ ] Base UI関連のpeerDependenciesを設定
- [ ] coreパッケージの再エクスポートを設定
- [ ] ビルドとテストが通ることを確認

## フェーズ5: examplesの作成

### 5.1 Radix UIの使用例
- [ ] `examples/radix-ui/` ディレクトリを作成
- [ ] Viteプロジェクトのセットアップ
- [ ] `@hirotoshioi/hiraku` を使用したサンプルコードを作成
- [ ] 動作確認

### 5.2 Base UIの使用例
- [ ] `examples/base-ui/` ディレクトリを作成
- [ ] Viteプロジェクトのセットアップ
- [ ] `@hirotoshioi/hiraku-base-ui` を使用したサンプルコードを作成
- [ ] 動作確認

## フェーズ6: ビルドとテストの統合

### 6.1 turborepoの設定
- [ ] `turbo.json` でビルドパイプラインを定義
- [ ] パッケージ間の依存関係を正しく設定
- [ ] キャッシュ戦略を設定

### 6.2 npm scriptsの整備
- [ ] ルート `package.json` に `build` スクリプトを追加
- [ ] ルート `package.json` に `test` スクリプトを追加
- [ ] ルート `package.json` に `lint` スクリプトを追加
- [ ] ルート `package.json` に `typecheck` スクリプトを追加
- [ ] 各パッケージで独立してビルド・テストが可能なことを確認

### 6.3 テスト環境の整備
- [ ] monorepo全体でテストが実行できることを確認
- [ ] 各パッケージ間の依存関係が正しくテストされることを確認
- [ ] CI設定を更新（GitHub Actions等）

## フェーズ7: ドキュメントと公開準備

### 7.1 ドキュメントの更新
- [ ] ルートREADME.mdをmonorepo用に更新
- [ ] 各パッケージのREADME.mdを作成
- [ ] 移行ガイドを作成（既存ユーザー向け）
- [ ] CLAUDE.mdを更新（monorepo構成を反映）

### 7.2 バージョン管理の準備
- [ ] 各パッケージの初期バージョンを決定
- [ ] package.jsonのバージョンフィールドを設定
- [ ] リリースプロセスを文書化

### 7.3 公開前の確認
- [ ] 全パッケージのビルドが成功することを確認
- [ ] 全テストがパスすることを確認
- [ ] package.jsonの `exports` フィールドを確認（`npm run check-exports` 相当）
- [ ] examplesが正しく動作することを確認

## フェーズ8: 公開とクリーンアップ

### 8.1 npmへの公開
- [ ] `@hirotoshioi/hiraku-core` を公開
- [ ] `@hirotoshioi/hiraku` を公開（更新版）
- [ ] `@hirotoshioi/hiraku-base-ui` を公開

### 8.2 クリーンアップ
- [ ] 旧構成のファイルを削除
- [ ] 不要な依存関係を削除
- [ ] gitの履歴を整理（必要に応じて）

### 8.3 告知
- [ ] リリースノートを作成
- [ ] GitHubリリースを作成
- [ ] 既存ユーザーへの移行案内

---

## 注意事項

- 各フェーズは順番に進めることを推奨
- フェーズ2の完了後は、coreパッケージ単体でテストできる状態にする
- フェーズごとにコミットし、問題が発生した場合は前のフェーズに戻れるようにする
- ビルドとテストは各フェーズで頻繁に実行し、早期に問題を発見する
