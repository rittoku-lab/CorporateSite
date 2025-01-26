# Corporate Site

VitePressで構築されたモダンなコーポレートサイトです。

## 🚀 機能

- 📱 レスポンシブデザイン
- 📝 ブログ機能
- 🔍 SEO対策済み
- 🎨 カスタマイズ可能なデザイン
- ⚡ 高速なパフォーマンス

## 🛠️ 技術スタック

- [VitePress](https://vitepress.dev/) - 静的サイトジェネレーター
- [Vue.js](https://vuejs.org/) - UIフレームワーク
- [GitHub Pages](https://pages.github.com/) - ホスティング

## 📦 プロジェクト構成

```
/
├── docs/
│   ├── .vitepress/
│   │   └── config.ts     # VitePressの設定
│   ├── public/           # 静的アセット
│   ├── about.md         # アバウトページ
│   ├── services.md      # サービスページ
│   ├── news/            # ブログ記事
│   │   ├── index.md
│   │   └── posts/       # 個別の記事
│   └── index.md         # トップページ
└── package.json
```

## 🚀 始め方

### 必要条件

- Node.js 18.0以上
- Yarn

### インストール

```bash
# 依存関係のインストール
yarn install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動（http://localhost:5173）
yarn docs:dev
```

### ビルド

```bash
# 本番用にビルド
yarn docs:build
```

### プレビュー

```bash
# ビルドしたサイトをプレビュー
yarn docs:preview
```

## 🌐 デプロイ

このプロジェクトはGitHub Pagesを使用して自動デプロイされます。
`main`ブランチにプッシュすると、GitHub Actionsを通じて自動的にデプロイが実行されます。

### デプロイに必要な設定

- リポジトリの Settings > Pages で GitHub Pages を有効化
- GitHub Actions のワークフローファイルを設定
- 必要に応じてカスタムドメインを設定

## 📝 コンテンツの更新方法

1. ブログ記事の追加
   - `docs/blog/posts/`に新しいMarkdownファイルを作成
   - フロントマターにメタ情報を追加
   - `docs/.vitepress/config.ts`のサイドバーに記事を追加

2. ページの更新
   - 各`.md`ファイルを直接編集
   - コンテンツの変更はGitHub上で直接行うことも可能

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
