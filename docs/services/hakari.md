---
title: Hakari（秤） | 合同会社リットク
description: リスク調整後リターン（簡易シャープレシオ）でチーム内順位を競う、6 か月シーズン制の投資学習 Web アプリ。1 ユーザー最大 3 銘柄、AI による選定理由の壁打ち付き。
head:
  - - meta
    - name: keywords
      content: 投資学習, 投資シミュレーション, シャープレシオ, リスク調整後リターン, ポートフォリオ, ゲーミフィケーション, Hakari, 秤
---

# Hakari（秤）

**「儲け額」ではなく「リスクの取り方」で競う、チーム型の投資学習 Web アプリです。**

投資シミュレーションは「とにかく上がりそうな銘柄を全力で買う」ゲームになりがちです。Hakari（秤）は短期の運に左右されにくいスコアリングで、「なぜその銘柄なのか」を仲間と言語化しながら楽しめる設計です。

<div class="cta-box">
  <a href="https://hakari.rittoku.llc/" target="_blank" rel="noopener noreferrer" class="cta-button">Hakari を使ってみる →</a>
</div>

::: tip ベータ版について
Hakari は現在ベータ提供中です。Google アカウントがあればどなたでも無料でご利用いただけます。
:::

## こんな方におすすめ

- 投資を始めたいが、**ギャンブル的にはなりたくない** 学生・社会人
- **社内勉強会・FP 学習サークル等のチーム** で楽しみながら知識を深めたい方
- 「なんとなく投資」から脱して **根拠を言語化したい** 中級者
- 配信や読み物だけでは続かない、**仲間と競う仕組み** が欲しい方

## 主な機能

### リスク調整後リターンで競うランキング

週次（月曜始値 → 金曜終値）の合計変動率を日次標準偏差で割った **簡易シャープレシオ** でチーム内順位を決定します。元本概念がなく「銘柄選定の上手さ」だけで競うため、運要素を抑えた設計です。

<!-- IMAGE_PROMPT: Hakari League ページ。チーム内ランキングがリスト表示され、各メンバー行に「picks 3」「sharpe 1.42」などの数値が並ぶ。上位順位ほど背景がハイライトされている。 -->
<!-- ![チーム内ランキング画面](/images/services/hakari-league-ranking.png) -->

### 1 ユーザー最大 3 銘柄のポートフォリオ

国内株式・米国株・FX に対応。1 銘柄集中もできるし 3 銘柄分散もできます。暗号資産・債券・オプションは対象外です。

![Hakari ポートフォリオ画面。「ティッカーまたは会社名」入力欄から銘柄を追加できる](/images/services/hakari-portfolio.png)

### 週次サイクルとシーズン制

月曜朝の市場開始までに **その週の銘柄を確定**、途中リバランスは不可。1 シーズン = 6 か月で総合優勝を決定し、チームは解散します。次シーズンへは招待リンクで継続できます。

![Hakari ダッシュボード。今週の総合スコア / シーズン総合 / 保有銘柄が並んで表示されている](/images/services/hakari-dashboard.png)

### AI と銘柄選定理由を壁打ち

銘柄登録時に「なぜ選んだか」をテキストで入力すると、AI が論理的に問い返してくれます。選定した銘柄に関するニュース要約も AI で取得できます。

<!-- IMAGE_PROMPT: Hakari の AI 壁打ち画面。ユーザーが書いた銘柄選定理由に対して、AI が「なぜその指標を重視しているのか？」など問い返しているチャット形式の対話画面。 -->
<!-- ![AI が銘柄選定理由に問い返すチャット画面](/images/services/hakari-chat.png) -->

### チームでの招待・運用

Google OAuth ログイン（パスワード不要）。招待 URL 経由で参加するとそのチームに自動所属、URL を踏まずにサインアップすると自分専用チームが作成されます。「後勝ち」ルールで別チームへ移籍も可能です。

![Hakari チーム画面。チーム名 / ランキング / 招待リンク発行ボタンが並んで表示されている](/images/services/hakari-team.png)

### 定期通知でモチベ維持

- **日次（平日夜）** — 暫定変動率 + 銘柄関連ニュース
- **週次（土曜朝）** — 週間順位発表
- **月次（月末）** — 月間レポート + 6 か月総合順位
- **シーズン終了** — 最終順位 + 投資傾向フィードバックレポート

送信元は `no-reply@rittoku.llc`（ドメイン認証済）です。

## 利用の流れ

1. **Google アカウントでサインイン** — [hakari.rittoku.llc](https://hakari.rittoku.llc/) を開いて「Google でログイン」。初回は自分専用チームが自動作成されます (招待 URL から参加すればそのチームに所属)
2. **3 銘柄まで選定し、選定理由を入力** — AI が選定理由を問い返してくれます
3. **週初までに確定** — 月曜始値からスコアリングが始まります
4. **毎週土曜朝にチーム内順位を確認** — 日々の通知メールで暫定状況も追えます
5. **6 か月後に総合優勝チームが決定**

![Hakari ログイン画面。Google でログインボタンが中央に表示されている](/images/services/hakari-login.png)

## 料金

ベータ期間中は **無料** でご利用いただけます。Google アカウントがあれば追加の申込みなしで始められます。

## よくある質問

**Q. 実際のお金は動きますか？**

A. いいえ。Hakari はあくまで学習用シミュレーションで、株価データを使ってスコアを算出するのみです。実際の売買は発生しません。

## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="hakari" />

## ご利用にあたって

- 本サービスのご利用には [利用規約](/terms) が適用されます
- 個人情報の取り扱いについては [プライバシーポリシー](/privacy-policy) をご確認ください

<div class="cta-box">
  <a href="https://hakari.rittoku.llc/" target="_blank" rel="noopener noreferrer" class="cta-button">Hakari を使ってみる →</a>
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
