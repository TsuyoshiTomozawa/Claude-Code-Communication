#!/bin/bash

# 🛠️ Worker用ヘルパースクリプト
# メッセージから作業ディレクトリを抽出して移動

# メッセージから作業ディレクトリを抽出
extract_work_dir() {
    local message="$1"
    echo "$message" | grep -oP '\[作業DIR: \K[^\]]+' || echo ""
}

# プロジェクトタイプをチェック
check_project_type() {
    local dir="$1"
    if [[ -d "$dir/.git" ]]; then
        echo "git"
    else
        echo "normal"
    fi
}

# Workerの作業環境セットアップ
setup_work_environment() {
    local message="$1"
    local work_dir=$(extract_work_dir "$message")
    
    if [[ -n "$work_dir" ]]; then
        echo "📁 作業ディレクトリ: $work_dir"
        
        # ディレクトリ存在確認
        if [[ ! -d "$work_dir" ]]; then
            echo "❌ エラー: ディレクトリが存在しません: $work_dir"
            return 1
        fi
        
        # ディレクトリ移動
        cd "$work_dir" || {
            echo "❌ エラー: ディレクトリに移動できません: $work_dir"
            return 1
        }
        
        # プロジェクトタイプ確認
        local proj_type=$(check_project_type "$work_dir")
        echo "📦 プロジェクトタイプ: $proj_type"
        
        if [[ "$proj_type" == "git" ]]; then
            echo "🌿 現在のブランチ: $(git branch --show-current)"
            echo "📊 ステータス:"
            git status -s
        fi
        
        echo "✅ 作業環境準備完了"
        echo "------------------------"
        return 0
    else
        echo "ℹ️  作業ディレクトリ指定なし（現在のディレクトリで作業）"
        return 0
    fi
}

# 作業完了報告ヘルパー
report_completion() {
    local worker_name="$1"
    local task_desc="$2"
    local boss_name="${3:-boss1}"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $worker_name: $task_desc 完了" >> logs/worker_completion.log
    
    # agent-send-v2.shを使って報告
    if [[ -x "./agent-send-v2.sh" ]]; then
        ./agent-send-v2.sh "$boss_name" "$worker_name: $task_desc を完了しました"
    else
        echo "⚠️  agent-send-v2.sh が見つかりません"
    fi
}

# メイン処理（直接実行時）
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "$1" in
        setup)
            setup_work_environment "$2"
            ;;
        report)
            report_completion "$2" "$3" "$4"
            ;;
        *)
            cat << EOF
Worker Helper Script

使用方法:
  $0 setup "[メッセージ]"         - 作業環境をセットアップ
  $0 report [worker名] [タスク説明] [boss名] - 完了報告

例:
  $0 setup "テスト実行 [作業DIR: /path/to/project]"
  $0 report worker1 "単体テスト実行" boss1
EOF
            ;;
    esac
fi