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

開発者向けの詳細な情報は[CONTRIBUTING.md](./CONTRIBUTING.md)を参照してください。

## ライセンス

MIT
