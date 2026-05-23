# 各サービスページからの Slack 直通フィードバック窓口 — 設計

> 作成日: 2026-05-22
> ステータス: 設計レビュー待ち
> 対象: `docs/services/booking.md`, `docs/services/soan.md`, `docs/services/tsuzuri.md`

## 1. 背景と目的

各サービスページの「フィードバック」セクションは現在、共通の `/contact` ページ (Google Form 経由) へ誘導している。「気になった瞬間に投稿できる軽さ」と「運営側のリアルタイム認知」が両立しないため、サービスページ専用の窓口を設け、**送信内容を Slack へ直通**かつ **Google Spreadsheet に履歴を記録** する仕組みを設計する。

`/contact` ページ (一般企業問い合わせ用) は対象外。現状のままとする。

## 2. 要件サマリ

| 区分 | 内容 |
| --- | --- |
| 対象ページ | `services/booking.md` / `services/soan.md` / `services/tsuzuri.md` の 3 ページ末尾 |
| 入力項目 | 本文 (textarea) のみ。連絡先は取らない |
| 送信先 | 共通 Slack チャンネル `#feedback` (サービスはメッセージ本文のヘッダ絵文字 + ラベルで識別) + 共通 Spreadsheet (タブ分け) |
| スパム対策 | Honeypot + Shared Token + 本文長制限 (CAPTCHA なし) |
| インフラ | Google Apps Script (GAS) Web App をプロキシ。新規アカウント不要 |
| UX | ページ末尾インラインセクション。送信後はメッセージ差し替えで完結 |
| 公開反映 | 既存 GitHub Actions ワークフロー (`deploy.yml`) で main → GitHub Pages |

## 3. アーキテクチャ概要

```
┌────────────────────┐      POST JSON       ┌──────────────────────┐
│ rittoku.llc        │  ──────────────────► │ GAS Web App          │
│ /services/<name>   │   text/plain         │ doPost(e)            │
│                    │                       │                      │
│ <Feedback form>    │  ◄──── JSON resp ──── │ 1. Honeypot 検証     │
│ <textarea>         │   {ok|error}          │ 2. Token 検証         │
│ <button>           │                       │ 3. Sheet 追記        │
└────────────────────┘                       │ 4. Slack Webhook 転送 │
                                              └──────┬───────────────┘
                                                     │
                                  ┌──────────────────┼──────────────────┐
                                  ▼                                     ▼
                         ┌──────────────────┐                ┌──────────────────┐
                         │ Google Spreadsheet│                │ Slack            │
                         │ Rittoku Feedback  │                │ #feedback        │
                         │ 1 タブ / 1 サービス│                │ (全サービス共通) │
                         └──────────────────┘                └──────────────────┘
```

### 主要設計判断

- **GAS Web App は 1 つ**。サービス名は POST body の `service` フィールドで分岐
- **Slack チャンネルは `#feedback` 1 本に集約**。サービスごとの識別はメッセージ本文 (ヘッダ絵文字 + ラベル + コンテキスト行) で行う
- **シークレット (Webhook URL / Spreadsheet ID / Shared Token) は GAS Script Properties に保存**、コードリポジトリには載せない
- **クライアントに露出する値は 2 つ** (GAS Web App URL, Shared Token)。GitHub Actions Secrets → VitePress 環境変数として注入。Shared Token は「軽い識別子」であり完全な秘密ではない
- **Spreadsheet 書き込みを 1 次受けに、Slack 通知は副次的扱い**。Slack が落ちても投稿は保存される

## 4. クライアント UI

### 配置

各サービスページの末尾の「フィードバック」セクション (booking.md には新規追加) を以下に置き換える:

```markdown
## フィードバック

<ServiceFeedbackForm service="tsuzuri" />
```

### コンポーネント

`docs/.vitepress/theme/components/ServiceFeedbackForm.vue` を新設。VitePress カスタムテーマ経由で各ページから利用できるよう `enhanceApp` で global 登録する。

**props**:

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `service` | `'booking' \| 'soan' \| 'tsuzuri'` | 送信ペイロードに含めるサービス識別子 |

