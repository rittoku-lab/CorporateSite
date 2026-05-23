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

    // 6. Spreadsheet 追記 (pending 状態)
    const ua = (e.parameter && e.parameter['user-agent']) || '';
    const ip = (e.parameter && e.parameter.ip) || ''; // GAS は IP を直接出さないので空欄。将来 X-Forwarded-For 等を見るならここに
    const ipHash = ip ? sha256Hex(ip) : '';
    const row = appendPendingRow(service, message, ua, ipHash);

    // 7. Slack 転送
    const slackResult = postToSlack(service, message, new Date());

    // 8. slack_status 更新
    updateSlackStatus(service, row, slackResult);

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
