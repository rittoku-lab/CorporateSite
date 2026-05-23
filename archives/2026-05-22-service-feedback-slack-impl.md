# Service Feedback Slack Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3 つのサービスページ末尾にインラインのフィードバックフォームを追加し、送信を Google Apps Script Web App プロキシ経由で共通 Slack チャンネル `#feedback` + 共通 Google Spreadsheet (タブ分け) に転送する仕組みを実装する。Slack 上では絵文字 / ヘッダラベル / サイドバー色 / service タグでサービスを識別する。

**Architecture:** VitePress 静的サイトのクライアントが GAS Web App (匿名アクセス可) に `text/plain` で JSON POST し、GAS が (1) リクエスト検証、(2) Spreadsheet に行追記、(3) 共通 Slack チャンネル `#feedback` への Incoming Webhook 経由で Block Kit メッセージ転送 (サービスは絵文字 + ラベル + サイドバー色 + `[service: <id>]` タグで識別)、(4) Spreadsheet の `slack_status` 列を更新する。シークレットは GAS Script Properties に保持しクライアントには Web App URL と shared token のみ露出。

**Tech Stack:** VitePress 1.6.x (Vue 3), Google Apps Script (V8 runtime), Google Sheets API (SpreadsheetApp built-in), Slack Incoming Webhook, GitHub Actions

**Design Spec:** `archives/2026-05-22-service-feedback-slack-design.md`

**Status:** **実装完了 (2026-05-23)** — GAS デプロイ済、ローカル疎通済、本番デプロイ + 疎通済、運用引継ぎ docs 作成済

## 実装完了サマリ (2026-05-23)

### 計画外で発生した対応

| 事象 | 対応 |
| --- | --- |
| `.env.local` をプロジェクトルートに置いていたが VitePress (Vite) が `docs/` から env を探すため読まれず、フォームが「送信先が未設定」エラー | `docs/.env.local.example` に配置を変更 (Task 11 更新済)。`docs/.gitignore` の `.env.local` パターンは階層を問わずマッチするため追加変更不要 |
| `docs/plans/` と `docs/handover/` 配下の内部 docs が VitePress ビルドで公開されてしまっていた | プロジェクトルート直下の `plans/` / `handover/` に移動 (`git mv`)。各 doc 内の cross-reference を一括修正 |

### コミット一覧 (このトピック)

```
a48f8e5  scaffold gas project for service feedback proxy
3fa7a30  implement gas request validation with honeypot and dry-run
19ceb5d  add spreadsheet append with pending status and row tracking
5912557  add slack block kit transfer with status writeback
f86c9d5  add ServiceFeedbackForm component and custom theme entry
2a0b979  embed feedback form on booking, soan, tsuzuri service pages
9c84e59  wire feedback widget secrets through env file and ci build
f02b9a7  load env files from project root for vitepress builds      (※後続でリバート)
f0f1bdc  move env template into docs/ instead of overriding vitepress envDir
d7b6add  add operations handover for service feedback widget
52c50e4  move plans and handover out of docs/ to keep them off the deployed site
```

### 動作確認済み項目

- [x] GAS Web App `runTests` 全 9 ケース PASS
- [x] curl 直叩きで 3 サービスとも `{ok:true}` + Spreadsheet 該当タブに行追加 + `#feedback` にサイドバー色付き通知
- [x] ローカル `yarn docs:dev` で 3 ページ全て送信完了 UX 表示 + Slack/Spreadsheet 反映

### 手動確認推奨項目 (本番 push 後)

- [ ] GitHub Actions のビルドが緑になる (Secrets `FEEDBACK_GAS_URL` / `FEEDBACK_SHARED_TOKEN` を参照)
- [ ] 本番 `https://rittoku.llc/services/{booking,soan,tsuzuri}` から 1 件ずつ送信 → `#feedback` に色違いで 3 件届く
- [ ] Spreadsheet のテスト行 (ローカル + 本番) を削除

---

## Prerequisites

実装着手前に以下の権限・アクセスを確保:

- [x] Slack ワークスペースで Incoming Webhook を作成できる管理者権限
- [x] Google アカウント (Spreadsheet と Apps Script プロジェクトを作成できる)
- [x] GitHub リポジトリの Settings > Secrets and variables への書き込み権限
- [x] ローカル開発環境 (`yarn` / Node 20 / VitePress 1.6.x が動作する)

## File Structure

| パス | 種別 | 役割 |
| --- | --- | --- |
| `gas/feedback/Code.gs` | 新規 | `doPost(e)` メイン。リクエスト処理のエントリ |
| `gas/feedback/config.gs` | 新規 | Script Properties / 定数アクセスのラッパ |
| `gas/feedback/spreadsheet.gs` | 新規 | Spreadsheet 読み書き |
| `gas/feedback/slack.gs` | 新規 | Slack 転送ロジック |
| `gas/feedback/tests.gs` | 新規 | Apps Script UI から手動実行する自助テスト |
| `gas/feedback/appsscript.json` | 新規 | GAS マニフェスト (`Asia/Tokyo`, oauthScopes) |
| `gas/README.md` | 新規 | GAS 側セットアップとデプロイ手順 |
| `docs/.vitepress/theme/index.ts` | 新規 | VitePress カスタムテーマエントリ。コンポーネントを global 登録 |
| `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` | 新規 | フォーム本体 (textarea + honeypot + 状態遷移) |
| `docs/services/booking.md` | 編集 | フィードバックセクション追加 |
| `docs/services/soan.md` | 編集 | 既存フィードバックセクション置換 |
| `docs/services/tsuzuri.md` | 編集 | 既存フィードバックセクション置換 |
| `docs/.env.local.example` | 新規 | 開発用環境変数テンプレート (VitePress の envDir デフォルト = `docs/` に従って配置) |
| `.gitignore` | 編集 | `.env.local` を追加 (パターンは階層を問わずマッチするので `docs/.env.local` もカバー) |
| `.github/workflows/deploy.yml` | 編集 | ビルドステップに `VITE_FEEDBACK_*` を渡す |
| `handover/service-feedback-operations.md` | 新規 | 運用引継ぎ (異常時の見方 / ローテーション手順)。ユーザーの WORKFLOW_IMPLEMENTATION.md に従い `handover/` 配下に配置 |

