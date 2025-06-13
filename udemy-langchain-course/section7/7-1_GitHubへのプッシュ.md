# セクション7-1: GitHubへのプッシュ

## イントロダクション

みなさん、こんにちは。

前回までで、ローカル環境でRAGアプリケーションが正常に動作することを確認しました。

今回からは、作成したアプリケーションをWebに公開する手順を説明します。

まず最初に、コードをGitHubにプッシュする手順から始めましょう。

## GitHubリポジトリの作成

それでは、GitHubにアクセスして、新しいリポジトリを作成します。

ブラウザでGitHubにログインしてください。

右上の「＋」ボタンをクリックして、「New repository」を選択します。

リポジトリ名は「company-doc-search-app」としましょう。

説明文には「LangChainとChatGPTを使った社内文書検索AI」と入力します。

リポジトリは「Public」に設定してください。

Streamlit Cloudでデプロイする際、パブリックリポジトリである必要があります。

「Create repository」をクリックして、リポジトリを作成します。

## Gitの初期設定

では、ローカルのプロジェクトフォルダに戻りましょう。

ターミナルを開いて、プロジェクトのルートディレクトリに移動します。

```bash
cd company-doc-search-app
```

まず、Gitを初期化します。

```bash
git init
```

次に、`.gitignore`ファイルを作成しましょう。

```bash
touch .gitignore
```

`.gitignore`ファイルを開いて、以下の内容を追加します。

```
# Python
__pycache__/
*.py[cod]
*$py.class
.Python
env/
venv/
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Project specific
documents/
*.pdf
chroma_db/
```

これで、不要なファイルやセキュリティ上問題のあるファイルがGitHubにアップロードされないようになります。

## 環境変数の管理

ここで重要なポイントがあります。

`.env`ファイルには、OpenAIのAPIキーが含まれています。

このファイルは絶対にGitHubにプッシュしてはいけません。

代わりに、`.env.example`ファイルを作成しましょう。

```bash
touch .env.example
```

`.env.example`ファイルに以下の内容を記述します。

```
OPENAI_API_KEY=your-api-key-here
```

これで、他の開発者が必要な環境変数を理解できるようになります。

## requirements.txtの作成

デプロイ時に必要なパッケージを記録するため、`requirements.txt`を作成します。

```bash
pip freeze > requirements.txt
```

ただし、生成されたファイルを確認して、不要なパッケージは削除してください。

最低限必要なパッケージは以下の通りです：

```
streamlit
langchain
openai
chromadb
pypdf
python-dotenv
```

## コミットとプッシュ

それでは、すべてのファイルをGitに追加しましょう。

```bash
git add .
```

追加されるファイルを確認します。

```bash
git status
```

`.env`ファイルが含まれていないことを必ず確認してください。

問題なければ、コミットを作成します。

```bash
git commit -m "Initial commit: RAG application with Streamlit"
```

次に、GitHubのリモートリポジトリを追加します。

GitHubのリポジトリページに表示されているURLをコピーして、以下のコマンドを実行します。

```bash
git remote add origin https://github.com/あなたのユーザー名/company-doc-search-app.git
```

最後に、コードをプッシュします。

```bash
git branch -M main
git push -u origin main
```

## プッシュの確認

GitHubのリポジトリページをリロードしてください。

コードが正常にアップロードされていることを確認できるはずです。

`.env`ファイルが含まれていないこと、`.env.example`ファイルが存在することを確認してください。

## まとめ

今回は、RAGアプリケーションをGitHubにプッシュする手順を説明しました。

重要なポイントは：
- `.gitignore`ファイルで不要なファイルを除外する
- APIキーなどの機密情報は絶対にプッシュしない
- `requirements.txt`でパッケージの依存関係を管理する

次回は、Streamlit Cloudを使って、このアプリケーションをWebに公開する手順を説明します。

それでは、次のレッスンでお会いしましょう。