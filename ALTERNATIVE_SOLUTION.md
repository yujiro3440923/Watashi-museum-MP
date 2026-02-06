# CORS問題の代替解決方法

## 現状

- ✅ 保存機能は完璧に動作
- ❌ Firebase StorageのCORSエラーで画像が表示されない
- ❌ `gsutil`コマンドが認識されない

## 解決方法オプション

### オプション1: Firebase Consoleで直接設定（最も簡単）

実は、Firebase Consoleから直接CORS設定はできません。しかし、**Storage Rulesで公開読み取りを有効にする**ことで、一部のCORSエラーを回避できる場合があります。

#### 手順

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「Watashi Museum」を選択
3. Storage → Rules
4. 以下のルールに変更:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null || true;
    }
  }
}
```

5. 「公開」をクリック

### オプション2: プロキシサーバーを使用（開発用）

ViteのプロキシでFirebase Storageへのリクエストを中継します。

#### vite.config.ts を編集

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/storage': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, ''),
      }
    }
  }
})
```

その後、画像URLを変更する必要があります（複雑）。

### オプション3: Google Cloud Console（ブラウザ操作）

#### ステップ1: バケットの公開設定

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクト「Watashi Museum」を選択
3. Cloud Storage → バケット
4. `watashi-museum.firebasestorage.app` をクリック
5. 「権限」タブ
6. 「アクセス権を付与」
7. 以下を設定:
   - **新しいプリンシパル**: `allUsers`
   - **ロール**: 「Storage オブジェクト閲覧者」
8. 保存

#### ステップ2: バケットレベルのCORS設定（ブラウザから）

残念ながら、Google Cloud ConsoleのブラウザUIからは直接CORS設定ができません。

### オプション4: Cloud Shellを使用（推奨）

Google Cloud Consoleの中に **Cloud Shell** という機能があり、ブラウザ内でコマンドを実行できます。

#### 手順

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクト「Watashi Museum」を選択
3. 右上の **Cloud Shell** アイコン（>_）をクリック
4. Cloud Shellが開いたら、以下のコマンドを実行:

```bash
# CORS設定ファイルを作成
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type"]
  }
]
EOF

# CORS設定を適用
gsutil cors set cors.json gs://watashi-museum.firebasestorage.app

# 設定を確認
gsutil cors get gs://watashi-museum.firebasestorage.app
```

5. 最後のコマンドでJSON設定が表示されれば成功

### オプション5: 一時的な回避策（コード変更）

画像の読み込み方法を変更して、CORSエラーを回避します。

#### Frame.tsx を修正

`@react-three/drei` の `Image` コンポーネントは内部で `crossOrigin` を設定するため、Firebase Storageからの画像読み込みでCORSエラーが発生します。

代わりに、`<mesh>` と `<meshBasicMaterial>` を使用します。

```typescript
// Frame.tsx の修正案
import { useTexture } from '@react-three/drei';

// ImageコンポーネントをuseTextureに変更
{imageUrl ? (
    <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial>
            <primitive attach="map" object={useTexture(imageUrl)} />
        </meshBasicMaterial>
    </mesh>
) : (
    // 既存のコード
)}
```

しかし、これも `useTexture` が内部でCORSを使用するため、根本的な解決にはなりません。

## 推奨する解決順序

1. **まずオプション4（Cloud Shell）を試す** - 最も確実
2. ダメならオプション3（公開設定）を試す
3. それでもダメなら後でGoogle Cloud SDKを正しくインストール

## Cloud Shellの使い方（詳細）

### Cloud Shellとは？

Googleが提供するブラウザベースのターミナル。`gsutil`などのツールが最初から使えます。

### アクセス方法

1. [https://console.cloud.google.com/](https://console.cloud.google.com/) を開く
2. 右上の **>_** アイコンをクリック
3. 下部にターミナルが表示される

### 利点

- インストール不要
- `gsutil`が最初から使える
- プロジェクトが自動的に設定される

## 次のステップ

**オプション4（Cloud Shell）を強くお勧めします。** ブラウザだけで完結し、5分で完了します。

試してみますか？
