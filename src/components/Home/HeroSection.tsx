import React from 'react';

interface HeroSectionProps {
    user: any;
    handleEnterMyMuseum: () => void;
    handleEnterDemo: () => void;
    setShowVisitModal: (show: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    user,
    handleEnterMyMuseum,
    handleEnterDemo,
    setShowVisitModal
}) => {
    return (
        <section className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
            {/* Background Effects (Hero Only) */}
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

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-12 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-xs tracking-[0.2em] text-gray-400">SCROLL DOWN</span>
            </div>
        </section>
    );
};
