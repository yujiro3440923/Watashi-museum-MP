import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [showVisitModal, setShowVisitModal] = React.useState(false);
    const [visitId, setVisitId] = React.useState('');

    const handleEnterDemo = () => {
        const demoId = uuidv4();
        navigate(`/museum/${demoId}#edit`);
    };

    const handleEnterMyMuseum = () => {
        if (user) {
            navigate(`/museum/${user.uid}#edit`);
        } else {
            login();
        }
    };

    const handleVisitSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (visitId.trim()) {
            navigate(`/museum/${visitId.trim()}`);
        }
    };

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden font-serif">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="z-10 text-center space-y-12 max-w-4xl px-8">
                {/* Title Section */}
                <div className="space-y-4">
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
                <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">

                    {/* User Personal Museum */}
                    <button
                        onClick={handleEnterMyMuseum}
                        className="group relative px-8 py-4 bg-white/5 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-white/50 w-full md:w-auto min-w-[280px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative flex flex-col items-center">
                            <span className="text-xl font-medium tracking-widest">
                                {user ? '私の美術館へ' : 'ログインして作成'}
                            </span>
                            <span className="text-xs text-gray-400 mt-2 font-sans tracking-wide">
                                {user ? '保存された空間を開く' : 'Googleアカウントで保存'}
                            </span>
                        </span>
                    </button>

                    {/* Visit Other Museum */}
                    <button
                        onClick={() => setShowVisitModal(true)}
                        className="group relative px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-white/30 w-full md:w-auto min-w-[280px]"
                    >
                        <span className="relative flex flex-col items-center">
                            <span className="text-xl font-medium tracking-widest">
                                他の美術館へ
                            </span>
                            <span className="text-xs text-gray-400 mt-2 font-sans tracking-wide">
                                IDを入力して入館
                            </span>
                        </span>
                    </button>

                    {/* Demo Museum */}
                    <button
                        onClick={handleEnterDemo}
                        className="group relative px-8 py-4 bg-transparent border border-white/10 transition-all duration-300 hover:border-white/30 w-full md:w-auto min-w-[280px]"
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
                </div>
            </div>

            {/* Visit Modal */}
            {showVisitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md p-8 bg-black/80 border border-white/10 rounded-2xl shadow-2xl animate-scaleIn">
                        <button
                            onClick={() => setShowVisitModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-thin tracking-widest text-center mb-8">
                            美術館を訪れる
                        </h2>

                        <form onSubmit={handleVisitSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 tracking-wider block text-center">
                                    MUSEUM ID
                                </label>
                                <input
                                    type="text"
                                    value={visitId}
                                    onChange={(e) => setVisitId(e.target.value)}
                                    placeholder="IDを入力してください"
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-center text-white focus:outline-none focus:border-blue-400/50 transition-colors tracking-widest font-sans placeholder-gray-600"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!visitId.trim()}
                                className="w-full py-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 rounded-lg font-medium tracking-widest hover:bg-white/5 hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                入館する
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="absolute bottom-8 text-center w-full z-10">
                <p className="text-xs text-gray-600 tracking-widest font-sans">
                    © 2026 WATASHI MUSEUM. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
};
