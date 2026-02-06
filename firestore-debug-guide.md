# Firestore エラーの対処方法

## 現在のエラー

コンソールに表示されているエラー:
- `resource-exhausted` - Firestoreのクォータ超過
- `WebChannelConnection` - 接続エラー
- `CONNECTION_CLOSED` - 接続が閉じられた

## 対処方法

### 1. Firebase Consoleでクォータを確認

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「watashi-museum」を選択
3. 左メニューから「Firestore Database」を選択
4. 「使用状況」タブでクォータを確認

**無料プランの制限:**
- 読み取り: 50,000/日
- 書き込み: 20,000/日
- 削除: 20,000/日

### 2. 一時的な回避策

もしクォータを超えている場合:

#### A. 明日まで待つ（日次クォータの場合）
- 無料プランの日次制限がリセットされるまで待つ

#### B. Blazeプラン（従量課金）にアップグレード
- Firebase Console → 設定 → 使用量と請求情報 → プランを変更

### 3. Firestoreのリスナーを最適化

現在の実装では、リアルタイムリスナーが常時接続されています。これを最適化します:

```typescript
// useMuseumData.ts の改善案
useEffect(() => {
    if (!museumId) return;
    if (db.app.options.apiKey === "API_KEY") {
        setLoading(false);
        return;
    }

    try {
        const framesRef = collection(db, 'museums', museumId, 'frames');
        
        // リアルタイムリスナーの代わりに一回だけ読み込む（開発中）
        // const unsubscribe = onSnapshot(framesRef, ...);
        
        // 代わりにgetDocsを使用
        getDocs(framesRef).then((snapshot) => {
            const newFrames: Record<string, FrameData> = {};
            snapshot.forEach((doc) => {
                newFrames[doc.id] = doc.data() as FrameData;
            });
            setFrames(newFrames);
            setLoading(false);
        }).catch((err) => {
            console.error("Error fetching frames:", err);
            setLoading(false);
        });

    } catch (e) {
        console.error("Error setting up museum listener:", e);
        setLoading(false);
    }
}, [museumId]);
```

### 4. ローカルテスト用のモックデータ

Firebase接続なしでUIをテストする場合:

```typescript
// 開発中はモックデータを使用
const MOCK_MODE = true; // 本番時はfalseに

if (MOCK_MODE) {
    // モックデータを返す
    return { frames: {}, saveFrame: async () => {}, loading: false };
}
```

## 次のステップ

1. Firebase Consoleでクォータを確認
2. 超過している場合は上記の対処方法を選択
3. 保存ボタンを再度テスト

## 保存ボタンのテスト手順

1. タイトルを入力（必須になりました）
2. 青い「保存する」ボタンをクリック
3. コンソールに以下のログが表示されるか確認:
   - `保存処理を開始します...`
   - `Blob URLから画像を取得中...`
   - など

もしこれらのログが表示されず、代わりにFirebaseエラーだけが表示される場合は、Firebaseのクォータ問題を先に解決する必要があります。
