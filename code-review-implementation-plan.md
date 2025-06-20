# コードレビューシステム実装計画書

## プロジェクト概要
既存のClaude-Code-Communicationシステムをベースに、GitHubプルリクエストの分散コードレビューシステムを構築する。

## 実装フェーズ

### Phase 1: プロジェクト初期設定
1. 新プロジェクトディレクトリ作成
   ```bash
   cp -r Claude-Code-Communication/ Code-Review-System/
   cd Code-Review-System/
   ```

2. 設定ファイルの初期化
   - `students.json` (projects.jsonを改名)
   - `review-style.md` (新規作成)
   - `.env.example` (GitHub token設定用)

### Phase 2: コア機能の改修

#### 2.1 設定ファイル改修
**students.json** (projects.json → students.json)
```json
{
  "students": {
    "生徒ID": {
      "local_path": "/path/to/cloned/repo",
      "github_url": "https://github.com/student/repo",
      "level": "beginner|intermediate|advanced",
      "current_pr": null,
      "assigned_worker": null
    }
  },
  "review_settings": {
    "style_guide": "./review-style.md",
    "output_dir": "./review-outputs"
  }
}
```

#### 2.2 スクリプト改修計画

**agent-send-v2.sh → review-send.sh**
- プロジェクト指定を生徒指定に変更
- `--student` フラグ追加
- `--pr-number` フラグ追加
- MCP-GHM連携機能追加

**boss-allocator.sh → review-allocator.sh**
- 生徒レベルに基づく自動割り当て
- PR情報の解析機能
- レビュー負荷分散アルゴリズム

**worker-helper.sh → reviewer-helper.sh**
- MCP-GHMコマンド実行ラッパー
- レビューコメント生成補助
- review-style.md読み込み機能

### Phase 3: 新規機能の実装

#### 3.1 MCP-GHM統合スクリプト
**gh-review-fetch.sh** (新規作成)
```bash
#!/bin/bash
# PR情報取得とレビュー準備を行うスクリプト
# - mcp__ghm__get_pull_request
# - mcp__ghm__get_pull_request_files
# - ローカルリポジトリとの同期
```

#### 3.2 レビュー結果集約システム
**review-aggregator.sh** (新規作成)
```bash
#!/bin/bash
# 各workerからのレビュー結果を統合
# - JSON形式で結果を集約
# - Markdown形式でレポート生成
# - GitHub用コメントフォーマット生成
```

### Phase 4: 指示書の改修

#### instructions/president.md → instructions/review-president.md
- PR URLリストの管理方法
- レビュー開始コマンド
- 結果確認と手動投稿手順

#### instructions/boss.md → instructions/review-boss.md
- 生徒レベル別割り当てロジック
- 負荷分散の考慮事項
- エラーハンドリング

#### instructions/worker.md → instructions/reviewer.md
- MCP-GHMツールの使用方法
- review-style.mdの適用方法
- レビューコメント作成ガイドライン

### Phase 5: ユーティリティとヘルパー

#### 5.1 セットアップスクリプト改修
**setup.sh → review-setup.sh**
- レビュー専用tmuxレイアウト
- MCP-GHM接続確認
- 生徒リポジトリの存在確認

#### 5.2 ログシステム強化
- レビュー履歴の保存
- 生徒別レビュー統計
- エラーログの分離

## 実装優先順位

1. **最優先**: 基本的なレビューフロー
   - students.json設定
   - review-send.sh基本機能
   - MCP-GHM連携テスト

2. **高優先**: ワーカー機能
   - reviewer-helper.sh
   - review-style.md統合
   - 基本的なレビュー実行

3. **中優先**: 自動化と集約
   - review-allocator.sh
   - review-aggregator.sh
   - レポート生成

4. **低優先**: 拡張機能
   - 統計機能
   - Slack通知
   - ダッシュボード

## 移行チェックリスト

- [ ] プロジェクトディレクトリのコピー
- [ ] 設定ファイルの作成
- [ ] スクリプト名の変更
- [ ] 機能の改修
- [ ] 指示書の更新
- [ ] テスト環境の構築
- [ ] 動作確認
- [ ] ドキュメント作成