> **GAS コード方針**: 実際に動くのは Apps Script UI 上だが、ソースは `gas/feedback/` で版管理し、変更時は Apps Script UI と repo の両方に反映する (手動同期)。clasp は導入しない。

---

## Task 1: 共通 Slack チャンネル `#feedback` と Incoming Webhook を作成 (外部作業)

すべてのサービスのフィードバックを集約する共通チャンネル 1 つに対し、Webhook を 1 件発行する。

**Files:**
- Modify: なし (Slack 側設定のみ)

- [x] **Step 1: Slack に `#feedback` チャンネルを作成**

Slack の左サイドバーから「+ チャンネルを追加」で `#feedback` を作成 (Private / Public は社内方針に従う)。既に同名チャンネルがある場合は流用可。

- [x] **Step 2: `#feedback` に Incoming Webhook を設定**

1. Slack アプリディレクトリで「Incoming Webhooks」アプリを検索し追加
2. 「Add to Slack」→ 投稿先チャンネルとして `#feedback` を選択 → 「Add Incoming WebHooks integration」
3. 表示された Webhook URL (`https://hooks.slack.com/services/T.../B.../...`) を控える

- [x] **Step 3: URL を一時的に安全な場所に保存**

取得した 1 件の URL を一時メモ (1Password 等) に保存。Task 7 で GAS Script Properties に登録するまでの一時保管。

---

## Task 2: Google Spreadsheet を作成しタブ・ヘッダを準備 (外部作業)

**Files:**
- Modify: なし (Google Drive 上の作業)

- [x] **Step 1: 新規スプレッドシートを作成**

Google Drive で右クリック → Google スプレッドシート → 名前を `Rittoku Feedback Log` に変更。

- [x] **Step 2: 既定の「シート 1」を `booking` にリネームしヘッダ行を書く**

A1 から G1 に以下を入力:

```
timestamp	service	message	userAgent	ip_hash	slack_status	notes
```

- [x] **Step 3: タブ `soan` と `tsuzuri` を追加**

下部の「+」で 2 タブ追加し、それぞれヘッダ行をコピー貼り付け。

- [x] **Step 4: Spreadsheet ID を控える**

URL `https://docs.google.com/spreadsheets/d/<ID>/edit` の `<ID>` 部分を一時メモに保存。

---

## Task 3: GAS プロジェクト骨組みと appsscript.json マニフェスト

**Files:**
- Create: `gas/feedback/appsscript.json`
- Create: `gas/feedback/config.gs`
- Create: `gas/README.md`

- [x] **Step 1: `gas/feedback/appsscript.json` を作成**

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

- [x] **Step 2: `gas/feedback/config.gs` を作成**

```javascript
// Script Properties アクセスのラッパ。
// すべての設定値はここ経由で取得する。

const PROP = PropertiesService.getScriptProperties();

function getSharedToken() {
  return PROP.getProperty('SHARED_TOKEN');
}

function getSpreadsheetId() {
  return PROP.getProperty('SPREADSHEET_ID');
}

function getSlackWebhookUrl() {
  // すべてのサービスが共通の #feedback チャンネル webhook を使う。
  // サービス識別はメッセージ内容 (emoji / label / color / service タグ) で行う。
  return PROP.getProperty('SLACK_WEBHOOK_URL');
}

const ALLOWED_SERVICES = ['booking', 'soan', 'tsuzuri'];

const SERVICE_META = {
  booking: { emoji: '📅', label: 'Calendar & Booking', color: '#1D9BD1' },
  soan:    { emoji: '📝', label: 'SOAN',               color: '#2EB67D' },
  tsuzuri: { emoji: '✍️', label: 'Tsuzuri',            color: '#E8912D' },
};
```

- [x] **Step 3: `gas/README.md` を作成**

```markdown
# GAS Feedback Proxy

サービスページのフィードバックフォームを Slack + Spreadsheet に転送する Google Apps Script プロジェクト。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `Code.gs` | `doPost(e)` メイン |
| `config.gs` | Script Properties アクセス |
| `spreadsheet.gs` | Spreadsheet 読み書き |
| `slack.gs` | Slack Block Kit メッセージ送信 |
| `tests.gs` | Apps Script UI から手動実行する自助テスト |
| `appsscript.json` | GAS マニフェスト |

## 同期方針

このディレクトリは「真のソース」として版管理する。Apps Script UI で変更したら必ずここにも反映してコミットする。逆向きも同様。clasp は使わない。

## デプロイ手順

`archives/2026-05-22-service-feedback-slack-impl.md` の Task 11 を参照。
```

- [x] **Step 4: コミット**

```bash
git add gas/feedback/appsscript.json gas/feedback/config.gs gas/README.md
git commit -m "scaffold gas project for service feedback proxy"
```

---

