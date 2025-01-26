import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/CorporateSite",
  title: "合同会社リットク",
  description: "Corporate website and content hub",
  lang: "ja-JP",
  head: [
    ["meta", { name: "author", content: "Rittoku LLC." }],
    [
      "meta",
      {
        name: "keywords",
        content: "corporate, business, services, technology, sustainability",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Corporate Site" }],
    [
      "meta",
      {
        property: "og:description",
        content: "Corporate website and content hub",
      },
    ],
    [
      "meta",
      { property: "og:image", content: "https://example.com/og-image.jpg" },
    ],
    ["meta", { property: "og:url", content: "https://your-domain.com" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["link", { rel: "canonical", href: "https://your-domain.com" }],
  ],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/about" },
      { text: "Services", link: "/services" },
      { text: "News", link: "/news/" },
      { text: "Contact", link: "/contact" },
    ],
    sidebar: {},
    socialLinks: [{ icon: "github", link: "https://github.com/rittoku-lab" }],
    footer: {
      message:
        '<a href="/privacy-policy">プライバシーポリシー</a> | <a href="/company">企業情報</a>',
      copyright: "© 2024 Rittoku LLC. All rights reserved.",
    },
  },
});
