# サービスページ追加スキル

新しいサービスページをコーポレートサイトに追加します。

## 入力情報

以下の情報をユーザーから取得してください（不足があれば質問）:

- **サービス名**: 表示名（例: Calendar & Booking）
- **サービスURL**: 公開URL（例: https://booking.rittoku.llc/）
- **slug**: URLパス用の英字名（例: booking）
- **概要**: サービスの一行説明

## 手順

### 1. サービスサイトの調査

- Playwrightでサービスサイト（$ARGUMENTS に含まれる場合はそのURL）にアクセスし、実際の画面を確認する
- 認証が必要な場合はユーザーに操作を依頼して待つ
- 主要画面（ログイン、ダッシュボード、設定、公開ページ等）のスクリーンショットを取得する
- ユーザー目線で共感を得られる情報（課題解決、使い方の簡単さ等）を把握する

### 2. サービス詳細ページの作成

`docs/services/<slug>.md` を以下の構成で作成:

```markdown
---
title: <サービス名> | 合同会社リットク
description: <サービスの説明文>
head:
  - - meta
    - name: keywords
      content: <関連キーワード>
---

# <サービス名>

**<キャッチコピー>**

<ユーザーの課題に共感する導入文>

<div class="cta-box">
  <a href="<サービスURL>" target="_blank" rel="noopener noreferrer" class="cta-button"><サービス名> を使ってみる →</a>
</div>

## こんな方におすすめ
- ターゲットユーザー1
- ターゲットユーザー2
- ターゲットユーザー3

## 主な機能
### 機能1
説明文
![altテキスト](/images/services/<slug>-<name>.png)

### 機能2
...

## 利用の流れ
1. ステップ1
2. ステップ2
...

## 料金
料金情報

## ご利用にあたって
- 本サービスのご利用には [利用規約](/terms) が適用されます
- 個人情報の取り扱いについては [プライバシーポリシー](/privacy-policy) をご確認ください

<div class="cta-box">
  <a href="<サービスURL>" target="_blank" rel="noopener noreferrer" class="cta-button"><サービス名> を使ってみる →</a>
</div>

<style>
.cta-box { text-align: center; margin: 32px 0; }
.cta-button {
  display: inline-block; padding: 12px 32px;
  background-color: var(--vp-c-brand); color: #fff !important;
  border-radius: 8px; font-weight: 600; font-size: 1.1em;
  text-decoration: none !important; transition: opacity 0.3s;
}
.cta-button:hover { opacity: 0.85; }
</style>
```

### 3. スクリーンショットの配置

- 個人情報を含まないスクリーンショットは `docs/public/images/services/` に直接配置
- 個人情報を含むスクリーンショットは配置せず、`<!-- IMAGE_PROMPT: ... -->` コメントでAI画像生成用プロンプトを記載し、画像参照はコメントアウトしておく

### 4. サービス一覧ページの更新

`docs/services.md` の `<!-- 今後のサービスはここに追加 -->` の直前に新しいカードを追加:

```markdown
<div class="service-card">

### <サービス名>

<サービスの概要説明>

[詳しく見る →](/services/<slug>)

</div>
```

### 5. サイドバーの更新

`docs/.vitepress/config.ts` の sidebar `/services/` 配列に追加:

```typescript
{ text: "<サービス名>", link: "/services/<slug>" },
```

### 6. 確認

- `yarn docs:build` でビルドが成功することを確認
- チームレビュー（code-reviewer, code-simplifier）を実行して品質を確認
- 必要に応じて改善を実施