**内部状態**:

| 状態 | 表示 |
| --- | --- |
| `idle` | textarea (placeholder「不具合のご報告・ご要望などお寄せください」) + 「送信する」ボタン + 注意書き |
| `submitting` | ボタン無効化、「送信中…」 |
| `success` | textarea 領域を「お送りいただきありがとうございました。」に差し替え |
| `error` | フォーム維持 + エラーメッセージ + 再送ボタン |

**フォーム要素**:

- 本文 `<textarea required maxlength="2000">`
- Honeypot `<input name="website" type="text" tabindex="-1" autocomplete="off">` を `position:absolute; left:-9999px; opacity:0` で視覚的に隠す
- 「送信内容と送信日時、サービス名がスタッフに共有されます」「個別返信はできません。返信が必要なご相談は [お問い合わせ](/contact) をご利用ください」の 2 行を小さく表示

**スタイル**: VitePress 既存テーマ変数 (`var(--vp-c-brand)` / `var(--vp-c-divider)` / `var(--vp-c-text-2)`) を踏襲し、現行コンタクトフォームと統一感を保つ。

### 送信ロジック

```ts
const submit = async () => {
  if (!message.value.trim()) { state = 'error'; return; }
  state = 'submitting';
  try {
    const url = `${import.meta.env.VITE_FEEDBACK_GAS_URL}?t=${import.meta.env.VITE_FEEDBACK_SHARED_TOKEN}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        service: props.service,
        message: message.value,
        website: honeypot.value,
        submittedAt: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    state = data.ok ? 'success' : 'error';
  } catch {
    state = 'error';
  }
};
```

> `text/plain` で送る理由: GAS Web App は CORS プリフライト (OPTIONS) を返さないため、`application/json` だとブラウザにブロックされる。`text/plain` はシンプルリクエストとして扱われ、ボディは JSON として GAS 側で `JSON.parse` する標準パターン。

## 5. GAS Web App コントラクト

### Request

```http
POST <GAS_WEB_APP_URL>?t=<SHARED_TOKEN>
Content-Type: text/plain;charset=utf-8

{
  "service": "tsuzuri",
  "message": "Markdown プレビューでテーブルが崩れます",
  "website": "",
  "submittedAt": "2026-05-22T01:23:45.000Z"
}
```

### Response

```json
{ "ok": true }
```

または

```json
{ "ok": false, "error": "invalid_payload" | "forbidden" | "internal" }
```

> `honeypot` 発火時はクライアントから見ると **成功 (`{ok: true}`)** を返す。ボットに「失敗した」と気付かせない。

### GAS 側フロー (`doPost(e)`)

1. **Token 検証**: `e.parameter.t === Properties.get('SHARED_TOKEN')` でなければ `{ok:false, error:"forbidden"}`
2. **Body パース**: `JSON.parse(e.postData.contents)`、失敗時 `invalid_payload`
3. **必須項目チェック**: `service ∈ {booking, soan, tsuzuri}`、`message.trim().length > 0`、`message.length ≤ 2000`
4. **Honeypot**: `website` が空でなければ即 `{ok:true}` を返す (ログも残さない)
5. **Spreadsheet 追記**: 該当タブに `[timestamp, service, message, userAgent, ip_hash, 'pending', '']` を append し、`sheet.getLastRow()` で行番号を控える
6. **Slack 転送**: 該当 Webhook URL に Block Kit JSON を POST
7. **`slack_status` 列を更新**: 成功なら `'ok'`、失敗なら `'error: <httpCode>'`。`sheet.getRange(lastRow, 6).setValue(...)`
8. **クライアント応答**: Spreadsheet 書き込みが成功していれば `{ok:true}`、Spreadsheet 自体が失敗していれば `{ok:false, error:'internal'}`
9. **戻り値**: `ContentService.createTextOutput(JSON.stringify(...)).setMimeType(ContentService.MimeType.JSON)`

### Script Properties

| キー | 値 |
| --- | --- |
| `SHARED_TOKEN` | クライアント・サーバ照合用ランダム 32 字 |
| `SPREADSHEET_ID` | 記録先 Spreadsheet ID |
| `SLACK_WEBHOOK_URL` | `#feedback` チャンネル用 Incoming Webhook URL (1 件のみ) |

