# 開発者向けガイド

## セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build
```

## 開発コマンド

```bash
# ビルド
npm run build

# リント
npm run lint
npm run lint:fix

# フォーマット
npm run format
npm run format:check

# テスト
npm test

# ローカルでの実行
npm run kawarimi

# プリコミットフックのテスト
npx husky run pre-commit
```

## Git Hooks

このプロジェクトでは、コードの品質を保つためにhuskyを使用してGit Hooksを設定しています。

- `pre-commit`: コミット前に以下のチェックを実行
  - ESLintによるコード品質チェック
  - Prettierによるコードフォーマット
  - 変更されたファイルの自動フォーマット

## テスト

```bash
# テストの実行
npm test

# カバレッジレポートの生成
npm test -- --coverage
```

## 開発フロー

1. 新しい機能の開発は新しいブランチで行ってください
2. コミット前に必ずテストを実行してください
3. プルリクエストを作成する前に、以下のコマンドを実行してください：
   ```bash
   npm run format
   npm run lint:fix
   npm test
   ```

## コーディング規約

- TypeScriptの型定義を必ず行ってください
- テストカバレッジは80%以上を維持してください
- コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/)に従ってください 