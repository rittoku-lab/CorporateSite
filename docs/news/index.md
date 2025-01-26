# お知らせ

## 直近のお知らせ
<script setup>
const recentNews = [
  {
    date: "2025/01/25",
    title: "リットクが始動しました",
    content: "開発会社として合同会社リットクを設立いたしました",
    link: "/news/posts/start-inc"
  },
]
</script>

<template v-for="news in recentNews" :key="news.date">
  <h3>
    <a :href="news.link">{{ news.title }} ({{ news.date }})</a>
  </h3>
  <p>{{ news.content }}</p>
</template>
