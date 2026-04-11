---
title: サービス一覧 | 合同会社リットク
description: 合同会社リットクが提供するサービスの一覧です。
head:
  - - meta
    - name: keywords
      content: サービス, 合同会社リットク, Booking, 予約ツール, SOAN, 一時ホスティング
---

# サービス

合同会社リットクが提供するサービスをご紹介します。

<div class="services-grid">

<div class="service-card">

### Calendar & Booking

Google Calendar と連携し、空き時間を共有リンクで公開できる軽量な予約ツールです。フリーランス・個人事業主・小規模チームの予約管理をシンプルにします。

[詳しく見る →](/services/booking)

</div>

<div class="service-card">

### SOAN（草庵）

Web フロントエンドの成果物を一瞬で公開できる一時ホスティングサービスです。ファイルをドロップするだけで共有 URL が発行され、時間が来れば自動で消えます。

[詳しく見る →](/services/soan)

</div>

<!-- 今後のサービスはここに追加 -->
<!--
<div class="service-card">

### サービス名

サービスの概要説明

[詳しく見る →](/services/service-name)

</div>
-->

</div>

<style>
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.service-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.3s;
}

.service-card:hover {
  border-color: var(--vp-c-brand);
}

.service-card h3 {
  margin-top: 0;
}

.service-card a {
  font-weight: 600;
}
</style>