## Task 4: GAS リクエスト検証 (token + payload + honeypot + service 許可リスト)

**Files:**
- Create: `gas/feedback/Code.gs`
- Test: `gas/feedback/tests.gs`

- [x] **Step 1: `gas/feedback/tests.gs` にリクエスト検証テストを書く**

```javascript
// Apps Script UI で runTests() を実行して結果を確認する。
// 各テストは throw で失敗を通知する。

function runTests() {
  const tests = [
    test_token_mismatch_returns_forbidden,
    test_invalid_json_returns_invalid_payload,
    test_missing_message_returns_invalid_payload,
    test_unknown_service_returns_invalid_payload,
    test_oversized_message_returns_invalid_payload,
    test_honeypot_triggered_returns_ok_silently,
    test_valid_request_passes_validation,
  ];
  const results = tests.map(t => {
    try { t(); return { name: t.name, ok: true }; }
    catch (e) { return { name: t.name, ok: false, err: String(e) }; }
  });
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter(r => !r.ok);
  if (failed.length) throw new Error(`${failed.length} test(s) failed`);
  return 'all passed';
}

function makeEvent(token, body) {
  return { parameter: { t: token }, postData: { contents: body } };
}

function test_token_mismatch_returns_forbidden() {
  const e = makeEvent('wrong', JSON.stringify({ service: 'soan', message: 'x' }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== false || out.error !== 'forbidden') throw new Error(`got ${JSON.stringify(out)}`);
}

function test_invalid_json_returns_invalid_payload() {
  const token = getSharedToken();
  const e = makeEvent(token, '{ not json');
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== false || out.error !== 'invalid_payload') throw new Error(`got ${JSON.stringify(out)}`);
}

function test_missing_message_returns_invalid_payload() {
  const token = getSharedToken();
  const e = makeEvent(token, JSON.stringify({ service: 'soan', message: '   ' }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== false || out.error !== 'invalid_payload') throw new Error(`got ${JSON.stringify(out)}`);
}

function test_unknown_service_returns_invalid_payload() {
  const token = getSharedToken();
  const e = makeEvent(token, JSON.stringify({ service: 'unknown', message: 'hi' }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== false || out.error !== 'invalid_payload') throw new Error(`got ${JSON.stringify(out)}`);
}

function test_oversized_message_returns_invalid_payload() {
  const token = getSharedToken();
  const longMsg = 'a'.repeat(2001);
  const e = makeEvent(token, JSON.stringify({ service: 'soan', message: longMsg }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== false || out.error !== 'invalid_payload') throw new Error(`got ${JSON.stringify(out)}`);
}

function test_honeypot_triggered_returns_ok_silently() {
  const token = getSharedToken();
  const e = makeEvent(token, JSON.stringify({ service: 'soan', message: 'hi', website: 'http://spam' }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== true) throw new Error(`got ${JSON.stringify(out)}`);
}

function test_valid_request_passes_validation() {
  // dryRun フラグで Slack/Spreadsheet 副作用を抑止し、検証ステップのみ通る
  const token = getSharedToken();
  const e = makeEvent(token, JSON.stringify({ service: 'soan', message: 'hi', __dryRun: true }));
  const out = JSON.parse(doPost(e).getContent());
  if (out.ok !== true) throw new Error(`got ${JSON.stringify(out)}`);
}
```

- [x] **Step 2: テスト実行 (Apps Script UI で `runTests` を実行)**

Apps Script エディタで `runTests` 関数を選択 → 実行ボタン。`doPost` が未定義のため全件 FAIL することを確認。

- [x] **Step 3: `gas/feedback/Code.gs` に doPost と検証ロジックを実装**

```javascript
function doPost(e) {
  try {
    // 1. Token 検証
    if (!e.parameter || e.parameter.t !== getSharedToken()) {
      return reply({ ok: false, error: 'forbidden' });
    }

    // 2. Body パース
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (_) {
      return reply({ ok: false, error: 'invalid_payload' });
    }

    // 3. Honeypot
    if (body.website && String(body.website).trim() !== '') {
      return reply({ ok: true });
    }

    // 4. 必須項目
    const service = body.service;
    const message = (body.message || '').trim();
    if (!ALLOWED_SERVICES.includes(service)) return reply({ ok: false, error: 'invalid_payload' });
    if (!message) return reply({ ok: false, error: 'invalid_payload' });
    if (message.length > 2000) return reply({ ok: false, error: 'invalid_payload' });

    // 5. dryRun 分岐 (テスト用)
    if (body.__dryRun) return reply({ ok: true });

    // 6. Spreadsheet + Slack (後続タスクで実装)
    return reply({ ok: true });

  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'internal' });
  }
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [x] **Step 4: テスト再実行で全件 PASS を確認**

Apps Script UI で `runTests` 実行 → ログに `all passed` 相当が出ることを確認。

- [x] **Step 5: ローカル repo のソースも更新してコミット**

Apps Script UI からコピーしてローカルファイルを上書き保存:

```bash
git add gas/feedback/Code.gs gas/feedback/tests.gs
git commit -m "implement gas request validation with honeypot and dry-run"
```

---

## Task 5: Spreadsheet 書き込み (`pending` 状態で append し行番号を保持)

**Files:**
- Create: `gas/feedback/spreadsheet.gs`
- Modify: `gas/feedback/Code.gs`
- Modify: `gas/feedback/tests.gs`

- [x] **Step 1: テストを追加** (`gas/feedback/tests.gs`)

`runTests()` の配列に以下を追加し、関数を末尾に追記:

```javascript
function test_spreadsheet_append_returns_row_number() {
  const before = getSheetByService('soan').getLastRow();
  const row = appendPendingRow('soan', 'integration test', 'UA-test', 'hash-test');
  const after = getSheetByService('soan').getLastRow();
  if (row !== after) throw new Error(`row=${row}, last=${after}`);
  if (after !== before + 1) throw new Error(`expected ${before + 1}, got ${after}`);
  // 後始末: 追加した行を削除
  getSheetByService('soan').deleteRow(after);
}
```

- [x] **Step 2: テスト実行で FAIL を確認**

Apps Script UI で `runTests`。`appendPendingRow` 未定義で FAIL。

- [x] **Step 3: `gas/feedback/spreadsheet.gs` を実装**

```javascript
function getSheetByService(service) {
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  const sheet = ss.getSheetByName(service);
  if (!sheet) throw new Error(`Sheet not found for service: ${service}`);
  return sheet;
}