## 6. Spreadsheet 構造

**1 ワークブック + サービスごとに 1 タブ**:

```
[Spreadsheet] Rittoku Feedback Log
├── tab: booking
├── tab: soan
└── tab: tsuzuri
```

**カラム (各タブ共通)**:

| 列 | 名前 | 内容 |
| --- | --- | --- |
| A | `timestamp` | GAS 側 `new Date()` のサーバ時刻 |
| B | `service` | `booking` / `soan` / `tsuzuri` |
| C | `message` | 本文 (改行含む、最大 2000 字) |
| D | `userAgent` | リクエスト User-Agent (デバッグ目的) |
| E | `ip_hash` | 送信者 IP の SHA-256 ハッシュ (個人情報は残さず重複検知のヒント) |
| F | `slack_status` | Slack 転送結果 (`ok` / `error: <reason>`) |
| G | `notes` | 運用者が後から記入 (対応済 / 重複 など) |

**運用上の利点**:

- スプレッドシートで時系列確認・対応状況管理
- Slack ワークスペース外関係者にも個別共有可
- Slack 障害時のバックアップ

## 7. Slack メッセージフォーマット

`#feedback` チャンネルにすべてのサービス通知が集約されるため、**メッセージだけ見れば送信元サービスが即座に判別できる** ことを最優先で設計する。

Block Kit を `attachments` でラップしサービスごとの **左サイドバー色** を付与 (Slack で目立つ色帯)。ヘッダ絵文字 + ラベル + コンテキスト行の `[service: <id>]` タグの 3 重で識別性を担保。

**Payload 例 (SOAN)**:

```json
{
  "attachments": [
    {
      "color": "#2EB67D",
      "blocks": [
        {
          "type": "header",
          "text": { "type": "plain_text", "text": "📝 SOAN への新しいフィードバック" }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "> Markdown プレビューでテーブルが崩れます\n> モバイル Safari でテストしました"
          }
        },
        {
          "type": "context",
          "elements": [
            { "type": "mrkdwn", "text": "🏷 `service: soan`" },
            { "type": "mrkdwn", "text": "🕒 2026-05-22 10:23 JST" },
            { "type": "mrkdwn", "text": "🌐 from `rittoku.llc/services/soan`" },
            { "type": "mrkdwn", "text": "📊 <https://docs.google.com/spreadsheets/d/.../edit|Spreadsheet で見る>" }
          ]
        }
      ]
    }
  ]
}
```

### サービスごとの識別子

| サービス | 絵文字 | ヘッダラベル | サイドバー色 |
| --- | --- | --- | --- |
| booking | 📅 | `Calendar & Booking` | `#1D9BD1` (青) |
| soan | 📝 | `SOAN` | `#2EB67D` (緑) |
| tsuzuri | ✍️ | `Tsuzuri` | `#E8912D` (橙) |

### 設計判断

- **`attachments[].color` (左サイドバー色)** で一覧スクロール時の視認性を高める。Block Kit 単独より目を引く
- **context block 先頭に `[service: <id>]` タグ** を置き、Slack の検索 (`service: soan` で絞り込み) を可能にする
- 本文は引用ブロック (`>`) でユーザー文を視覚的に分離
- `@here` `@channel` などのメンションは付けない (チャンネル通知は Slack 側設定に任せる)
- 時刻は JST 固定で人間が読みやすい形式に整形
- Spreadsheet リンクはメッセージ本文には埋め込まず context block に置き、視認性を落とす

## 8. スパム対策

ユーザー要望に従い **Honeypot + Shared Token + 本文長制限** の 3 段。CAPTCHA は導入しない。

