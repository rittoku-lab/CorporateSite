---
title: Tenboku(点墨) | 合同会社リットク
description: 単一 Markdown をミリ秒未満で開き、キーボードだけでタスクリストにチェックを打つ Rust 製 TUI ツール。
head:
  - - meta
    - name: keywords
      content: TUI, CLI, Markdown, タスクリスト, Todo, Rust, ratatui, Tenboku, 点墨, tb, キーボード, Vim
---

# Tenboku(点墨)

**単一 Markdown を開き、キーボードだけでタスクにチェックを打つための TUI ツールです。**

TODO を Markdown で書いている方が、思考の流れを切らずに「今できたやつ」に墨を入れたい — その 1 動作のためだけに作った Rust 製の TUI (`tb`) です。ファイルブラウザもディレクトリ検索もありません。指定した 1 ファイルの閲覧とチェック更新に集中します。

<div class="cta-box">
  <a href="https://github.com/rittoku-lab/Tenboku" target="_blank" rel="noopener noreferrer" class="cta-button">GitHub リポジトリを見る →</a>
</div>

::: tip 開発版について
点墨 (Tenboku) は現在開発版です。Rust ツールチェーンをお持ちの方向けに、ソースからのビルドインストールでお試しいただけます。バイナリ配布・パッケージマネージャ対応は今後を予定しています。
:::

## こんな方におすすめ

- TODO を Markdown ファイルで手元管理していて、**チェックを打つ 1 動作だけ速くしたい** 方
- 起動が重いエディタや Web アプリを開くのが億劫で、**ターミナルで完結させたい** 方
- Vim ライクなキー操作 (`j` / `k` / `Ctrl+f` / `Ctrl+b`) が身体に馴染んでいる方
- チェック更新の副作用として **ファイルにゴミ (BOM、改行差分、順序変化)** を残されたくない方

## 主な機能

### ミリ秒未満で起動、すぐ描画

Rust + `ratatui` + `crossterm` で構成し、起動から初回描画まで一瞬。ターミナルの代替画面 (Alternate Screen) を使うので、終了時にターミナルのログを汚しません。

![点墨 (Tenboku) を起動した直後の全体表示。タイトルバー「点墨: verify.md」、藍色太字の見出しと DIM 表示の解説文が並び、下部ステータスバーに `j/k: 移動 | Space: 点墨 | w: 保存 | q: 終了` が表示されている](/images/services/tenboku-overview.png)

### `Space` ひとつで点墨 (チェック更新)

カーソル行が `- [ ]` なら `- [x]` へ、`- [x]` なら `- [ ]` へ切り替え。原本のインデントや行順は保ったまま、対象行だけを差し替えます。

![「2. タスク項目」セクションで `▢ 未チェック（トグル対象）` の行に `>` カーソルが当たり、行全体がハイライトされている状態。既にチェック済みの `▣ チェック済み` は DIM (薄グレー) で表示されている](/images/services/tenboku-toggle.png)

### Markdown を読みやすく描画

見出し・タスク項目・箇条書き・番号リスト・ブロッククォート・水平線・テーブル・コードブロック・インライン装飾までを、ターミナル向けに整形して描画します。CJK 幅を考慮したテーブル整列にも対応しています。

![番号付きリスト、ブロッククォート (`│` ガター + DIM italic)、水平線 (`─` で本文幅一杯) が装飾表示された画面](/images/services/tenboku-render.png)

### アトミックな上書き保存

`w` または `Ctrl+S` で保存。tmp ファイルへ書き出してから rename する方式で、書き込み途中の状態でファイルが壊れることを避けます。

### 未保存時の「破棄確認」arm

未保存のまま `q` を押すと、いきなり閉じずに 1 度目は arm 状態 (破棄確認モード) に入ります。もう一度 `q` で破棄、`w` / `Ctrl+S` で保存して終了、それ以外のキーで arm を解除して編集続行。「うっかり q を押して作業を失う」を防ぎます。

## 利用の流れ

1. **クローン & インストール** — Rust ツールチェーン ([rustup](https://rustup.rs/)) を入れた上で:
   ```bash
   git clone https://github.com/rittoku-lab/Tenboku.git
   cd Tenboku
   cargo install --path .
   ```
2. **Markdown ファイルを開く** — `tb path/to/notes.md`
3. **`j` / `k` で移動**、**`Space` で点墨** — 見出し・コード・引用は無視され、タスク行 (`- [ ]` / `- [x]`) のみが切り替わります
4. **`w` で保存、`q` で終了** — 未保存時は破棄確認 arm 状態を経由

## 主要キーバインド

| キー | 動作 |
| --- | --- |
| `j` / `↓` | 1 行下 |
| `k` / `↑` | 1 行上 |
| `Ctrl+f` / `PageDown` | 1 ページ下 |
| `Ctrl+b` / `PageUp` | 1 ページ上 |
| `Space` / `Enter` | 選択行の `- [ ]` ⇄ `- [x]` |
| `w` / `Ctrl+S` | 上書き保存 (tmp → rename のアトミック書き込み) |
| `q` / `Esc` | 終了。未保存時は 1 度目で破棄確認 arm |

## 対応環境

| | 対応 |
| :-- | :-- |
| **OS** | macOS / Linux (Rust が動く UNIX 系) |
| **必要ツール** | Rust ツールチェーン (安定版) |
| **想定ターミナル** | 256 色以上の等幅フォント表示ができるもの (iTerm2 / Alacritty / WezTerm など) |
| **対象ファイル** | 単一の Markdown ファイル (`.md`) |

## 料金

**無料** でご利用いただけます (OSS)。

## よくある質問

**Q. Windows でも使えますか?**

A. 現状は macOS / Linux での動作確認のみです。`crossterm` は Windows もサポートしているため理論上ビルドは通りますが、公式にはサポートしていません。

**Q. ディレクトリを開いて複数ファイルを行き来したい**

A. 点墨は「単一ファイル」に絞る設計思想です。ディレクトリブラウザは意図的に持ちません。用途が広がる場合は別ツールとの併用をおすすめします。

**Q. ネスト・インデントされたタスク行にも使えますか?**

A. 使えます。原本のインデント (半角スペース) はそのまま保持したまま、`- [ ]` / `- [x]` の部分のみを置換します。

## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="tenboku" />

## ご利用にあたって

- 本サービスのご利用には [利用規約](/terms) が適用されます
- 個人情報の取り扱いについては [プライバシーポリシー](/privacy-policy) をご確認ください

<div class="cta-box">
  <a href="https://github.com/rittoku-lab/Tenboku" target="_blank" rel="noopener noreferrer" class="cta-button">GitHub リポジトリを見る →</a>
</div>

<style>
.cta-box {
  text-align: center;
  margin: 32px 0;
}

.cta-button {
  display: inline-block;
  padding: 12px 32px;
  background-color: var(--vp-c-brand);
  color: #fff !important;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1em;
  text-decoration: none !important;
  transition: opacity 0.3s;
}

.cta-button:hover {
  opacity: 0.85;
}
</style>
