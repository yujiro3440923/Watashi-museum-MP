# Firebase Storage CORS設定ガイド

## 問題

Vercelにデプロイされた本番環境から Firebase Storageへのアクセスが、CORSポリシーによってブロックされています。

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'https://watashi-museum-mp.vercel.app' 
has been blocked by CORS policy
```

## 解決方法

### オプション1: Firebase Console（GUI）で設定

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「watashi-museum」を選択
3. 左メニューから「Storage」を選択
4. 「Rules」タブで以下のルールを設定:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null || true;
    }
  }
}
```

> **注意**: 上記は開発用の設定です。本番環境では適切な認証ルールを追加してください。

### オプション2: Google Cloud Console（推奨）

Firebase StorageはGoogle Cloud Storageを使用しているため、Google Cloud Consoleから設定できます。

#### ステップ1: Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「watashi-museum」を選択
3. 左メニューから「Cloud Storage」→「バケット」を選択
4. バケット「watashi-museum.firebasestorage.app」をクリック

#### ステップ2: 権限設定

1. 「権限」タブをクリック
2. 「プリンシパルを追加」をクリック
3. 新しいプリンシパル: `allUsers`
4. ロール: 「Storage オブジェクト閲覧者」を選択
5. 保存

#### ステップ3: CORS設定（gsutilコマンド）

**前提条件**: Google Cloud SDKがインストールされている必要があります

```bash
# Google Cloud SDKのインストール（未インストールの場合）
# https://cloud.google.com/sdk/docs/install からダウンロード

# 認証
gcloud auth login

# プロジェクトを設定
gcloud config set project watashi-museum

# CORS設定を適用
gsutil cors set cors.json gs://watashi-museum.firebasestorage.app

# 設定を確認
gsutil cors get gs://watashi-museum.firebasestorage.app
```

`cors.json` ファイルの内容は、プロジェクトルートに既に作成されています。

### オプション3: ブラウザベースのアップロード（手動設定）

Google Cloud Consoleのブラウザインターフェースから:

1. バケットの「構成」タブを開く
2. 「CORS」セクションを探す
3. 「編集」をクリック
4. 以下のJSON設定を追加:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
```

## より安全な設定（本番環境推奨）

開発が完了したら、ワイルドカード `*` を具体的なドメインに変更してください:

```json
[
  {
    "origin": ["https://watashi-museum-mp.vercel.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
```

## 確認方法

1. CORS設定を適用後、ブラウザのキャッシュをクリア
2. Vercelの本番環境でページをリロード
3. 保存ボタンをクリック
4. エラーが解消されているか確認

## ローカル環境でのテスト

CORS設定を待たずに、まずは**ローカル環境**でテストすることをお勧めします:

1. ブラウザで `http://localhost:5173` を開く
2. ミュージアムページ（`/museum/{id}#edit`）に移動
3. 保存ボタンをテスト

ローカル環境では、修正済みのコードと詳細なログが確認できます。

## トラブルシューティング

### CORS設定が反映されない場合

- ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
- シークレットモードで再度テスト
- 設定反映まで5-10分待つ

### gsutilコマンドが使えない場合

- Firebase ConsoleまたはGoogle Cloud Consoleのブラウザインターフェースを使用
- またはFirebaseサポートに連絡

## 次のステップ

1. **まずローカル環境でテスト** (`http://localhost:5173`)
2. ローカルで動作確認後、Vercelに再デプロイ
3. Firebase StorageのCORS設定を適用
4. 本番環境で最終確認