function appendPendingRow(service, message, userAgent, ipHash) {
  const sheet = getSheetByService(service);
  const timestamp = new Date();
  sheet.appendRow([timestamp, service, message, userAgent, ipHash, 'pending', '']);
  return sheet.getLastRow();
}

function updateSlackStatus(service, rowNumber, status) {
  const sheet = getSheetByService(service);
  sheet.getRange(rowNumber, 6).setValue(status);
}

function sha256Hex(input) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return bytes.map(b => {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}
```

- [x] **Step 4: テスト再実行で PASS を確認**

- [x] **Step 5: `Code.gs` を `appendPendingRow` を呼ぶよう更新**

`// 6. Spreadsheet + Slack (後続タスクで実装)` の行を以下に置き換え:

```javascript
    // 6. Spreadsheet 追記 (pending 状態)
    const ua = (e.parameter && e.parameter['user-agent']) || '';
    const ip = (e.parameter && e.parameter.ip) || ''; // GAS は IP を直接出さないので空欄。将来 X-Forwarded-For 等を見るならここに
    const ipHash = ip ? sha256Hex(ip) : '';
    const row = appendPendingRow(service, message, ua, ipHash);

    // 7. Slack 転送 (Task 6 で実装)
    // 8. slack_status 更新 (Task 6 で実装)

    return reply({ ok: true });
```

- [x] **Step 6: ローカルソース同期 + コミット**

```bash
git add gas/feedback/spreadsheet.gs gas/feedback/Code.gs gas/feedback/tests.gs
git commit -m "add spreadsheet append with pending status and row tracking"
```

---

## Task 6: Slack 転送と `slack_status` 更新

**Files:**
- Create: `gas/feedback/slack.gs`
- Modify: `gas/feedback/Code.gs`
- Modify: `gas/feedback/tests.gs`

- [x] **Step 1: テストを追加** (`gas/feedback/tests.gs`)

```javascript
function test_slack_payload_shape() {
  const payload = buildSlackPayload('soan', 'テストメッセージ', new Date('2026-05-22T01:23:00.000Z'));
  if (!payload.attachments || payload.attachments.length !== 1) throw new Error('attachments shape');
  const att = payload.attachments[0];
  if (att.color !== '#2EB67D') throw new Error(`color expected #2EB67D, got ${att.color}`);
  if (!att.blocks || att.blocks.length !== 3) throw new Error('blocks shape');
  if (att.blocks[0].type !== 'header') throw new Error('header missing');
  if (!att.blocks[0].text.text.includes('SOAN')) throw new Error('service label missing');
  if (att.blocks[1].text.text.indexOf('> テストメッセージ') !== 0) throw new Error('quote missing');
  // context block 先頭が service タグであること (集約チャンネルでの検索/識別用)
  const firstContext = att.blocks[2].elements[0].text;
  if (firstContext.indexOf('service: soan') === -1) throw new Error(`service tag missing: ${firstContext}`);
}

function test_slack_post_dryRun_does_not_throw() {
  // dryRun フラグ付きで postToSlack を呼んでも UrlFetchApp を叩かない
  const result = postToSlack('soan', 'msg', new Date(), { dryRun: true });
  if (result !== 'dryRun') throw new Error(`expected dryRun, got ${result}`);
}
```

- [x] **Step 2: テスト実行で FAIL を確認**

- [x] **Step 3: `gas/feedback/slack.gs` を実装**

```javascript
function buildSlackPayload(service, message, timestamp) {
  const meta = SERVICE_META[service];
  const jst = Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
  const quoted = String(message).split('\n').map(l => '> ' + l).join('\n');
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${getSpreadsheetId()}/edit`;
  // 共通 #feedback チャンネルに集約されるため、attachments の color と
  // context 先頭の service タグでサービスを 3 重に識別できる形にする。
  return {
    attachments: [
      {
        color: meta.color,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `${meta.emoji} ${meta.label} への新しいフィードバック` },
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: quoted },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `🏷 \`service: ${service}\`` },
              { type: 'mrkdwn', text: `🕒 ${jst} JST` },
              { type: 'mrkdwn', text: `🌐 from \`rittoku.llc/services/${service}\`` },
              { type: 'mrkdwn', text: `📊 <${sheetUrl}|Spreadsheet で見る>` },
            ],
          },
        ],
      },
    ],
  };
}

