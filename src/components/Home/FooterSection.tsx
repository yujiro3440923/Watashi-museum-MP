import React from 'react';

interface FooterSectionProps {
    handleEnterMyMuseum: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ handleEnterMyMuseum }) => {
    return (
        <footer className="w-full py-24 bg-gradient-to-b from-black to-blue-950/20 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-12">
                <h2 className="text-2xl md:text-3xl font-thin tracking-[0.2em] text-white">
                    さあ、静寂の中へ。
                </h2>

                <button
                    onClick={handleEnterMyMuseum}
                    className="px-12 py-4 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-full text-white tracking-widest transition-all duration-300 backdrop-blur-md"
                >
                    美術館をつくる
                </button>

                <div className="pt-12 border-t border-white/5 mt-12">
                    <p className="text-xs text-gray-600 tracking-widest font-sans">
                        © 2026 WATASHI MUSEUM. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
