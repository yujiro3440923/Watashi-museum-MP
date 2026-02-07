import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from 'firebase/firestore';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Googleログインボタンのコンポーネントを直接埋め込むのではなく、
    // useAuthのlogin関数を使ってデザインを統一する

    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitId, setVisitId] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);

    const handleIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setVisitId(value);

        if (value.length < 3) {
            setSearchResults([]);
            return;
        }

        // Check for default API key but allow execution (might fail if not configured)
        if (db.app.options.apiKey === "API_KEY") {
            console.warn("Using default API_KEY. Search might fail if Firebase is not configured.");
        }

        try {
            // Search museums by ID (document ID)
            const museumsRef = collection(db, 'museums');
            const q = query(
                museumsRef,
                orderBy('__name__'),
                startAt(value),
                endAt(value + '\uf8ff'),
                limit(5)
            );
            const snapshot = await getDocs(q);
            const ids = snapshot.docs.map(doc => doc.id);
            setSearchResults(ids);
        } catch (error) {
            console.error("Error searching museums:", error);
        }
    };

    const handleEnterDemo = () => {
        const demoId = uuidv4();
        navigate(`/museum/${demoId}#edit`);
    };

    const handleEnterMyMuseum = async () => {
        if (user) {
            navigate(`/museum/${user.uid}#edit`);
        } else {
            try {
                await login();
                // login関数内でリダイレクトしない場合、ここで監視が必要だが
                // onAuthStateChangedが発火して再レンダリングされ、
                // 次のクリックで遷移できる。
                // UX向上のため、ログイン成功時のリダイレクトはuseEffectで行うか、
                // ここでawait後に遷移する（ただしloginがPromiseを返す前提）
            } catch (error) {
                // エラーハンドリング
            }
        }
    };

    // ユーザーがログインしたら自動的に自分のミュージアムへ飛ばすロジックは
    // ここでは入れない（ユーザーが選べるようにする）

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const inputId = visitId.trim();
        if (!inputId) return;

        // If default API key, just try to navigate directly (search won't work)
        if (db.app.options.apiKey === "API_KEY") {
            navigate(`/museum/${inputId}`);
            return;
        }

        try {
            // If ID is short or partial, try to find the full ID first
            const museumsRef = collection(db, 'museums');
            const q = query(
                museumsRef,
                orderBy('__name__'),
                startAt(inputId),
                endAt(inputId + '\uf8ff'),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Found a matching museum ID
                const fullId = snapshot.docs[0].id;
                console.log(`Redirecting from partial ID ${inputId} to full ID ${fullId}`);
                navigate(`/museum/${fullId}`);
            } else {
                // No match found, try navigating to input ID anyway
                navigate(`/museum/${inputId}`);
            }
        } catch (error) {
            console.error("Error finding museum:", error);
            navigate(`/museum/${inputId}`);
        }
    };

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden font-serif relative">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="z-10 text-center space-y-12 max-w-4xl px-8 w-full">
                {/* Title Section */}
                <div className="space-y-4 animate-fadeIn">
                    <p className="text-sm tracking-[0.3em] text-gray-400 uppercase">Archive of Silence and Memory</p>
                    <h1 className="text-6xl md:text-8xl font-thin tracking-widest leading-tight">
                        私だけの<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                            美術館
                        </span>
                    </h1>
                    <p className="mt-8 text-lg md:text-xl text-gray-300 font-light leading-relaxed tracking-wide">
                        言葉にならない記憶を、静寂の中に飾る。<br />
                        誰にも邪魔されない、あなただけの空間。
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-12 animate-fadeIn" style={{ animationDelay: '0.3s' }}>

                    {/* Login / My Museum Button */}
                    <button
                        onClick={handleEnterMyMuseum}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-white/50 w-full md:w-auto min-w-[280px] rounded-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative flex flex-col items-center z-10">
                            <span className="text-xl font-medium tracking-widest text-white">
                                {user ? '私の美術館へ' : 'Googleでログイン'}
                            </span>
                            <span className="text-xs text-blue-200 mt-2 font-sans tracking-wide">
                                {user ? '保存された空間を開く' : 'いつまでも残る、あなただけの展示室'}
                            </span>
                        </span>
                    </button>

                    {/* Demo Museum */}
                    <button
                        onClick={handleEnterDemo}
                        className="group relative px-8 py-4 bg-transparent border border-white/10 transition-all duration-300 hover:border-white/30 w-full md:w-auto min-w-[280px] rounded-lg"
                    >
                        <span className="flex flex-col items-center">
                            <span className="text-lg font-light tracking-widest text-gray-300 group-hover:text-white transition-colors">
                                体験入館
                            </span>
                            <span className="text-xs text-gray-500 mt-2 font-sans tracking-wide group-hover:text-gray-400 transition-colors">
                                登録なしですぐに試す
                            </span>
                        </span>
                    </button>

                    {/* Visit Other Museum */}
                    <button
                        onClick={() => setShowVisitModal(true)}
                        className="group relative px-8 py-4 bg-transparent border border-white/10 transition-all duration-300 hover:border-white/30 w-full md:w-auto min-w-[280px] rounded-lg"
                    >
                        <span className="flex flex-col items-center">
                            <span className="text-lg font-light tracking-widest text-gray-300 group-hover:text-white transition-colors">
                                誰かの美術館へ
                            </span>
                            <span className="text-xs text-gray-500 mt-2 font-sans tracking-wide group-hover:text-gray-400 transition-colors">
                                IDを入力して入館
                            </span>
                        </span>
                    </button>

                </div>
            </div>

            {/* Visit Modal */}
            {showVisitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md p-8 bg-black/80 border border-white/10 rounded-2xl shadow-2xl animate-scaleIn mx-4">
                        <button
                            onClick={() => setShowVisitModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-thin tracking-widest text-center mb-8 text-white">
                            美術館を訪れる
                        </h2>

                        <form onSubmit={handleVisitSubmit} className="space-y-6">
                            <div className="space-y-2 relative">
                                <label className="text-xs text-gray-400 tracking-wider block text-center">
                                    MUSEUM ID
                                </label>
                                <input
                                    type="text"
                                    value={visitId}
                                    onChange={handleIdChange}
                                    placeholder="IDを入力（例: a1b2...）"
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-center text-white focus:outline-none focus:border-blue-400/50 transition-colors tracking-widest font-sans placeholder-gray-600"
                                    autoFocus
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-xl text-left">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result}
                                                type="button"
                                                onClick={() => {
                                                    navigate(`/museum/${result}`);
                                                }}
                                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer group border-b border-gray-100 last:border-0"
                                            >
                                                <span className="text-gray-400 group-hover:text-gray-600">🔍</span>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-sans text-sm font-medium text-gray-900">{result}</span>
                                                    <span className="text-xs text-blue-600 truncate underline decoration-blue-600/30">
                                                        {window.location.origin}/museum/{result}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!visitId.trim()}
                                className="w-full py-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 rounded-lg font-medium tracking-widest hover:bg-white/5 hover:border-white/30 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                入館する
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
                <p className="text-xs text-gray-600 tracking-widest font-sans">
                    © 2026 WATASHI MUSEUM. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
};
