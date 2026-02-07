import React from 'react';

const StepCard: React.FC<{ step: string; title: string; desc: string; icon: string }> = ({ step, title, desc, icon }) => (
    <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 h-full">
        <div className="text-4xl mb-2">{icon}</div>
        <div className="text-xs text-blue-300 font-mono tracking-widest">{step}</div>
        <h3 className="text-xl font-light tracking-wide text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed font-sans">
            {desc}
        </p>
    </div>
);

export const HowToSection: React.FC = () => {
    return (
        <section className="w-full py-32 bg-black relative">
            <div className="max-w-6xl mx-auto px-8">
                <h2 className="text-3xl font-thin tracking-widest text-center mb-20 text-white/90">
                    HOW TO USE
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StepCard
                        step="STEP 01"
                        icon="🖼️"
                        title="飾る - Upload"
                        desc="お気に入りの画像や、生成した画像をアップロード。タイトルと説明を添えて、空間に配置します。"
                    />
                    <StepCard
                        step="STEP 02"
                        icon="📐"
                        title="整える - Curate"
                        desc="額縁の向きを変えたり、並べ替えたり。あなただけの展示順路を作り上げましょう。"
                    />
                    <StepCard
                        step="STEP 03"
                        icon="🕯️"
                        title="浸る・招く - Immerse"
                        desc="静かな音楽と共に、空間を歩き回る。大切な人だけに招待状（ID）を渡して、招くこともできます。"
                    />
                </div>
            </div>
        </section>
    );
};
