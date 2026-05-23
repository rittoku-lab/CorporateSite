---
title: Tsuzuri（綴） | 合同会社リットク
description: Markdownのメモを思いついた瞬間に書き留めるLocal-Firstノートアプリ。Desktopで書き、Webで読み返す。ローカル DB とクラウド DB の自動同期に対応。
head:
  - - meta
    - name: keywords
      content: ノートアプリ, Markdown, Local-First, Tsuzuri, 綴, ナレッジグラフ, メモアプリ, Desktop, macOS
---

# Tsuzuri（綴）

**Markdown のメモを「いま思いついた瞬間に書き留める」ための Local-First ノートアプリです。**

グローバルホットキーで Desktop が一瞬で立ち上がり、書き終えたらメニューバーへ静かに戻ります。書く側（Desktop）と読む側（Web）を意図的に分け、検索やナレッジグラフはブラウザ側でじっくり眺める設計です。

データはローカル DB に保存されつつ、自分専用のクラウド DB と自動同期されるので、Mac を閉じても出先のスマホブラウザから読み返せます。

<div class="cta-box">
  <a href="https://github.com/rittoku-lab/Tsuzuri/releases/download/v0.1.0/Tsuzuri_0.1.0_aarch64.dmg" class="cta-button">Desktop アプリをダウンロード (macOS Apple Silicon)</a>
  <a href="https://tsuzuri.rittoku.llc" target="_blank" rel="noopener noreferrer" class="cta-button cta-button-secondary">Web 版を開く</a>
</div>

::: tip ベータ版について
Tsuzuri は現在ベータ提供中です。macOS（Apple Silicon）向けの Desktop アプリと、ブラウザで動く Web 版を組み合わせてご利用いただけます。ベータ期間中の利用は無料です。
:::

## こんな方におすすめ

- 思考の断片を **頻繁に書き留めたい** が、UI の重さで集中を切られたくない方
- メモを **アプリ任せにせず、自分の手元にも残しておきたい** 方（Local-First）
- ノート同士の繋がりを **後からグラフで眺めて気付きを得たい** 方
- **macOS（Apple Silicon）** をメインに使っている方

## 主な機能

### ホットキー起動

`Cmd + Shift + N` でメニューバーから即起動。書き終えて `Cmd + S` で保存、`Cmd + W` で背景へ。書く以外の動作を増やさない設計です。

![Tsuzuri Desktop エディタ。タイトル「気付きを書く」とリスト形式の本文を Markdown で書いた状態。右上に同期状態が表示されている](/images/services/tsuzuri-editor.png)

### 明朝のエディタ

見出し / 太字 / コード / リンクなど Markdown を直接書ける Carta エディタ。和文は Hiragino Mincho ProN ベースで、長文を書くほど落ち着く佇まいです。

### ローカル + クラウド同期

ローカル SQLite（libsql）に保存されつつ、ユーザーごとの Turso DB に Embedded Replica で自動同期されます。オフライン中も書き続けられ、ネット復帰時に追いつきます。

### Web で読む・探す

`https://tsuzuri.rittoku.llc` から自分のノートを閲覧・全文検索（FTS5）・ナレッジグラフ表示できます。Desktop には検索機能をあえて入れず、書く時の集中を守ります。

![Tsuzuri の Web 版で表示したノート一覧画面](/images/services/tsuzuri-notes.png)

<!-- IMAGE_PROMPT: Tsuzuri の Web 版 /graph 画面。30 ノード前後のナレッジグラフが、ノード同士のリンクで結ばれて表示されている。中央にハブとなるノートがあり、関連ノートが放射状に広がる構造。 -->
<!-- ![ノート同士を線で結んだナレッジグラフ表示](/images/services/tsuzuri-graph.png) -->

### `[[ノート名]]` でつなぐ

ノート間の wiki 風リンク。書いた瞬間にバックリンクが反映され、グラフで全体像が見える設計です。

## 利用の流れ

1. **Web 版へのアクセスを確認** — ベータ招待メールに記載された Google アカウントで [tsuzuri.rittoku.llc](https://tsuzuri.rittoku.llc) にサインインできることを確認します
2. **Desktop アプリをインストール** — [Tsuzuri_0.1.0_aarch64.dmg](https://github.com/rittoku-lab/Tsuzuri/releases/download/v0.1.0/Tsuzuri_0.1.0_aarch64.dmg) をダウンロードしてインストール（コード署名未対応のため、初回起動は **右クリック → 開く** で Gatekeeper を回避）
3. **Sign in with Google** — アプリを起動して同じ Google アカウントでサインイン。自分専用のクラウド DB が自動構築されます
4. **メモを書き始める** — `Cmd + Shift + N` でエディタを呼び出し、タイトルは 1 行目に。保存は `Cmd + S` か自動保存
5. **Web で読み返す** — ブラウザの [tsuzuri.rittoku.llc/notes](https://tsuzuri.rittoku.llc/notes) で書いたものを一覧・検索。グラフは Web 側で

## Desktop と Web の役割分担

| | Desktop | Web |
|:--|:--|:--|
| **役割** | 書く | 読む・探す・俯瞰する |
| **主な操作** | ホットキー起動 + Markdown 編集 | 一覧 / 検索 / グラフ |
| **オフライン** | ◯ ローカル DB で書き続けられる | △ ノート閲覧不可 |
| **必要な環境** | macOS（Apple Silicon） | モダンブラウザ（Chrome / Safari / Firefox） |

## 料金

ベータ期間中は **無料** でご利用いただけます。

## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="tsuzuri" />


## ご利用にあたって

- 本サービスのご利用には [利用規約](/terms) が適用されます
- 個人情報の取り扱いについては [プライバシーポリシー](/privacy-policy) をご確認ください

<div class="cta-box">
  <a href="https://github.com/rittoku-lab/Tsuzuri/releases/download/v0.1.0/Tsuzuri_0.1.0_aarch64.dmg" class="cta-button">Desktop アプリをダウンロード (macOS Apple Silicon)</a>
  <a href="https://tsuzuri.rittoku.llc" target="_blank" rel="noopener noreferrer" class="cta-button cta-button-secondary">Web 版を開く</a>
</div>

<style>
.cta-box {
  text-align: center;
  margin: 32px 0;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
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

.cta-button-secondary {
  background-color: transparent;
  color: var(--vp-c-brand) !important;
  border: 2px solid var(--vp-c-brand);
}

.cta-button-secondary:hover {
  background-color: var(--vp-c-brand);
  color: #fff !important;
  opacity: 1;
}
</style>