| 対策 | 実装場所 | 効果 |
| --- | --- | --- |
| Honeypot | フォーム + GAS | 機械ボットを `{ok:true}` で吸収。ログ汚染なし |
| Shared Token | クエリ + Script Property | 誤 POST / URL を直接叩くナイーブな攻撃を遮断 |
| 本文長制限 | クライアント `maxlength` + GAS バリデーション | 過大ペイロードによる帯域消費を抑制 |

**運用ルール (`handover/service-feedback-operations.md` に記載)**:

- 週 1 で Spreadsheet を眺めて異常な大量投稿を検知
- スパム流入が発生したら Cloudflare Turnstile 等の CAPTCHA 追加を別 plan で検討
- Webhook URL 漏洩時は Slack 側でローテーション → Script Properties 更新 (デプロイ不要)

## 9. 設定・デプロイフロー

### Step 1: Slack 準備

- 共通チャンネル `#feedback` を作成 (既にある場合は流用)
- 当該チャンネルに Incoming Webhook を **1 つ** 設定し URL を控える

### Step 2: Spreadsheet 準備

- 新規 Spreadsheet `Rittoku Feedback Log` 作成
- タブ作成 + ヘッダ行記入 (`timestamp` / `service` / `message` / `userAgent` / `ip_hash` / `slack_status` / `notes`)
- Spreadsheet ID を控える

### Step 3: GAS プロジェクト

- Spreadsheet の「拡張機能 > Apps Script」から GAS プロジェクトを開く (Spreadsheet バウンド方式)
- ファイル:
  - `Code.gs` — `doPost(e)` メイン
  - `config.gs` — Script Properties ラップ
  - `slack.gs` — Slack 転送
  - `tests.gs` — 自助テスト
  - `appsscript.json` — マニフェスト (timeZone: `Asia/Tokyo` / oauthScopes)
- Script Properties に 3 件登録 (UI から手動)
- 「デプロイ > 新しいデプロイ > ウェブアプリ」: 実行 = 自分、アクセス = 全員 (匿名)
- デプロイ URL を控える

### Step 4: VitePress 環境変数

- ローカル `.env.local` (gitignore 済) に:
  ```
  VITE_FEEDBACK_GAS_URL=https://script.google.com/macros/s/.../exec
  VITE_FEEDBACK_SHARED_TOKEN=xxxx
  ```
- GitHub Actions の Repository Secrets に同じ 2 つを `FEEDBACK_GAS_URL` / `FEEDBACK_SHARED_TOKEN` で登録

### Step 5: GitHub Actions ワークフロー修正

`.github/workflows/deploy.yml` の `yarn docs:build` ステップに環境変数を追加:

```yaml
- run: yarn docs:build
  env:
    VITE_FEEDBACK_GAS_URL: ${{ secrets.FEEDBACK_GAS_URL }}
    VITE_FEEDBACK_SHARED_TOKEN: ${{ secrets.FEEDBACK_SHARED_TOKEN }}
```

### Step 6: 動作確認

- `yarn docs:dev` で 3 ページのフォーム送信 → Slack 通知 + Spreadsheet 行追加を目視
- GAS URL を意図的に壊して送信 → エラー UX を確認
- 本番デプロイ後、各サービスページから 1 件ずつ送信し疎通確認

### Step 7: 引継ぎドキュメント整備

`handover/service-feedback-operations.md` を新規作成し、運用担当向けに以下を記載:

- Spreadsheet の見方と運用ルール
- Webhook URL ローテーション手順
- サービス追加時の手順 (タブ追加 / Script Property 追加 / クライアント `service` 追加)
- スパム流入時の対応フロー (Turnstile 追加検討)

## 10. テスト

### 自動テスト

- **GAS 側**: `tests.gs` に `runTests()` を置き、Apps Script エディタから手動実行。ケース:
  - `parsePayload_valid` / `parsePayload_invalid_json` / `parsePayload_missing_fields`
  - `honeypot_triggered`
  - `unknown_service`
  - `token_mismatch`
- `dryRun: true` 分岐で Slack 送信と Spreadsheet 書き込みをスキップ可能にする
- **クライアント側**: 現行 `contact.md` と同じく単体テストは導入しない (薄いコンポーネントのため)

