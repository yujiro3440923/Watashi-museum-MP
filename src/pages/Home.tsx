import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from 'firebase/firestore';

// Page Sections
import { HeroSection } from '../components/Home/HeroSection';
import { ConceptSection } from '../components/Home/ConceptSection';
import { HowToSection } from '../components/Home/HowToSection';
import { FooterSection } from '../components/Home/FooterSection';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
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

        // Check for default API key
        if (db.app.options.apiKey === "API_KEY") {
            console.warn("Using default API_KEY. Search might fail.");
        }

        try {
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
            } catch (error) {
                // Error handled by Auth provider usually
            }
        }
    };

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const inputId = visitId.trim();
        if (!inputId) return;

        if (db.app.options.apiKey === "API_KEY") {
            navigate(`/museum/${inputId}`);
            return;
        }

        try {
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
                const fullId = snapshot.docs[0].id;
                console.log(`Redirecting from partial ID ${inputId} to full ID ${fullId}`);
                navigate(`/museum/${fullId}`);
            } else {
                navigate(`/museum/${inputId}`);
            }
        } catch (error) {
            console.error("Error finding museum:", error);
            navigate(`/museum/${inputId}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-black text-white font-serif overflow-x-hidden">
            {/* 1. Hero Section (Top View) */}
            <HeroSection
                user={user}
                handleEnterMyMuseum={handleEnterMyMuseum}
                handleEnterDemo={handleEnterDemo}
                setShowVisitModal={setShowVisitModal}
            />

            {/* 2. Concept Section (About) */}
            <ConceptSection />

            {/* 3. Usage Guide (How it works) */}
            <HowToSection />

            {/* 4. Footer (Action) */}
            <FooterSection handleEnterMyMuseum={handleEnterMyMuseum} />

            {/* Visit Modal (Overlay) */}
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
        </div>
    );
};
