# Firebase Storage CORS設定ガイド

## 現状

✅ **保存機能は正常に動作しています！**
- 「Firestoreに保存中...」ログが表示
- 画像のアップロードが成功
- Firestoreへのデータ保存も成功

❌ **保存後の画像表示でCORSエラー**
```
Access to image at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## 解決方法

Firebase StorageのCORS設定を追加する必要があります。

### 方法1: Google Cloud Console（ブラウザで完結）

#### ステップ1: Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクト「**watashi-museum**」を選択
3. 左メニュー（☰）→「**Cloud Storage**」→「**バケット**」

#### ステップ2: バケットの権限設定

1. バケット「**watashi-museum.firebasestorage.app**」をクリック
2. 「**権限**」タブをクリック
3. 「**アクセス権を付与**」ボタンをクリック
4. 以下を設定:
   - **新しいプリンシパル**: `allUsers`
   - **ロールを選択**: 「Storage オブジェクト閲覧者」
5. **保存**

これで公開読み取りが有効になります。

---

### 方法2: Google Cloud SDK（推奨、詳細な制御が可能）

#### 前提条件: Google Cloud SDKのインストール

1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) をダウンロード
2. インストーラーを実行
3. インストール完了後、PowerShellまたはコマンドプロンプトを**再起動**

#### CORS設定手順

##### 1. 認証

PowerShellで以下を実行:

```powershell
gcloud auth login
```

ブラウザが開くので、Googleアカウントでログインします。

##### 2. プロジェクトを設定

```powershell
gcloud config set project watashi-museum
```

##### 3. CORS設定を適用

プロジェクトルートに既に `cors.json` ファイルがあります。以下のコマンドで適用:

```powershell
cd C:\Users\2023RENTALPC(S)38\.gemini\antigravity\scratch\watashi-museum
gsutil cors set cors.json gs://watashi-museum.firebasestorage.app
```

##### 4. 設定を確認

```powershell
gsutil cors get gs://watashi-museum.firebasestorage.app
```

以下のような出力が表示されれば成功:

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

---

### 方法3: Firebase CLIを使用（もう一つの選択肢）

#### 前提条件

```powershell
npm install -g firebase-tools
firebase login
```

#### CORS設定

残念ながら、Firebase CLIでは直接CORS設定ができません。上記の方法1または2を使用してください。

---

## 設定後の確認

### 1. ブラウザをリロード

CORS設定を適用したら:

1. ブラウザで `http://localhost:5173` に戻る
2. **Ctrl+Shift+R**（スーパーリロード）でキャッシュをクリア
3. ミュージアムの編集ページに移動
4. フレームをクリックして画像を確認

### 2. 期待される動作

- ✅ 保存ボタンをクリック
- ✅ 「Firestoreに保存中...」ログが表示
- ✅ モーダルが閉じる
- ✅ **画像がフレームに表示される**（CORSエラーなし）

### 3. エラーが続く場合

- ブラウザのキャッシュを完全にクリア（Ctrl+Shift+Delete）
- シークレットモードで再度テスト
- CORS設定の反映に5-10分待つ

---

## トラブルシューティング

### `gsutil` コマンドが見つからない

Google Cloud SDKが正しくインストールされていない可能性があります:

1. インストーラーを再実行
2. PowerShellを再起動
3. `gcloud version` で確認

### 権限エラー

```
AccessDeniedException: 403 ... does not have storage.buckets.get access
```

対処法:
1. Google Cloud Consoleで自分がプロジェクトのオーナーまたは編集者であることを確認
2. Firebase Consoleでログインしているアカウントと同じアカウントで `gcloud auth login` を実行

### CORS設定が反映されない

- 設定後、5-10分待つ
- ブラウザキャッシュを完全にクリア
- `gsutil cors get` コマンドで設定を確認

---

## より安全な設定（本番環境向け）

開発が完了したら、`cors.json` を以下のように変更:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "https://watashi-museum-mp.vercel.app"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
```

これで特定のドメインからのみアクセスを許可できます。

---

## 次のステップ

1. ✅ 保存機能は既に動作している
2. 🔧 CORS設定を適用（上記の方法1または2）
3. ✅ 画像の表示を確認
4. 🚀 Vercelに再デプロイ（本番環境でも動作させる場合）

## まとめ

現在の状況:
- ✅ 私の修正は正しく機能している
- ✅ 保存処理は成功している
- 🔧 CORS設定のみ残っている

CORS設定を完了すれば、全ての機能が正常に動作します！
