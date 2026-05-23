# Service Feedback 運用引継ぎ

> 設計: `plans/2026-05-22-service-feedback-slack-design.md`
> 実装計画: `plans/2026-05-22-service-feedback-slack-impl.md`
> GAS ソース: `gas/feedback/`
> 公開先: `https://rittoku.llc/services/booking` / `/soan` / `/tsuzuri` のページ末尾

## システム構成 (要約)

```
rittoku.llc (VitePress / GitHub Pages)
    │ POST JSON (text/plain)
    ▼
GAS Web App (匿名アクセス、Apps Script)
    │
    ├─► Google Spreadsheet "Rittoku Feedback Log" (タブ: booking / soan / tsuzuri)
    └─► Slack #feedback (Incoming Webhook)
```

クライアント側は `docs/.vitepress/theme/components/ServiceFeedbackForm.vue`。GAS Web App URL と Shared Token は **ビルド時に `VITE_FEEDBACK_*` 経由で埋め込まれる** (GitHub Actions Secrets → vite env)。

## 監視

- **日次**: Slack `#feedback` の未読を確認。サービスはサイドバー色 (青📅 Booking / 緑📝 SOAN / 橙✍️ Tsuzuri) と context 行の `service: <id>` タグで識別。対応必要なら Spreadsheet `notes` 列に記録
- **週次**: Spreadsheet を眺めて以下を確認
  - 同一 `ip_hash` からの高頻度投稿 (スパム兆候)
  - `slack_status` 列に `error: ...` が多発していないか (Slack 側障害の兆候)
- **異常通知**: GAS で想定外例外が出ると Apps Script 管理者宛にエラー通知メールが届く (`appsscript.json` の `exceptionLogging: STACKDRIVER` 設定による)

## Slack Webhook URL ローテーション

漏洩懸念・定期更新の手順:

1. Slack ワークスペース管理画面で `#feedback` の Incoming Webhook を Revoke
2. 同じ `#feedback` チャンネルに新しい Incoming Webhook を発行 → URL を取得
3. Apps Script UI の **⚙ プロジェクト設定 > スクリプト プロパティ** で `SLACK_WEBHOOK_URL` を新しい URL に更新
4. **再デプロイ不要** (Script Properties は実行時参照)

## Shared Token ローテーション

GAS Web App URL は変えずに Shared Token のみ更新する場合:

1. `openssl rand -hex 16` で新 token を生成
2. Apps Script UI の Script Properties で `SHARED_TOKEN` を更新
3. GitHub の Settings > Secrets and variables > Actions で `FEEDBACK_SHARED_TOKEN` を更新
4. main に任意の小変更 (空コミットでも可) を push → GitHub Actions が再ビルドし、新 token をクライアント JS に埋め込み
5. 旧 token を使った POST は GAS で `{ok:false, error:"forbidden"}` を返すようになり、無効化される

## GAS Web App 自体の URL を変えたい場合

(より深刻な漏洩・実装大幅変更時)

1. Apps Script UI で「デプロイ管理 > 既存デプロイをアーカイブ」
2. 「新しいデプロイ」で再デプロイ → 新 URL 取得
3. GitHub Secrets `FEEDBACK_GAS_URL` を更新
4. main に push して再ビルド

## サービス追加手順

例: 新サービス `newsvc` を追加する場合 (共通 `#feedback` チャンネルに集約されるため Slack 側の追加作業は不要)

1. Spreadsheet `Rittoku Feedback Log` にタブ `newsvc` を追加、1 行目に既存タブと同じヘッダ (`timestamp` / `service` / `message` / `userAgent` / `ip_hash` / `slack_status` / `notes`) をコピー
2. `gas/feedback/config.gs`:
   - `ALLOWED_SERVICES` に `'newsvc'` を追加
   - `SERVICE_META` に `newsvc: { emoji: '🆕', label: 'New Service', color: '#XXXXXX' }` を追加 (色は既存 3 サービスと十分異なるものを選ぶ)
3. Apps Script UI の `config.gs` にも同じ変更を貼り付け
4. `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` の `ServiceId` 型に `| 'newsvc'` を追加
5. `docs/services/newsvc.md` の末尾に以下を埋め込む:

   ```markdown
   ## フィードバック

   不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

   <ServiceFeedbackForm service="newsvc" />
   ```

6. ローカル `yarn docs:dev` で疎通確認 (`#feedback` に新サービスの色 + 絵文字 + service タグで通知が届くこと)
7. コミット & push

## スパム流入時の対応

`slack_status` ログや Spreadsheet で異常な大量投稿を発見した場合:

1. **短期 (即時停止)**: Apps Script UI の「デプロイ管理」で該当デプロイをアーカイブ。クライアントから POST しても 404/エラーになり、Spreadsheet / Slack への流入が止まる
2. **中期 (緩和)**: 設計 spec § 8 で YAGNI 判断していた **Cloudflare Turnstile (無料 CAPTCHA)** を導入する別 plan を起こす:
   - `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` に Turnstile widget を追加
   - GAS 側で `cf-turnstile-response` トークンを検証
3. **応急**: Apps Script の Script Properties に一時的なブロック設定 (例: `BLOCK_MESSAGE_PATTERN`) を入れ、GAS の `doPost` で正規表現マッチした投稿を破棄

## ローカル開発

新規参加メンバー向け:

1. `docs/.env.local.example` を `docs/.env.local` にコピー
2. 中身を編集して `VITE_FEEDBACK_GAS_URL` と `VITE_FEEDBACK_SHARED_TOKEN` に本番と同じ値を入れる (現状はステージング環境を分けていない)
3. `yarn docs:dev` で `http://localhost:5173/services/booking` を開く → フォーム送信
4. Spreadsheet のテスト行は適宜削除

> 本番と開発が同じ GAS / Spreadsheet を共有しているため、テスト送信は **必ず `[TEST]` プレフィックス** を付けるなど運用ルールで吸収。将来分離するなら別 GAS デプロイ + 別 Spreadsheet を用意し env を切り替える。

## デバッグ tips

- **フォームから「送信先が未設定」と出る**: `docs/.env.local` が存在しないか中身が空。`VITE_FEEDBACK_GAS_URL` / `VITE_FEEDBACK_SHARED_TOKEN` が `VITE_` プレフィックス付きで設定されているか確認、dev server を再起動
- **送信に失敗します エラー**: ブラウザ devtools の Network タブで `/exec?t=...` のレスポンスを確認。`{ok:false, error:"forbidden"}` なら token mismatch、`invalid_payload` なら本文長やサービス名を確認
- **Slack に通知が来ないが Spreadsheet には行追加されている**: Spreadsheet の該当行 `slack_status` 列を確認。`error: 410` などなら Webhook URL が無効、`error: no_webhook` なら Script Properties 未設定
- **本番だけ動かない**: GitHub Actions の Secrets が登録されているか、`deploy.yml` の `env:` ブロックが該当ステップに付いているか確認

## 関連リンク

- Spreadsheet: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit` (ID は Apps Script Script Properties 参照)
- GAS プロジェクト: Spreadsheet 内「拡張機能 > Apps Script」
- GitHub Secrets: リポジトリ Settings > Secrets and variables > Actions
- 設計: `plans/2026-05-22-service-feedback-slack-design.md`
- 実装計画: `plans/2026-05-22-service-feedback-slack-impl.md`
- Slack Block Kit: https://api.slack.com/block-kit
- Cloudflare Turnstile (将来の CAPTCHA 追加候補): https://developers.cloudflare.com/turnstile/
