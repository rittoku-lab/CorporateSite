# 点墨 (Tenboku) サービスページ公開後のフォローアップ

**関連**: `docs/services/tenboku.md` / `docs/services.md` / `docs/.vitepress/config.ts` / `docs/.vitepress/theme/components/ServiceFeedbackForm.vue` / `gas/feedback/config.gs`

コーポレートサイトに点墨 (Tenboku) のサービスページを追加した際の post-publish メモ。

---

## 完了済み (2026-07-24)

- ✅ **`rittoku-lab/Tenboku` リポジトリを public 化** — CTA (`https://github.com/rittoku-lab/Tenboku`) が閲覧可能
- ✅ **スクリーンショット 3 枚を差し替え** — `docs/public/images/services/tenboku-overview.png` / `-toggle.png` / `-render.png`
- ✅ **Apps Script 側 `config.gs` を repo と同期 + `/exec` を再デプロイ** — `tenboku` service が Slack / Spreadsheet に流せる
- ✅ **Spreadsheet `Rittoku Feedback Log` に `tenboku` タブを追加** — ヘッダは既存タブ準拠

---

## 残タスク

### 1. main deploy 後の疎通確認 (必須)

サイト公開後に本番でエンドツーエンドの動作確認をする:

1. `https://rittoku.llc/services/tenboku` を開き、フィードバックフォームに `[TEST] tenboku 疎通確認` などを入力して送信
2. Slack `#feedback` に赤系サイドバー (`#B23B3B`) + `🖋️ 点墨（Tenboku）` の attachment が届くこと
3. Spreadsheet の `tenboku` タブに 1 行追加されていること (`slack_status` が `ok` になっていること)
4. テスト行は Spreadsheet 側で削除

ローカルでも試したい場合は `yarn docs:dev` で `http://localhost:5173/services/tenboku` を開いて同じ確認をする。

### 2. 未確定・保留メモ

- **バイナリ配布**: 現状のインストールは `cargo install --path .` (git clone 前提)。将来的に `cargo install tenboku` (crates.io) や `brew install tenboku` を用意する場合、記事の「利用の流れ」ステップ 1 を差し替える
- **Windows サポート**: 記事の FAQ で「macOS/Linux のみ動作確認」と明記済み。もし Windows 動作確認をした場合は FAQ を更新
- **Slack 色 `#B23B3B`**: 暫定値 (点墨の墨色イメージ)。実運用で Slack 見え方に違和感があれば `gas/feedback/config.gs` の `SERVICE_META.tenboku.color` を再調整
- **LICENSE**: `rittoku-lab/Tenboku` に `LICENSE` ファイルがない場合、public 公開後に MIT などを追加検討