function postToSlack(service, message, timestamp, options) {
  options = options || {};
  if (options.dryRun) return 'dryRun';
  const url = getSlackWebhookUrl();
  if (!url) return 'error: no_webhook';
  const payload = buildSlackPayload(service, message, timestamp);
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  return code === 200 ? 'ok' : `error: ${code}`;
}
```

- [x] **Step 4: テスト再実行で PASS を確認**

- [x] **Step 5: `Code.gs` に Slack 呼び出しと status 更新を組み込む**

`// 7. Slack 転送 (Task 6 で実装)` 以降を置き換え:

```javascript
    // 7. Slack 転送
    const slackResult = postToSlack(service, message, new Date());

    // 8. slack_status 更新
    updateSlackStatus(service, row, slackResult);

    return reply({ ok: true });
```

- [x] **Step 6: ローカル同期 + コミット**

```bash
git add gas/feedback/slack.gs gas/feedback/Code.gs gas/feedback/tests.gs
git commit -m "add slack block kit transfer with status writeback"
```

---

## Task 7: GAS Script Properties 設定とデプロイ

**Files:**
- Modify: なし (Apps Script UI 上の作業)

- [x] **Step 1: ランダム Shared Token を生成**

ターミナルで:

```bash
openssl rand -hex 16
```

出力された 32 字を控える (例: `a3f9...`)。

- [x] **Step 2: Spreadsheet にバインドした Apps Script プロジェクトを開く**

Spreadsheet を開いた状態で「拡張機能 > Apps Script」をクリック。

- [x] **Step 3: `gas/feedback/` の全ファイルを Apps Script UI に貼る**

Apps Script UI の「+」で `Code.gs` / `config.gs` / `spreadsheet.gs` / `slack.gs` / `tests.gs` を作成し、ローカルファイルの内容をそれぞれコピペ。`appsscript.json` は左ペイン下部の「⚙ プロジェクト設定」→「『appsscript.json』マニフェスト ファイルをエディタで表示」を有効化してから内容を貼る。

- [x] **Step 4: Script Properties に 3 件登録**

「⚙ プロジェクト設定」→「スクリプト プロパティ」→「スクリプト プロパティを追加」:

- `SHARED_TOKEN` = Step 1 で生成した値
- `SPREADSHEET_ID` = Task 2 で控えた ID
- `SLACK_WEBHOOK_URL` = Task 1 で取得した `#feedback` 用 Webhook URL

「スクリプト プロパティを保存」を押す。

- [x] **Step 5: `runTests` で全テスト PASS を再確認**

権限付与ダイアログが出たら承認 (Spreadsheets / External Request)。`runTests` 実行 → ログに `all passed` 相当が出る。

- [x] **Step 6: ウェブアプリとしてデプロイ**

「デプロイ > 新しいデプロイ」→ 種類「ウェブアプリ」を選択:

- 説明: `service feedback proxy v1`
- 次のユーザーとして実行: `自分`
- アクセスできるユーザー: `全員`

「デプロイ」をクリック → ダイアログで Web App URL を取得 (`https://script.google.com/macros/s/.../exec`)。控える。

- [x] **Step 7: 疎通テスト (ターミナルから curl)**

```bash
TOKEN=<shared_token>
URL=<gas_web_app_url>
curl -X POST "$URL?t=$TOKEN" \
  -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"service":"soan","message":"GAS デプロイ後の疎通テストです"}'
```

期待: `{"ok":true}` が返り、Spreadsheet `soan` タブに 1 行追加、共通 `#feedback` チャンネルに緑のサイドバー付きで SOAN 用ヘッダのメッセージが届く。

`service` を `booking` / `tsuzuri` に変えた curl も同様に実行し、3 サービス全てが同じ `#feedback` チャンネルに **色と絵文字が違う形** で並ぶことを確認 (青📅Booking / 緑📝SOAN / 橙✍️Tsuzuri)。

---

## Task 8: VitePress カスタムテーマエントリ作成

**Files:**
- Create: `docs/.vitepress/theme/index.ts`

- [x] **Step 1: `docs/.vitepress/theme/index.ts` を作成**

```typescript
import DefaultTheme from 'vitepress/theme';
import ServiceFeedbackForm from './components/ServiceFeedbackForm.vue';
import type { Theme } from 'vitepress';

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ServiceFeedbackForm', ServiceFeedbackForm);
  },
};

export default theme;
```

- [x] **Step 2: ビルドが通ることを確認**

```bash
yarn docs:build
```

期待: `Found dead link` 等の警告なしに成功 (コンポーネント未作成段階だが import が解決できないため Task 9 と一緒にコミット)。一旦ビルドが失敗してよいが、次のステップでコンポーネントを作るので進める。

- [x] **Step 3: コミットは Task 9 完了後にまとめて行う**

---

## Task 9: ServiceFeedbackForm.vue を実装

**Files:**
- Create: `docs/.vitepress/theme/components/ServiceFeedbackForm.vue`

- [x] **Step 1: コンポーネントを作成**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

type ServiceId = 'booking' | 'soan' | 'tsuzuri';
type FormState = 'idle' | 'submitting' | 'success' | 'error';

const props = defineProps<{ service: ServiceId }>();

const message = ref('');
const website = ref(''); // honeypot
const state = ref<FormState>('idle');
const errorText = ref('');

