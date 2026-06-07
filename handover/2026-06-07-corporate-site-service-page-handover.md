# Hakari サービスページ作成ハンドオーバー (CorporateSite 向け)

合同会社リットクのコーポレートサイト ([CorporateSite](../../../CorporateSite/)) に **Hakari (秤)** のサービス紹介ページを追加するための入力資料。次セッションで `/add-service` スキル相当の作業を実行する際にそのまま流し込める形でまとめている。

---

## 0. 作業対象とエントリポイント

- **作業リポジトリ**: `../CorporateSite/` (Hakari と兄弟ディレクトリ)
- **使うコマンド**: `.claude/commands/add-service.md` の手順をそのまま踏襲
- **影響範囲**:
  - 新規: `docs/services/hakari.md`
  - 新規: `docs/public/images/services/hakari-*.png` (複数)
  - 編集: `docs/services.md` (カード追加)
  - 編集: `docs/.vitepress/config.ts` (sidebar 追加)
  - 編集: `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` (`ServiceId` 型に `'hakari'`)
  - 編集: `gas/feedback/config.gs` (`ALLOWED_SERVICES` + `SERVICE_META`)
  - ユーザー操作依頼: Apps Script 側 `config.gs` の貼り直し、Spreadsheet `Rittoku Feedback Log` に `hakari` タブ追加

---

## 1. /add-service への入力情報 (確定値)

| 項目         | 値                                                            |
| ------------ | ------------------------------------------------------------- |
| サービス名   | **Hakari（秤）**                                              |
| サービス URL | **https://hakari.rittoku.llc/**                               |
| slug         | **hakari**                                                    |
| 概要         | リスク調整後リターンで競うチーム型・投資学習 Web アプリ        |
| Slack 絵文字 | 🪙 (案、要確認)                                                |
| Slack 色     | `#7C5CFF` (紫系、booking 青 / soan 緑 / tsuzuri 橙 と十分差別化) |
| 提供状態     | **ベータ提供中・無料・招待制 (Google アカウント必須)**        |

> 絵文字・色は既存サービスと衝突しない案。実装時に最終確認してから `gas/feedback/config.gs` へ反映する。

---

## 2. ポジショニング (記事冒頭で使うコピーの素材)

### 一行キャッチコピー (案)

> **「儲け額」ではなく「リスクの取り方」で競う、チーム型の投資学習 Web アプリです。**

### 導入文 (案)

> 投資シミュレーションは「とにかく上がりそうな銘柄を全力で買う」ゲームになりがちです。Hakari（秤）は、週次の値動きを **日次リスク（標準偏差）で割った簡易シャープレシオ** でチーム内順位を決定します。短期の運に左右されにくく、「なぜその銘柄なのか」を仲間と言語化しながら、6 か月のシーズン制で楽しみ続けられる設計です。

### 名前の由来

- 「秤 (はかり)」= リターンとリスクを **天秤にかけて測る** ことから命名
- リットクの和語シリーズ (綴 = Tsuzuri, 草庵 = SOAN) の系譜

---

## 3. こんな方におすすめ (記事ターゲット)

- **投資を始めたいが、ギャンブル的にはなりたくない** 学生・社会人
- **社内勉強会・FP 学習サークル等のチーム** で楽しみながら知識を深めたい
- **「なんとなく投資」から脱して根拠を言語化したい** 中級者
- 配信や読み物だけでは続かない、**仲間と競う仕組み** が欲しい方

---

## 4. 主な機能 (記事に載せる粒度で整理)

### 4.1 リスク調整後リターンで競うランキング

- 週次 (月曜始値 → 金曜終値) の合計変動率を日次標準偏差で割った **簡易シャープレシオ** でチーム内順位決定
- 元本概念なし。「銘柄選定の上手さ」だけで競うので、運要素を抑えた設計
- 推奨スクショ: League ページのチームランキング画面

### 4.2 1 ユーザー最大 3 銘柄のポートフォリオ

- 国内株式・米国株・FX 対応 (暗号資産・債券・オプションは対象外)
- 1 銘柄集中もできるし 3 銘柄分散もできる
- 推奨スクショ: Portfolio ページ (銘柄カード + 週次値動き)

### 4.3 週次サイクルとシーズン制

- 月曜朝の市場開始までに **その週の銘柄を確定**、途中リバランス不可
- 1 シーズン = 6 か月。終了で総合優勝、チームは解散 → 招待リンクで次シーズンに継続可
- 推奨スクショ: Dashboard (現週の状態 / 残り時間 / シーズン進捗)

### 4.4 AI と銘柄選定理由を壁打ち

