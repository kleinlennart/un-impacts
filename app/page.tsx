'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';

interface Impact {
    id: number;
    entity: string;
    impact: string;
}

export default function Home() {
    const [currentImpact, setCurrentImpact] = useState<string>('');
    const [impacts, setImpacts] = useState<Impact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        fetch('/data/impacts.json')
            .then((r) => r.json())
            .then((data: Impact[]) => {
                setImpacts(data);
                if (data.length > 0) {
                    setCurrentImpact(data[Math.floor(Math.random() * data.length)].impact);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error('Error loading impacts:', e);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (impacts.length > 0) {
            const interval = setInterval(() => {
                setIsTransitioning(true);

                // Start fade out
                setTimeout(() => {
                    const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
                    setCurrentImpact(randomImpact.impact);
                    setIsTransitioning(false);
                }, 300); // Half of transition duration
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [impacts]);

    // --- Typography helpers -------------------------------------------------
    // Prevent a single orphan word by binding the last two words with \u00A0.
    const preventOrphan = (text: string) => {
        const words = text.trim().split(' ');
        if (words.length < 2) return text;
        return words.slice(0, -1).join(' ') + '\u00A0' + words[words.length - 1];
    };

    // Highlight first word of each sentence (keeps punctuation), applied AFTER orphan fix.
    const renderTextWithFirstWords = (text: string) => {
        const sentences = text.split(/([.!?]+\s+)/).filter(Boolean);
        return sentences.map((sentence, index) => {
            if (/^[.!?\s]+$/.test(sentence)) return sentence;
            const words = sentence.split(/(\s+)/);
            if (words.length === 0) return sentence;
            const firstWord = words[0];
            const restOfSentence = words.slice(1).join('');
            return (
                <span key={index}>
                    <span className="text-un-blue font-medium">{firstWord}</span>
                    <span className="font-normal">{restOfSentence}</span>
                </span>
            );
        });
    };

    const prettyImpact = useMemo(() => preventOrphan(currentImpact), [currentImpact]);

    // --- Layout knobs (set-and-forget) --------------------------------------
    // TUNE THESE THREE values to position everything.
    // - --logo-top: vertical position of the logo (from top of viewport)
    // - --logo-h:   visual height of the logo
    // - --gap:      space between logo and the text block
    return (
        <div
            style={{
                '--logo-top': '36vh', // move higher: 34vh, lower: 38-40vh
                '--logo-h': '5rem',   // must match the Image height below
                '--gap': '4vh',       // extra breathing room above the text
            } as React.CSSProperties}
        >
            <main
                // Text always starts beneath the fixed logo; adjust only the vars above.
                style={{ paddingTop: 'calc(var(--logo-top) + var(--logo-h) + var(--gap))' }}
                className="min-h-screen bg-background px-4 sm:px-6 flex justify-center"
            >
                {/* Fixed UN logo at a precise viewport position (does not move) */}
                <div
                    className="fixed left-1/2 -translate-x-1/2 pointer-events-none select-none"
                    style={{ top: 'var(--logo-top)', zIndex: 10 }}
                >
                    <Image
                        src="/images/UN Logo_Horizontal_English/Colour/UN Logo_Horizontal_Colour_English.svg"
                        alt="UN Logo"
                        width={320}
                        height={80}
                        className="h-20 w-auto sm:h-20" // 5rem; keep in sync with --logo-h
                        draggable="false"
                        priority
                    />
                </div>

                {/* Text flows downward only, orphan-proofed, with balanced wrapping */}
                <div className="max-w-2xl text-center w-full">
                    {loading ? (
                        <p className="text-muted-foreground text-lg transition-all duration-600 ease-out">
                            Loading...
                        </p>
                    ) : (
                        <p
                            className={`text-foreground text-xl sm:text-2xl md:text-3xl leading-normal transition-all duration-600 ease-out transform ${isTransitioning
                                ? 'opacity-0 -translate-x-4 scale-95'
                                : 'opacity-100 translate-x-0 scale-100'
                                }`}
                            style={{
                                textWrap: 'balance', // nicer line balance (supported in modern browsers)
                                overflowWrap: 'anywhere',
                                wordBreak: 'normal',
                            }}
                        >
                            {renderTextWithFirstWords(prettyImpact)}
                        </p>
                    )}
                </div>
            </main>

            {/* Footnote */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-xs text-muted-foreground/40 text-center px-4">
                    Impacts extracted from 2024 Annual Reports for UN system entities. This is an unoffical site.
                </p>
            </footer>
        </div>
    );
}
