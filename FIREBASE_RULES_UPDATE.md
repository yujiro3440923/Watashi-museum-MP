# 他の人にも写真が見えるようにする設定（セキュリティルール変更）

「他の人から写真が見えない」原因は、Firebaseのセキュリティロックがかかっているためです。
以下の手順で、**「読み取り（見るだけ）」を全員に許可**する設定に変更してください。

## ステップ1: Storageルール（画像の表示許可）

1. **[Firebase Console](https://console.firebase.google.com/)** を開く
2. プロジェクト「**Watashi Museum**」を選択
3. 左メニューの **Storage** をクリック
4. 上部のタブから **Rules** をクリック
5. 以下のコードをコピーして、エディタ部分に貼り付け（上書き）してください：

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 誰でも読み取り可能（画像が見えるようになる）
      allow read: if true;
      // 書き込みはログインユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

6. 右上の **Publish（公開）** ボタンをクリック

---

## ステップ2: Firestoreルール（データの表示許可）

画像だけでなく、タイトルや説明文などのデータも見えるようにするために、Firestoreの設定も確認します。

1. 左メニューの **Firestore Database** をクリック
2. 上部のタブから **Rules** をクリック
3. 以下のコードをコピーして貼り付け（上書き）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // 誰でも読み取り可能（データが見えるようになる）
      allow read: if true;
      // 書き込みはログインユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

4. 右上の **Publish（公開）** ボタンをクリック

---

## 確認方法

1. ブラウザの**シークレットウィンドウ**を開く（ログインしていない状態にするため）
2. あなたのミュージアムURL（`.../museum/あなたのID`）を開く
3. 写真が正常に表示されれば成功です！
