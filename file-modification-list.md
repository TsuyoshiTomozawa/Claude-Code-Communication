# ファイル改修リスト

## リネーム対象ファイル

### 設定ファイル
- `projects.json` → `students.json`

### メインスクリプト
- `agent-send.sh` → `review-send-basic.sh` (基本機能保持)
- `agent-send-v2.sh` → `review-send.sh`
- `boss-allocator.sh` → `review-allocator.sh`
- `worker-helper.sh` → `reviewer-helper.sh`
- `setup.sh` → `review-setup.sh`

### 指示書
- `instructions/president.md` → `instructions/review-president.md`
- `instructions/boss.md` → `instructions/review-boss.md`
- `instructions/worker.md` → `instructions/reviewer.md`

### ドキュメント
- `CLAUDE.md` → そのまま（内容更新）
- `README.md` → そのまま（内容更新）

## 新規作成ファイル

### 設定・ドキュメント
- `review-style.md` - レビュースタイルガイド
- `.env.example` - GitHub token設定テンプレート

### スクリプト
- `gh-review-fetch.sh` - PR情報取得スクリプト
- `review-aggregator.sh` - レビュー結果集約スクリプト

### ディレクトリ
- `review-outputs/` - レビュー結果出力用
- `templates/` - レビューテンプレート格納用

## 主な改修内容

### students.json（旧projects.json）
```diff
{
-  "projects": {
-    "pwe-api": {
-      "path": "/path/to/api",
+  "students": {
+    "tanaka_taro": {
+      "local_path": "/Users/teacher/students-repos/tanaka-webapp",
+      "github_url": "https://github.com/tanaka/webapp-project",
+      "level": "beginner",
+      "current_pr": null,
+      "assigned_worker": null
    }
  },
+  "review_settings": {
+    "style_guide": "./review-style.md",
+    "output_dir": "./review-outputs"
+  }
}
```

### review-send.sh（旧agent-send-v2.sh）
主な変更点:
- `--project` → `--student`
- `--pr-number` オプション追加
- `PROJECTS_FILE` → `STUDENTS_FILE`
- プロジェクトパス取得ロジックを生徒情報取得に変更

### review-allocator.sh（旧boss-allocator.sh）
主な変更点:
- プロジェクト割り当て → 生徒PR割り当て
- 生徒レベルに基づく割り当てロジック追加
- PR情報の解析機能追加

### reviewer-helper.sh（旧worker-helper.sh）
主な変更点:
- MCP-GHM統合関数追加
- review-style.md読み込み機能
- レビューコメントフォーマット機能

### 指示書の更新
全ての指示書で以下を更新:
- コマンド名の変更
- プロジェクト → 生徒/PR
- MCP-GHM使用方法の追加
- レビュー固有の作業フロー

## 削除・保持判断

### 削除候補
- `tmp/worker*_done.txt` - 一時ファイル
- `logs/send_log.txt` - 既存ログ

### 保持
- `.claude/` - Claude設定
- `.gitignore` - Git設定

## 実装順序

1. **Phase 1**: ファイルリネームと基本構造
2. **Phase 2**: 設定ファイル作成・更新
3. **Phase 3**: スクリプト改修（基本機能）
4. **Phase 4**: 新規スクリプト作成
5. **Phase 5**: 指示書・ドキュメント更新
6. **Phase 6**: テスト・デバッグ