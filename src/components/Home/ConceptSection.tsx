import React, { useEffect, useRef } from 'react';

export const ConceptSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, { threshold: 0.2 });

        const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="w-full min-h-[80vh] flex flex-col items-center justify-center py-24 bg-black relative">
            <div className="max-w-3xl px-8 text-center space-y-16">
                <h2 className="text-3xl md:text-4xl font-thin tracking-widest text-white/90 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000">
                    CONCEPT
                </h2>

                <div className="space-y-12">
                    <p className="text-lg md:text-xl text-gray-400 font-light leading-loose tracking-wide animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-200">
                        日々の喧騒の中で流れていく、<br />
                        言葉にならない感情や記憶。
                    </p>
                    <p className="text-lg md:text-xl text-gray-400 font-light leading-loose tracking-wide animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-400">
                        それらを一枚の絵として飾り、<br />
                        静かに眺めるための場所です。
                    </p>
                    <p className="text-lg md:text-xl text-gray-400 font-light leading-loose tracking-wide animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-600">
                        ここには「いいね」も「コメント」もありません。<br />
                        あるのは、あなたと、あなたの記憶だけ。
                    </p>
                </div>
            </div>

            {/* Minimal decoration */}
            <div className="absolute top-1/2 left-0 w-32 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
            <div className="absolute top-1/2 right-0 w-32 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
        </section>
    );
};
