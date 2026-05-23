# サービスページ追加スキル

新しいサービスページをコーポレートサイトに追加します。

## 入力情報

以下の情報をユーザーから取得してください（不足があれば質問）:

- **サービス名**: 表示名（例: Calendar & Booking）
- **サービスURL**: 公開URL（例: https://booking.rittoku.llc/）
- **slug**: URLパス用の英字名（例: booking）
- **概要**: サービスの一行説明

## 事前確認

このプロジェクトは VitePress + GitHub Pages。`docs/` 配下の `.md` はすべて公開される。サービス紹介ページは公開コンテンツなので問題ないが、副産物として内部メモを作りたくなった場合は `docs/` 配下に置かないこと (詳細は `CLAUDE.md` の「Internal Documentation Layout」)。

## 手順

### 1. サービスサイトの調査

**Web サービスの場合 (Playwright で撮影可能)**:

- ブラウザサイズを統一: `browser_resize({width: 1280, height: 800})`
- Playwright でサービスサイト (引数に URL が含まれていればそれ) にアクセス
- 認証が必要な場面はユーザーに依頼して「ログインしました」の合図を待つ
- 主要画面のスクリーンショットを取得
- ページ内に開発者本人の名前 / 個人サイト一覧 / 機密情報が映る場合は、`browser_evaluate` で DOM を一時改変してから撮影する。代表的な手筋:
  ```js
  // ユーザー名を "demo user" に置換
  for (const el of document.querySelectorAll('nav *, header *')) {
    if (el.children.length === 0 && el.textContent.trim() === '<実名>') {
      el.textContent = 'demo user';
    }
  }
  // 個人 site 一覧などを丸ごと非表示
  const heading = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'マイサイト');
  if (heading) heading.closest('div').style.display = 'none';
  ```
- 余白が大きく見栄えしないページは `fullPage: false` (ビューポート撮影) に切り替える
- ユーザー目線で共感を得られる情報（課題解決、使い方の簡単さ等）を把握する

**Desktop アプリ等で Playwright が使えない場合**:

- 必要なスクリーンショットの **画面と意図** を列挙し、ユーザーにチャットへ画像を貼ってもらうよう依頼
- 提供までは記事内に `<!-- IMAGE_PROMPT: ... -->` プレースホルダーを置いて公開を進められる
- 提供された画像は `docs/public/images/services/<slug>-<name>.png` に配置し、プレースホルダーを `![alt](...)` に戻す

**Playwright の一時ファイル置き場**: Playwright がアップロードできるのは project 配下のみ。テスト用ファイルが要る場合は `.playwright-mcp/` (gitignore 済) を使う。

### 2. サービス詳細ページの作成

`docs/services/<slug>.md` を以下の構成で作成。**太字のセクションは必須**、その他はサービス特性に応じて取捨選択:

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

<!-- ベータ版 / 注意事項を冒頭で示したい場合 (任意) -->
::: tip ベータ版について
〜〜
:::

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

<!-- Desktop と Web、無料と有料、ゲストとログインユーザー等の対比がある場合 (任意) -->
## XX と YY の役割分担

| | XX | YY |
| --- | --- | --- |
| 役割 | ... | ... |

## 料金
料金情報

<!-- 想定 Q&A が定型化している場合 (任意) -->
## よくある質問

**Q. ...**

A. ...

## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="<slug>" />

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

**CTA を 2 系統に分けたい場合** (Desktop ダウンロード + Web 版アクセス等):

```html
<div class="cta-box">
  <a href="<主CTA-URL>" class="cta-button">主CTA</a>
  <a href="<副CTA-URL>" target="_blank" rel="noopener noreferrer" class="cta-button cta-button-secondary">副CTA</a>
</div>

<style>
.cta-box { ...flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.cta-button-secondary {
  background-color: transparent; color: var(--vp-c-brand) !important;
  border: 2px solid var(--vp-c-brand);
}
.cta-button-secondary:hover { background-color: var(--vp-c-brand); color:#fff !important; opacity:1; }
</style>
```

**プレースホルダー URL の注意**: VitePress はビルド時にデッドリンクチェックを行う。`[こちら](FORM_URL_TBD)` のように markdown リンクを未確定 URL で書くとビルドが失敗する。後で差し替える予定の URL は本文ではなく `<!-- TODO: ... -->` コメント側に逃がし、本文は既存ページ (`/contact` 等) へ誘導する形にしておく。

### 3. スクリーンショットの配置

- 個人情報が映らない (またはマスキング済の) スクリーンショットは `docs/public/images/services/` に直接配置
- 命名規則: `<slug>-<画面名>.png` (例: `tsuzuri-editor.png`, `tsuzuri-notes.png`)
- 提供待ちのもの: `<!-- IMAGE_PROMPT: ... -->` コメントでプロンプトを記述し、`![](...)` をコメントアウトしておく
- 撮影時のおすすめ:
  - ヘッダ + ナビ + 主要コンテンツが入る `1280x800` ビューポート
  - ページに余白が多ければ `fullPage: false`、長い記事的ページなら `fullPage: true`

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

### 6. フィードバックフォーム組込

新サービスでも共通 `#feedback` チャンネル + 共通 Spreadsheet に投稿が届くよう、以下を更新:

1. **記事への埋め込み**: Step 2 のテンプレ通り `<ServiceFeedbackForm service="<slug>" />` を「フィードバック」セクションに配置 (テンプレに含まれている)
2. **クライアント側の型追加**: `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` の `ServiceId` 型に `| '<slug>'` を追加
3. **GAS 側の許可リスト + メタ追加**: `gas/feedback/config.gs` を編集
   - `ALLOWED_SERVICES` に `'<slug>'` を追加
   - `SERVICE_META` に `<slug>: { emoji: '🆕', label: '<サービス名>', color: '#XXXXXX' }` を追加。色は既存と十分異なるものを選ぶ:
     - booking: `#1D9BD1` (青)
     - soan: `#2EB67D` (緑)
     - tsuzuri: `#E8912D` (橙)
4. **外部側の同期 (ユーザー操作依頼)**:
   - Apps Script UI で `config.gs` を repo の内容と同じになるよう貼り直す
   - Spreadsheet `Rittoku Feedback Log` にタブ `<slug>` を追加し、ヘッダ行 (`timestamp / service / message / userAgent / ip_hash / slack_status / notes`) をコピー

詳細な背景・トラブルシュートは `handover/service-feedback-operations.md` を参照。

### 7. 確認

- `yarn docs:build` でビルドが成功することを確認
- `yarn docs:preview` (またはローカル `.env.local` を整えた上で `yarn docs:dev`) でフォームを含む表示を Playwright か手動でチェック
- チームレビュー (`pr-review-toolkit:code-reviewer` / `pr-review-toolkit:code-simplifier`) を実行して品質を確認
- 必要に応じて改善を実施

### 8. 引継ぎ・コミット

- 公開後の確認項目があれば `handover/` 配下に整理 (`docs/handover/` ではない、project root の `handover/`)
- 完了したら commit。直接 push する場合は GitHub Actions のビルド結果も監視する
