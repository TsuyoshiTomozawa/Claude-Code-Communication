# コードレビューシステム実装指示書

## 実装手順

### Step 1: プロジェクト準備（手動作業）
```bash
# 新プロジェクトディレクトリ作成
cp -r Claude-Code-Communication/ ~/Code-Review-System/
cd ~/Code-Review-System/

# 不要なログ削除
rm -rf logs/*.txt tmp/*.txt

# Git初期化
git init
git add .
git commit -m "Initial commit from Claude-Code-Communication"
```

### Step 2: 設定ファイルの作成

#### 2.1 students.json作成
```bash
# projects.jsonをベースに作成
mv projects.json students.json
```

内容を以下のように編集:
```json
{
  "students": {
    "tanaka_taro": {
      "local_path": "/Users/teacher/students-repos/tanaka-webapp",
      "github_url": "https://github.com/tanaka/webapp-project",
      "level": "beginner",
      "current_pr": null,
      "assigned_worker": null
    }
  },
  "review_settings": {
    "style_guide": "./review-style.md",
    "output_dir": "./review-outputs",
    "mcp_ghm_enabled": true
  }
}
```

#### 2.2 review-style.md作成
```markdown
# レビュースタイルガイド

## 基本的な口調
- 「なるほどね〜」から始める
- 「いいじゃん！」で褒める
- 「ちょっと待って」で注意を引く

## フィードバックテンプレート
### 良い点を見つけた時
- "おっ、{技術名}使えるようになったんだ！いいじゃん！"
- "なるほどね〜、{機能}の実装よく考えられてる！"

### 改善提案
- "ちょっと待って、ここは{理由}だから{改善案}の方がいいかも"
- "なるほどね〜、でもこれだと{問題点}になっちゃうから、{提案}してみようか"
```

### Step 3: スクリプト改修作業

#### 3.1 agent-send-v2.sh → review-send.sh
```bash
cp agent-send-v2.sh review-send.sh
```

主な改修点:
1. `--project` を `--student` に変更
2. `--pr-number` オプション追加
3. `projects.json` を `students.json` に変更
4. プロジェクトパスの代わりに生徒のローカルリポジトリパスを使用

#### 3.2 boss-allocator.sh → review-allocator.sh
```bash
cp boss-allocator.sh review-allocator.sh
```

主な改修点:
1. 生徒レベルに基づく割り当てロジック追加
2. PR番号の解析機能追加
3. レビュー負荷の均等化

#### 3.3 worker-helper.sh → reviewer-helper.sh
```bash
cp worker-helper.sh reviewer-helper.sh
```

主な改修点:
1. MCP-GHMコマンドのラッパー関数追加
2. review-style.md読み込み機能
3. レビューコメントのフォーマット機能

### Step 4: 新規スクリプトの作成

#### 4.1 gh-review-fetch.sh（新規）
MCP-GHMを使用してPR情報を取得:
```bash
#!/bin/bash
# Usage: ./gh-review-fetch.sh <student_id> <pr_number>

STUDENT_ID=$1
PR_NUMBER=$2

# students.jsonから情報取得
GITHUB_URL=$(jq -r ".students.${STUDENT_ID}.github_url" students.json)
# URLからowner/repoを抽出
# MCP-GHMコマンドを実行
```

#### 4.2 review-aggregator.sh（新規）
レビュー結果の集約:
```bash
#!/bin/bash
# 各workerのレビュー結果を統合

OUTPUT_DIR="./review-outputs"
# 結果ファイルを読み込み
# Markdownレポート生成
# GitHub投稿用フォーマット作成
```

### Step 5: 指示書の更新

#### 5.1 instructions/ディレクトリ内のファイル改名と更新
```bash
cd instructions/
mv president.md review-president.md
mv boss.md review-boss.md
mv worker.md reviewer.md
```

各ファイルの主な変更:
- コマンド名の更新（agent-send → review-send）
- MCP-GHM使用方法の追加
- レビュー固有の指示追加

### Step 6: テストとデバッグ

#### 6.1 単体テスト
各スクリプトを個別にテスト:
```bash
# 基本的な送信テスト
./review-send.sh boss1 "テストメッセージ"

# 生徒指定テスト
./review-send.sh worker1 "レビュー開始" --student tanaka_taro --pr-number 42
```

#### 6.2 統合テスト
全体フローのテスト:
1. setup.shでtmux環境構築
2. PRESIDENTからレビュー指示
3. boss1が割り当て
4. workerがレビュー実行
5. 結果集約確認

### Step 7: ドキュメント作成

#### 7.1 README.md更新
- プロジェクト概要をコードレビューシステムに変更
- 使用方法の更新
- MCP-GHM設定方法の追加

#### 7.2 CLAUDE.md更新
- エージェントの役割をレビュー用に更新
- 新しいコマンドの説明追加

## 実装チェックリスト

### 必須タスク
- [ ] プロジェクトコピーと初期化
- [ ] students.json作成
- [ ] review-style.md作成
- [ ] review-send.sh改修
- [ ] 基本的な動作確認

### 推奨タスク
- [ ] review-allocator.sh改修
- [ ] reviewer-helper.sh改修
- [ ] gh-review-fetch.sh作成
- [ ] 指示書更新

### オプションタスク
- [ ] review-aggregator.sh作成
- [ ] 統計機能追加
- [ ] エラーハンドリング強化

## トラブルシューティング

### よくある問題
1. **MCP-GHM接続エラー**
   - GitHub tokenの設定確認
   - MCP設定ファイルの確認

2. **生徒リポジトリが見つからない**
   - students.jsonのパス確認
   - リポジトリのクローン状態確認

3. **tmuxセッションエラー**
   - 既存セッションの削除
   - setup.sh再実行