### 手動 QA チェックリスト

- [ ] 3 サービスそれぞれから送信 → 該当チャンネル通知 + 該当タブ記録
- [ ] 空送信 → クライアントでブロック
- [ ] 2001 字以上の貼り付け → 送信ボタン無効
- [ ] Honeypot に値を入れて送信 → 成功表示だが Slack / Spreadsheet とも何も起きない
- [ ] GAS URL を不正な値に変更 → エラー UX 表示、再送可能
- [ ] ネットワーク切断 → 同上
- [ ] 不正な Shared Token で送信 → 403 系エラー UX
- [ ] モバイル Safari / iOS Chrome / Android Chrome での表示崩れ確認
- [ ] ダーク/ライトモード切替で破綻しない

## 11. エラーハンドリング

| 失敗箇所 | ユーザー表示 | ログ / 副作用 |
| --- | --- | --- |
| クライアント側バリデーション失敗 | フォーム内インラインエラー | なし |
| GAS URL に到達不可 | 「送信に失敗しました。再度お試しいただくか、お問い合わせフォームをご利用ください」 + `/contact` リンク | ブラウザ console |
| GAS から `{ok:false}` 応答 | 同上 | GAS 実行ログ + 書き込みなし |
| Spreadsheet 書き込み成功 / Slack 失敗 | 成功表示 | Spreadsheet `slack_status` 列に `error: ...` |
| Spreadsheet 書き込み失敗 | エラー UX | GAS Stackdriver |
| 想定外例外 | 成功表示 + 管理者宛 GAS エラー通知メール | GAS Stackdriver |

**設計思想**: 「投稿が成功したか不明」な状態をユーザーに見せない。Spreadsheet が落ちている場合のみ失敗 UX。Slack 単独失敗は Spreadsheet で吸収済として成功扱い。

## 12. エッジケース (記録のみ、対応不要)

- 二重送信 → 重複行を許容、運用で吸収
- サービス追加 / 削除 → 別 PR で許可リストとタブを同時更新
- Webhook URL 漏洩 → Slack 側ローテーション → Script Properties 更新 (再デプロイ不要)
- Spreadsheet 権限事故 → ユーザーに失敗 UX、管理者にメール通知

## 13. 影響範囲と段階リリース

### 影響ファイル (実装フェーズで触れる予定)

| ファイル | 内容 |
| --- | --- |
| `docs/.vitepress/theme/index.ts` *(新規)* | カスタムテーマエントリ、コンポーネント登録 |
| `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` *(新規)* | フォーム本体 |
| `docs/services/booking.md` *(編集)* | フィードバックセクション追加 |
| `docs/services/soan.md` *(編集)* | フィードバックセクション差し替え |
| `docs/services/tsuzuri.md` *(編集)* | フィードバックセクション差し替え (現状は `/contact` 誘導) |
| `.github/workflows/deploy.yml` *(編集)* | ビルド時環境変数注入 |
| `.env.local.example` *(新規)* | 開発者向け環境変数テンプレート |
| `handover/service-feedback-operations.md` *(新規)* | 運用引継ぎ |
| GAS プロジェクト *(リポジトリ外)* | `Code.gs` / `config.gs` / `slack.gs` / `tests.gs` / `appsscript.json` |

### リリース順序

1. GAS プロジェクト構築 + Spreadsheet 準備 + Slack Webhook 取得 (リポジトリ外作業)
2. VitePress 側コンポーネント + ページ編集 + ワークフロー修正 を 1 PR で main へ
3. main へマージ → GitHub Actions が自動デプロイ
4. 各サービスページから疎通確認 1 件ずつ送信

## 14. 開かれた論点 (実装着手前に確認したい点)

特になし。実装計画フェーズで具体的なステップ分解と検証手順を定める。

## 15. 参考リンク

- GAS Web Apps: https://developers.google.com/apps-script/guides/web
- Slack Block Kit: https://api.slack.com/block-kit
- Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
- Cloudflare Turnstile (将来の CAPTCHA 候補): https://developers.cloudflare.com/turnstile/
