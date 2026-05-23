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
