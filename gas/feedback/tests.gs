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
