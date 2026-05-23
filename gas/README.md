# GAS Feedback Proxy

サービスページのフィードバックフォームを Slack + Spreadsheet に転送する Google Apps Script プロジェクト。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `feedback/Code.gs` | `doPost(e)` メイン |
| `feedback/config.gs` | Script Properties アクセス |
| `feedback/spreadsheet.gs` | Spreadsheet 読み書き |
| `feedback/slack.gs` | Slack Block Kit メッセージ送信 |
| `feedback/tests.gs` | Apps Script UI から手動実行する自助テスト |
| `feedback/appsscript.json` | GAS マニフェスト |

## 同期方針

このディレクトリは「真のソース」として版管理する。Apps Script UI で変更したら必ずここにも反映してコミットする。逆向きも同様。clasp は使わない。

## デプロイ手順

`plans/2026-05-22-service-feedback-slack-impl.md` の Task 7 を参照。