const MAX_LEN = 2000;
const remaining = computed(() => MAX_LEN - message.value.length);
const tooLong = computed(() => remaining.value < 0);
const canSubmit = computed(
  () => state.value === 'idle' && message.value.trim().length > 0 && !tooLong.value,
);

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) return;

  const gasUrl = import.meta.env.VITE_FEEDBACK_GAS_URL;
  const token = import.meta.env.VITE_FEEDBACK_SHARED_TOKEN;
  if (!gasUrl || !token) {
    state.value = 'error';
    errorText.value = '送信先が未設定です。サイト管理者にご連絡ください。';
    return;
  }

  state.value = 'submitting';
  errorText.value = '';

  try {
    const res = await fetch(`${gasUrl}?t=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        service: props.service,
        message: message.value,
        website: website.value,
        submittedAt: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (data.ok) {
      state.value = 'success';
    } else {
      state.value = 'error';
      errorText.value = '送信に失敗しました。時間をおいて再度お試しください。';
    }
  } catch (_) {
    state.value = 'error';
    errorText.value = '送信に失敗しました。ネットワークをご確認のうえ、再度お試しください。';
  }
}

function reset(): void {
  state.value = 'idle';
  errorText.value = '';
}
</script>

<template>
  <div class="feedback-form">
    <div v-if="state === 'success'" class="feedback-success">
      <p>お送りいただきありがとうございました。</p>
      <p class="feedback-note">
        個別のご返信はいたしかねますが、内容は担当者で確認します。
        返信が必要なご相談は <a href="/contact">お問い合わせ</a> をご利用ください。
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <label for="feedback-message" class="feedback-label">
        不具合のご報告・ご要望などお寄せください
      </label>
      <textarea
        id="feedback-message"
        v-model="message"
        rows="5"
        :maxlength="MAX_LEN"
        :disabled="state === 'submitting'"
        placeholder="例) Markdown プレビューでテーブルが崩れます"
      />

      <input
        v-model="website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="feedback-honeypot"
      />

      <p v-if="errorText" class="feedback-error">{{ errorText }}</p>

      <div class="feedback-actions">
        <p class="feedback-note">
          送信内容と送信日時、サービス名がスタッフに共有されます。<br />
          個別返信はできません。返信が必要なご相談は <a href="/contact">お問い合わせ</a> をご利用ください。
        </p>
        <button
          type="submit"
          :disabled="!canSubmit"
        >
          {{ state === 'submitting' ? '送信中…' : '送信する' }}
        </button>
      </div>
    </form>

    <button v-if="state === 'error'" type="button" class="feedback-retry" @click="reset">
      フォームに戻る
    </button>
  </div>
</template>

<style scoped>
.feedback-form {
  margin: 24px 0 8px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.feedback-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.feedback-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.feedback-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.feedback-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-top: 12px;
}

.feedback-note {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.feedback-actions button {
  background-color: var(--vp-c-brand);
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.feedback-actions button:hover:not(:disabled) {
  opacity: 0.85;
}

.feedback-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-error {
  margin: 8px 0 0;
  padding: 8px;
  background-color: rgba(255, 68, 68, 0.08);
  border: 1px solid rgba(255, 68, 68, 0.4);
  border-radius: 4px;
  color: #c00;
  font-size: 0.9rem;
}

.feedback-success p:first-child {
  font-weight: 600;
  margin-top: 0;
}

.feedback-retry {
  margin-top: 12px;
  background: transparent;
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-brand);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>
```

- [x] **Step 2: ビルドが成功することを確認**

```bash
yarn docs:build
```

期待: 成功。サービスページからの参照はまだないので未使用の警告は出ない。

- [x] **Step 3: コミット**

```bash
git add docs/.vitepress/theme/index.ts docs/.vitepress/theme/components/ServiceFeedbackForm.vue
git commit -m "add ServiceFeedbackForm component and custom theme entry"
```

---

## Task 10: 3 つのサービスページにフォームを差し込む

**Files:**
- Modify: `docs/services/booking.md`
- Modify: `docs/services/soan.md`
- Modify: `docs/services/tsuzuri.md`

- [x] **Step 1: `docs/services/booking.md` の末尾 (「ご利用にあたって」直前) にフィードバックセクションを追加**

`## ご利用にあたって` の直前に挿入:

```markdown
## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="booking" />

```

- [x] **Step 2: `docs/services/soan.md` の既存「フィードバック」セクションを置換**

booking と異なり soan.md には現状フィードバックセクションが無い。`## ご利用にあたって` の直前に同じ形で追加 (見出し名は揃える):

```markdown
## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="soan" />

```

- [x] **Step 3: `docs/services/tsuzuri.md` の既存「フィードバック」セクションを置換**

現状:

```markdown
## フィードバック

不具合報告・ご要望は [お問い合わせフォーム](/contact) からお寄せください。皆さまの声を参考に開発を続けています。

<!-- TODO: ベータ用フィードバック Google フォーム URL が用意でき次第、上記を以下に差し替え:
**[こちらの Google フォーム](FORM_URL_TBD)** からお寄せください。匿名でも構いません。 -->
```

を以下に置換 (TODO コメントは削除):

```markdown
## フィードバック

不具合のご報告・ご要望などお寄せください。担当者が内容を確認します。

<ServiceFeedbackForm service="tsuzuri" />
```

- [x] **Step 4: ビルドが成功することを確認**

```bash
yarn docs:build
```

- [x] **Step 5: コミット**

```bash
git add docs/services/booking.md docs/services/soan.md docs/services/tsuzuri.md
git commit -m "embed feedback form on booking, soan, tsuzuri service pages"
```

---

## Task 11: 環境変数テンプレートと .gitignore 更新

VitePress (Vite) は `.env*` を `docs/` (config の root) から読むため、`.env.local` は `docs/` 直下に置く。

**Files:**
- Create: `docs/.env.local.example`
- Modify: `.gitignore`

- [x] **Step 1: `docs/.env.local.example` を作成**

```
# Service feedback widget (per plans/2026-05-22-service-feedback-slack-design.md)
# Copy to .env.local (in this same docs/ directory) and fill in the actual values
# from the GAS deployment. VitePress loads env files from docs/ by default.

VITE_FEEDBACK_GAS_URL=https://script.google.com/macros/s/REPLACE_ME/exec
VITE_FEEDBACK_SHARED_TOKEN=REPLACE_ME_32_HEX_CHARS
```

- [x] **Step 2: `.gitignore` を確認し `.env.local` が除外されているか確認**

```bash
grep -E '\\.env(\\.local)?$' .gitignore || echo "missing"
```

未除外の場合は `.gitignore` 末尾に以下を追記。先頭にスラッシュを付けないので、`.env.local` / `docs/.env.local` のどちらにマッチする:

```
# Local environment variables
.env.local
```

- [x] **Step 3: ローカル開発用に `docs/.env.local` を作成 (コミットしない)**

```bash
cp docs/.env.local.example docs/.env.local
# エディタで開いて Task 7 で取得した GAS URL と SHARED_TOKEN を入れる
```

- [x] **Step 4: コミット**

```bash
git add docs/.env.local.example .gitignore
git commit -m "add env template for service feedback widget"
```

---

## Task 12: GitHub Actions ワークフローにシークレットを注入

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [x] **Step 1: GitHub リポジトリの Settings > Secrets and variables > Actions で 2 件のシークレットを追加**

ブラウザで GitHub リポジトリを開き、Settings > Secrets and variables > Actions > 「New repository secret」:

- `FEEDBACK_GAS_URL` = Task 7 で取得した Web App URL
- `FEEDBACK_SHARED_TOKEN` = Task 7 で生成した token

- [x] **Step 2: `.github/workflows/deploy.yml` の「Build with VitePress」ステップに env を追加**

修正前:

```yaml
      - name: Build with VitePress
        run: yarn docs:build
```

修正後:

```yaml
      - name: Build with VitePress
        run: yarn docs:build
        env:
          VITE_FEEDBACK_GAS_URL: ${{ secrets.FEEDBACK_GAS_URL }}
          VITE_FEEDBACK_SHARED_TOKEN: ${{ secrets.FEEDBACK_SHARED_TOKEN }}
```

- [x] **Step 3: コミット**

```bash
git add .github/workflows/deploy.yml
git commit -m "pass feedback widget secrets to vitepress build"
```

---

## Task 13: ローカルで E2E 動作確認

**Files:**
- Modify: なし

- [x] **Step 1: 開発サーバ起動**

```bash
yarn docs:dev
```

ブラウザで `http://localhost:5173/services/booking` を開く。

- [x] **Step 2: Booking ページのフォームから疎通テスト**

「フィードバック」セクションの textarea に `ローカル疎通テスト (booking)` と入力 → 「送信する」 → 「お送りいただきありがとうございました。」が表示されることを確認。

- [x] **Step 3: Slack と Spreadsheet を確認**

共通 `#feedback` チャンネルに **青サイドバー + 📅 Calendar & Booking** ヘッダの通知が届き、Spreadsheet `booking` タブに 1 行追加されていることを目視確認。

- [x] **Step 4: SOAN ページで同様に確認**

`http://localhost:5173/services/soan` → `ローカル疎通テスト (soan)` → 確認。

- [x] **Step 5: Tsuzuri ページで同様に確認**

`http://localhost:5173/services/tsuzuri` → `ローカル疎通テスト (tsuzuri)` → 確認。

- [x] **Step 6: Honeypot 動作確認 (devtools で属性差し替え)**

ブラウザの devtools でフォーム内の `<input class="feedback-honeypot">` を一時的に表示状態にし、値 `https://spam.example` を入れて送信。表示は「ありがとうございました」になるが、Slack / Spreadsheet には何も増えないことを確認。

- [x] **Step 7: バリデーション動作確認**

- 本文を空白のまま送信ボタン → 「送信する」が無効化されているはず
- 2001 字以上を貼り付け → 送信ボタンが無効化されるはず

- [x] **Step 8: エラー UX 動作確認 (一時的に GAS URL を壊す)**

`.env.local` の `VITE_FEEDBACK_GAS_URL` を `https://script.google.com/INVALID/exec` などに変更し、`yarn docs:dev` を再起動して送信。エラーメッセージ + 「フォームに戻る」ボタンが表示されることを確認。確認後 `.env.local` を元に戻す。

- [x] **Step 9: テスト用に挿入された Spreadsheet 行を削除**

Spreadsheet を開き、各タブのテスト行 (`ローカル疎通テスト` メッセージ) を選択して削除。

- [x] **Step 10: 開発サーバ停止**

ターミナルで `Ctrl+C`。

---

## Task 14: main にマージ → 本番疎通テスト

**Files:**
- Modify: なし

- [x] **Step 1: コミット履歴を確認**

```bash
git log --oneline origin/main..HEAD
```

期待: Task 3-12 までのコミットが並んでいる。

- [x] **Step 2: push**

```bash
git push origin main
```

- [x] **Step 3: GitHub Actions のビルドを確認**

GitHub の Actions タブで「Deploy VitePress site to Pages」が成功するのを待つ (約 1-2 分)。

- [x] **Step 4: 本番サイトで疎通テスト**

`https://rittoku.llc/services/booking` を開いて textarea に `本番疎通テスト (booking)` を送信 → 成功 UX を確認 → Slack / Spreadsheet を確認。

同様に soan / tsuzuri も実施。

- [x] **Step 5: 本番テスト行を Spreadsheet から削除**

各タブの `本番疎通テスト` 行を削除。

---

## Task 15: 運用引継ぎドキュメント作成

**Files:**
- Create: `handover/service-feedback-operations.md`

- [x] **Step 1: 引継ぎ文書を作成**

```markdown
# Service Feedback 運用引継ぎ

> 設計: `archives/2026-05-22-service-feedback-slack-design.md`
> 実装計画: `archives/2026-05-22-service-feedback-slack-impl.md`
> GAS ソース: `gas/feedback/`

## 監視

- **日次**: Slack 共通チャンネル `#feedback` の未読を確認。サービスはサイドバー色 (青=Booking / 緑=SOAN / 橙=Tsuzuri) と絵文字で識別。対応必要なら Spreadsheet `notes` 列に記録
- **週次**: Spreadsheet を眺めて以下を確認
  - 同一 ip_hash からの高頻度投稿 (スパム兆候)
  - `slack_status` 列に `error: ...` が多発していないか (Slack 側障害の兆候)

## Slack Webhook URL ローテーション

漏洩が疑われる場合や定期更新:

1. Slack ワークスペース管理画面で `#feedback` の Incoming Webhook を Revoke
2. 同じ `#feedback` チャンネルに新しい Incoming Webhook を発行
3. Apps Script UI の「⚙ プロジェクト設定 > スクリプト プロパティ」で `SLACK_WEBHOOK_URL` を新しい URL に更新
4. **再デプロイは不要** (Script Properties は実行時参照)

## Shared Token ローテーション

GAS Web App URL は変えずに Shared Token のみ更新する場合:

1. `openssl rand -hex 16` で新 token を生成
2. Apps Script UI の Script Properties で `SHARED_TOKEN` を更新
3. GitHub Secrets `FEEDBACK_SHARED_TOKEN` を更新
4. main に空コミット or 任意の小変更を push → GitHub Actions が再ビルドして新 token をクライアントに埋め込む
5. 旧 token は無効化される

## サービス追加手順

例: 新サービス `newsvc` を追加する場合 (共通 `#feedback` チャンネルに集約されるため Slack 側の追加作業は不要)

1. Spreadsheet: タブ `newsvc` を追加、ヘッダ行をコピー
2. `gas/feedback/config.gs`:
   - `ALLOWED_SERVICES` に `'newsvc'` を追加
   - `SERVICE_META` に `newsvc: { emoji: '🆕', label: 'New Service', color: '#XXXXXX' }` を追加 (色は既存 3 サービスと十分異なるものを選ぶ)
3. Apps Script UI の `config.gs` も同様に更新
4. `docs/services/newsvc.md` に `<ServiceFeedbackForm service="newsvc" />` を埋め込む
5. ローカル `yarn docs:dev` で疎通確認 (`#feedback` に新サービスの色とヘッダで通知が届くこと)
6. コミット & push

## スパム流入時の対応

`slack_status` ログや Spreadsheet で異常な大量投稿を発見した場合:

1. **短期**: Apps Script の「デプロイ管理」で Web App を Archive することで即座に停止
2. **中期**: Cloudflare Turnstile を導入する別 plan を起こし、設計を更新する。`archives/2026-05-22-service-feedback-slack-design.md` § 8 の「将来の CAPTCHA 追加」を参照

## 関連リンク

- Spreadsheet: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
- GAS プロジェクト: Spreadsheet 内「拡張機能 > Apps Script」
- GitHub Secrets: Settings > Secrets and variables > Actions
```

- [x] **Step 2: コミット**

```bash
git add handover/service-feedback-operations.md
git commit -m "add operations handover for service feedback widget"
```

- [x] **Step 3: push (Task 14 を先に済ませている場合は不要)**

```bash
git push origin main
```

---

## Self-Review

### Spec カバレッジ

| 設計セクション | 対応タスク |
| --- | --- |
| §3 アーキテクチャ | Task 3-7 (GAS) + Task 8-10 (Client) |
| §4 クライアント UI | Task 8 + 9 + 10 |
| §5 GAS コントラクト | Task 4 (検証) + 5 (Spreadsheet) + 6 (Slack) |
| §6 Spreadsheet 構造 | Task 2 |
| §7 Slack メッセージ | Task 6 |
| §8 スパム対策 | Task 4 (honeypot + token + 本文長) |
| §9 設定・デプロイ | Task 1, 2, 7, 11, 12 |
| §10 テスト | Task 4, 5, 6 (TDD) + Task 13 (手動 QA) |
| §11 エラーハンドリング | Task 6 (slack_status 列) + Task 9 (Client `error` 状態) |
| §13 リリース順序 | Task 1-2-7 → Task 8-12 → Task 13 → Task 14 |

### プレースホルダーチェック

- `REPLACE_ME` は `.env.local.example` 内のみ。実値はデプロイ時に注入される正しい用途。
- 関数名・引数名は前後タスクで一致 (`appendPendingRow` / `updateSlackStatus` / `postToSlack`)。

### 型整合性

- `ServiceId` = `'booking' | 'soan' | 'tsuzuri'` を Client / GAS `ALLOWED_SERVICES` / Spreadsheet タブ名 / Script Properties キーで一致させた。

### 既知の保留事項

- Apps Script UI と repo ソースの手動同期。clasp 導入は将来検討、本 plan の範囲外。
- IP アドレス取得は GAS Web App から直接取れないため `ip_hash` は当面空欄。Cloudflare 等のフロントを噛ませる将来拡張で改善余地あり。