- 銘柄登録時に「なぜ選んだか」をテキストで入力 → AI (Anthropic) が論理的に問い返し
- 選定した銘柄に関するニュース要約も AI で取得
- 推奨スクショ: Chat 画面 (壁打ち例 / ニュース要約例)

### 4.5 チームでの招待・運用

- Google OAuth ログイン (パスワードなし)
- 招待 URL 経由で参加するとそのチームに自動所属、URL を踏まずにサインアップすると自分専用チームが作成
- 「後勝ち」ルールで別チームへ移籍可、移籍前に確認ダイアログ
- 推奨スクショ: Team ページ (招待 URL 発行 + メンバー一覧)

### 4.6 定期通知でモチベ維持

- **日次 (平日夜)**: 暫定変動率 + 銘柄関連ニュース
- **週次 (土曜朝)**: 週間順位発表
- **月次 (月末)**: 月間レポート + 6 か月総合順位
- **シーズン終了**: 最終順位 + 投資傾向フィードバックレポート
- 送信元は `no-reply@rittoku.llc` (SES, ドメイン認証済)

---

## 5. 利用の流れ (記事「利用の流れ」セクション)

1. **チーム招待 URL を受け取る** (個人で始める場合は招待なしでも OK、自分専用チームが自動作成)
2. **Google アカウントでサインイン** ([hakari.rittoku.llc](https://hakari.rittoku.llc/))
3. **3 銘柄まで選定し、選定理由を入力** (AI が壁打ち)
4. **週初までに確定** すると、月曜始値からスコアリング開始
5. **毎週土曜朝にチーム内順位を確認** + 日々の通知メールで暫定状況を追える
6. **6 か月後に総合優勝チームが決定** → 次シーズンの招待リンクで継続も可

---

## 6. 料金 (記事用)

- **ベータ期間中: 無料**
- 招待制 (ベータ参加希望者は問い合わせフォームから連絡してもらう or 個別配布)

> 招待制の運用方針は記事公開時に最終確認。CTA を「ベータ参加申込」とするか「ログイン」とするかで言い回しが変わる。

---

## 7. スクリーンショット計画

Playwright で撮影可能。ただし **Google OAuth + 実データ表示** なので以下の配慮が必要。

### 7.1 撮影前準備

- ブラウザサイズ統一: `browser_resize({ width: 1280, height: 800 })`
- 撮影アカウントは **デモ用に作ったテストアカウント** を使う (実名・メールアドレスが映らないように)
- DOM 改変で個人情報マスキング:
  ```js
  // ヘッダのユーザー名を "demo user" に置換
  for (const el of document.querySelectorAll('header *, nav *')) {
    if (el.children.length === 0 && /[a-zA-Z0-9._-]+@/.test(el.textContent)) {
      el.textContent = 'demo@example.com';
    }
  }
  ```
- Google OAuth ステップは撮影不要 (画面遷移だけ済ませて Dashboard 以降を撮る)

### 7.2 推奨撮影リスト (記事掲載順)

| ファイル名                       | 撮影画面             | 撮影時のコツ                                     |
| -------------------------------- | -------------------- | ------------------------------------------------ |
| `hakari-dashboard.png`           | Dashboard            | 現週の状態 + 残り時間 + 暫定順位が見える状態     |
| `hakari-portfolio.png`           | Portfolio            | 3 銘柄選定済 + リターン/リスク表示が見える状態   |
| `hakari-league-ranking.png`      | League (Ranking)     | チーム順位 + 簡易シャープレシオの値が見える状態  |
| `hakari-chat.png`                | Chat (AI 壁打ち)     | 銘柄選定理由 + AI の問い返しが対話形式で見える   |
| `hakari-team.png`                | Team                 | 招待 URL + メンバー一覧 (氏名はマスキング)       |
| `hakari-login.png` (任意)        | Login                | Google ボタンが映るシンプルな画面                |

- 余白が多いページは `fullPage: false`、縦長コンテンツは `fullPage: true`
- 提供できない画像は `<!-- IMAGE_PROMPT: ... -->` プレースホルダーで先行公開可

---

## 8. ServiceFeedbackForm 連携 (add-service Step 6)

### 8.1 リポジトリ側変更

`docs/.vitepress/theme/components/ServiceFeedbackForm.vue` の `ServiceId` 型に追加:

```ts
type ServiceId = 'booking' | 'soan' | 'tsuzuri' | 'hakari';
```

`gas/feedback/config.gs` に追加:

```js
ALLOWED_SERVICES: ['booking', 'soan', 'tsuzuri', 'hakari'],
SERVICE_META: {
  // ... 既存 ...
  hakari: { emoji: '🪙', label: 'Hakari（秤）', color: '#7C5CFF' },
},
```

### 8.2 ユーザー操作依頼 (記事 commit 前後で)

- Apps Script UI で `config.gs` を repo の内容に合わせて貼り直す
- Spreadsheet `Rittoku Feedback Log` に `hakari` タブを追加し、ヘッダ行コピー: `timestamp / service / message / userAgent / ip_hash / slack_status / notes`

---

## 9. CTA ボタン構成

- 基本 1 系統で十分: 「Hakari を使ってみる」→ https://hakari.rittoku.llc/
- ベータ招待を強調する場合: 「ベータ参加について問い合わせる」(`/contact` 誘導) を副 CTA に追加
- 招待制ゆえに **CTA の表現** を Tsuzuri (Desktop + Web の 2 系統) より慎重に決める
- 未確定 URL は本文ではなく `<!-- TODO: ... -->` コメントに逃がす (VitePress のデッドリンクチェック対策)

---

## 10. SEO メタ情報 (frontmatter 案)

```yaml
title: Hakari（秤） | 合同会社リットク
description: リスク調整後リターン（簡易シャープレシオ）でチーム内順位を競う、6 か月シーズン制の投資学習 Web アプリ。1 ユーザー最大 3 銘柄、AI による選定理由の壁打ち付き。
head:
  - - meta
    - name: keywords
      content: 投資学習, 投資シミュレーション, シャープレシオ, リスク調整後リターン, ポートフォリオ, ゲーミフィケーション, Hakari, 秤
```

---

## 11. 詳細仕様参照先 (記事執筆時の真実のソース)

- 要件: [Hakari/docs/requirement.md](../requirement.md)
- アーキ: [Hakari/docs/architect.md](../architect.md)
- インフラ: [Hakari/docs/infra.md](../infra.md)
- 実装履歴: [Hakari/docs/handover/2026-06-07-next-session-handover.md](./2026-06-07-next-session-handover.md)

---

## 12. 公開前チェックリスト

- [ ] `docs/services/hakari.md` 作成 (太字必須セクションを満たす)
- [ ] スクリーンショット 5-6 枚配置 (`docs/public/images/services/hakari-*.png`)
- [ ] `docs/services.md` にカード追加 (`<!-- 今後のサービスはここに追加 -->` 直前)
- [ ] `docs/.vitepress/config.ts` sidebar `/services/` に `{ text: 'Hakari（秤）', link: '/services/hakari' }` 追加
- [ ] `ServiceFeedbackForm.vue` の `ServiceId` 型に `'hakari'` 追加
- [ ] `gas/feedback/config.gs` の `ALLOWED_SERVICES` + `SERVICE_META` 追加
- [ ] `yarn docs:build` 成功
- [ ] `yarn docs:preview` で表示確認 (CTA / フィードバックフォーム / 画像 / メタ)
- [ ] pr-review-toolkit:code-reviewer / code-simplifier で品質確認
- [ ] Apps Script `config.gs` 貼り直し (ユーザー操作)
- [ ] Spreadsheet `Rittoku Feedback Log` に `hakari` タブ作成 (ユーザー操作)
- [ ] commit + push、必要なら GitHub Actions ビルド結果監視

---

## 13. 公開後に検討すべき項目 (任意)

- ベータ招待フローを `/contact` 別チャネル化するか (Slack/Discord 招待 URL の発行)
- 「実例の週次ランキング」スクショの定期更新運用 (古い銘柄が映るとメンテ負担)
- Hakari 側のドメイン (`hakari.rittoku.llc`) と CorporateSite (`rittoku.llc`) 間の相互リンク (`/about` から個別サービスへの導線整備)
- 利用規約 / プライバシーポリシーに Hakari 特有事項 (株価データ表示 / AI 連携 / メール通知) を追記する必要があるか確認

---

## 14. TL;DR

- **何を作るか**: CorporateSite に Hakari (秤) のサービス紹介ページ
- **どう作るか**: `../CorporateSite/.claude/commands/add-service.md` の手順をそのまま実行
- **入力情報**: §1 (slug `hakari` / URL `https://hakari.rittoku.llc/` / 絵文字 🪙 / 色 `#7C5CFF`)
- **コア訴求**: 「儲け額ではなくリスクの取り方で競う」「6 か月シーズン制でチーム学習」「AI と選定理由を壁打ち」
- **詰めるべき判断**: ベータ招待の CTA 表現、絵文字/色の最終確認、デモ用アカウント準備
- **詳細ソース**: §11 の requirement.md / architect.md / infra.md を参照
