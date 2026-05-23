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
    test_spreadsheet_append_returns_row_number,
    test_slack_payload_shape,
    test_slack_post_dryRun_does_not_throw,
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

function test_spreadsheet_append_returns_row_number() {
  const before = getSheetByService('soan').getLastRow();
  const row = appendPendingRow('soan', 'integration test', 'UA-test', 'hash-test');
  const after = getSheetByService('soan').getLastRow();
  if (row !== after) throw new Error(`row=${row}, last=${after}`);
  if (after !== before + 1) throw new Error(`expected ${before + 1}, got ${after}`);
  // 後始末: 追加した行を削除
  getSheetByService('soan').deleteRow(after);
}

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
