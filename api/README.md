# Claude Code Communication REST API

エージェント間通信システムのためのREST APIです。

## 機能

- **認証・認可**: JWT & APIキーベースの認証
- **エージェント管理**: CRUD操作
- **メッセージング**: エージェント間のメッセージ送受信
- **エラーハンドリング**: 統一されたエラーレスポンス
- **セキュリティ**: Rate limiting, CORS, Helmet

## エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `POST /api/auth/refresh` - トークンリフレッシュ

### エージェント
- `GET /api/agents` - エージェント一覧
- `GET /api/agents/:id` - エージェント詳細
- `POST /api/agents` - エージェント作成
- `PUT /api/agents/:id` - エージェント更新
- `DELETE /api/agents/:id` - エージェント削除
- `GET /api/agents/:id/status` - エージェントステータス

### メッセージ
- `GET /api/messages` - メッセージ一覧
- `GET /api/messages/:id` - メッセージ詳細
- `POST /api/messages` - メッセージ送信
- `PATCH /api/messages/:id/status` - ステータス更新
- `DELETE /api/messages/:id` - メッセージ削除
- `GET /api/messages/conversation/:agent1/:agent2` - 会話履歴

### ヘルスチェック
- `GET /api/health` - APIヘルスチェック

## セットアップ

```bash
cd api
npm install
cp .env.example .env
# .envファイルを編集して設定を行う
```

## 起動

```bash
# 開発環境
npm run dev

# 本番環境
npm start
```

## テスト

```bash
npm test
```

## 環境変数

- `PORT` - サーバーポート (デフォルト: 3000)
- `NODE_ENV` - 環境 (development/production)
- `JWT_SECRET` - JWT署名用シークレット
- `ALLOWED_ORIGINS` - CORS許可オリジン
- `VALID_API_KEYS` - 有効なAPIキー

## 認証方法

### JWT認証
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/agents
```

### APIキー認証
```bash
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/api/agents
```