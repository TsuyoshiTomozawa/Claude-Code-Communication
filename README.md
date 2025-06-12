# 🤖 Tmux Multi-Agent Communication System

Agent同士がやり取りするtmux環境のデモシステム（汎用プロジェクト対応版）

## 🎯 システム概要

PRESIDENT → BOSS → Workers の階層型指示システム。複数のプロジェクトリポジトリに対して、動的にworkerを割り当てて作業を実行できます。

### 👥 エージェント構成

```
📊 PRESIDENT セッション (1ペイン)
└── PRESIDENT: プロジェクト統括責任者

📊 multiagent セッション (4ペイン)  
├── boss1: チームリーダー（タスク割り当て管理）
├── worker1: 実行担当者A
├── worker2: 実行担当者B
└── worker3: 実行担当者C
```

## 🚀 クイックスタート

### 0. リポジトリのクローン

```bash
git clone https://github.com/nishimoto265/Claude-Code-Communication.git
cd Claude-Code-Communication
```

### 1. プロジェクト設定

`projects.json`を編集して、管理したいプロジェクトのパスを設定：

```json
{
  "projects": {
    "pwe-api": {
      "path": "/Users/you/projects/pwe-api",
      "type": "git",
      "default_branch": "main"
    },
    "pwe-frontend": {
      "path": "/Users/you/projects/pwe-frontend",
      "type": "git",
      "default_branch": "main"
    }
  },
  "worktree_base": "/tmp/agent-worktrees"
}
```

### 2. tmux環境構築

⚠️ **注意**: 既存の `multiagent` と `president` セッションがある場合は自動的に削除されます。

```bash
./setup.sh
```

### 3. セッションアタッチ

```bash
# マルチエージェント確認
tmux attach-session -t multiagent

# プレジデント確認（別ターミナルで）
tmux attach-session -t president
```

### 4. Claude Code起動

**手順1: President認証**
```bash
# まずPRESIDENTで認証を実施
tmux send-keys -t president 'claude' C-m
```
認証プロンプトに従って許可を与えてください。

**手順2: Multiagent一括起動**
```bash
# 認証完了後、multiagentセッションを一括起動
for i in {0..3}; do tmux send-keys -t multiagent:0.$i 'claude' C-m; done
```

## 📋 使用例

### 基本的なHello Worldデモ

PRESIDENTセッションで：
```
あなたはpresidentです。指示書に従って
```

### 汎用プロジェクト管理

**例1: シンプルな割り当て**
```
pwe-apiをworker1に、pwe-frontendをworker2に割り当ててテストを実行してください
```

**例2: 複数workerで同じプロジェクト**
```
pwe-apiでworker1とworker2が認証機能を実装してください。login.jsを同時に修正する可能性があります
```
→ 自動的にgit worktreeを作成して競合を回避

**例3: 複雑な指示**
```
以下の作業を実行してください:
- pwe-apiはworker1でテスト実行
- pwe-frontendはworker2とworker3でビルドとデプロイ準備
- pwe-adminは今回作業なし
```

## 🛠️ 高度な機能

### agent-send-v2.sh（汎用版）

```bash
# プロジェクト一覧確認
./agent-send-v2.sh --projects

# プロジェクト指定付き送信
./agent-send-v2.sh worker1 "テストを実行" --project pwe-api

# Worktree作成付き送信
./agent-send-v2.sh worker1 "login.jsを修正" --project pwe-api --worktree auth-feature

# Boss向けの自然言語指示
./agent-send-v2.sh boss1 "pwe-apiをworker1に、pwe-frontendをworker2に割り当ててビルドしてください"
```

### boss-allocator.sh（Boss用ヘルパー）

```bash
# 自然言語から作業割り当て
./boss-allocator.sh allocate "pwe-apiをworker1に、pwe-frontendをworker2に割り当ててテストを実行"

# 競合回避モード
USE_WORKTREE=true ./boss-allocator.sh allocate "全員でpwe-apiのlogin.jsを修正"

# レポート生成
./boss-allocator.sh report
```

### worker-helper.sh（Worker用ヘルパー）

```bash
# 作業環境セットアップ
./worker-helper.sh setup "テスト実行 [作業DIR: /path/to/project]"

# 完了報告
./worker-helper.sh report worker1 "テスト実行" boss1
```

## 📜 指示書について

各エージェントの役割別指示書：
- **PRESIDENT**: `instructions/president.md` - プロジェクト全体管理
- **boss1**: `instructions/boss.md` - タスク割り当てと進捗管理
- **worker1,2,3**: `instructions/worker.md` - 実作業と報告

**Claude Code参照**: `CLAUDE.md` でシステム構造を確認

## 🎬 動作フロー

### 基本フロー
```
1. PRESIDENT → boss1: 作業指示
2. boss1 → 作業を解析してworkerに割り当て
3. workers → 指定プロジェクトで作業実行
4. workers → boss1: 完了報告
5. boss1 → PRESIDENT: 統括報告
```

### Git Worktree自動管理
```
1. boss1が競合可能性を検出
2. 各workerに別々のworktreeを作成
3. workerは独立したブランチで作業
4. 完了後、各自でpush → PR作成準備
```

## 🧪 確認・デバッグ

### ログ確認
```bash
# 送信ログ
cat logs/send_log.txt

# Worker完了ログ
cat logs/worker_completion.log

# Boss割り当てレポート
ls -la logs/boss_report_*.txt
```

### Worktree確認
```bash
# 作成されたworktree一覧
ls -la /tmp/agent-worktrees/

# 特定プロジェクトのworktree状態
cd /path/to/project && git worktree list
```

## 🔄 環境リセット

```bash
# セッション削除
tmux kill-session -t multiagent
tmux kill-session -t president

# 完了ファイル削除
rm -f ./tmp/worker*_done.txt

# Worktree削除
rm -rf /tmp/agent-worktrees/*

# 再構築
./setup.sh
```

---

🚀 **複数プロジェクトを跨いだAgent協調作業を体感してください！** 🤖✨