# Bunshin CLI

CI/CDツールのビルドアクション定義を他のツール形式に変換するCLIツール

## 機能

- GitHub Actions → GitLab CI
- GitLab CI → GitHub Actions
- Jenkins → GitHub Actions
- その他の変換（開発予定）

## インストール

```bash
npm install -g bunshin-cli
```

## 使用方法

```bash
bunshin convert <source-file> <target-format>
```

例：

```bash
bunshin convert .github/workflows/ci.yml gitlab-ci
```

## 開発者向け

### セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build
```

### 開発コマンド

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
npm run bunshin
```

### テスト

```bash
# テストの実行
npm test

# カバレッジレポートの生成
npm test -- --coverage
```

## ライセンス

MIT
