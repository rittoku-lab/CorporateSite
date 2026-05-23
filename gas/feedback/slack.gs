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
