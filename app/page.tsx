'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Impact {
    id: number;
    entity: string;
    impact: string;
}

export default function Home() {
    const [currentImpact, setCurrentImpact] = useState<string>('');
    const [impacts, setImpacts] = useState<Impact[]>([]);
    const [loading, setLoading] = useState(true);

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
                const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
                setCurrentImpact(randomImpact.impact);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [impacts]);

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

    return (
        // In your component render:

        // TUNE THESE THREE values to position everything.
        // - --logo-top: vertical position of the logo (from top of viewport)
        // - --logo-h:   visual height of the logo
        // - --gap:      space between logo and the text block
        <div
            style={
                {
                    // Adjust these to taste:
                    ['--logo-top' as any]: '36vh', // move higher: 36vh, lower: 40vh
                    ['--logo-h' as any]: '5rem',   // match your Image height (sm:h-20 = 5rem)
                    ['--gap' as any]: '3vh',       // space between logo and text
                } as React.CSSProperties
            }
        >
            <main
                // padding-top uses the variables so the text always starts beneath the fixed logo
                style={{ paddingTop: 'calc(var(--logo-top) + var(--logo-h) + var(--gap))' }}
                className="min-h-screen bg-background px-4 sm:px-6 flex justify-center"
            >
                {/* Fixed UN logo at an absolute viewport position */}
                <div
                    className="fixed left-1/2 -translate-x-1/2 pointer-events-none select-none"
                    style={{ top: 'var(--logo-top)', zIndex: 10 }}
                >
                    <Image
                        src="/images/UN Logo_Horizontal_English/Colour/UN Logo_Horizontal_Colour_English.svg"
                        alt="UN Logo"
                        width={320}
                        height={80}
                        // height must match --logo-h for perfect spacing
                        className="h-20 w-auto sm:h-20" // 5rem; keep this in sync with --logo-h
                        draggable="false"
                        priority
                    />
                </div>

                {/* Text flows downward only, never overlaps the logo */}
                <div className="max-w-2xl text-center w-full">
                    {loading ? (
                        <p className="text-muted-foreground text-lg">Loading...</p>
                    ) : (
                        <p className="text-foreground text-xl sm:text-2xl md:text-3xl leading-relaxed">
                            {renderTextWithFirstWords(currentImpact)}
                        </p>
                    )}
                </div>
            </main>
        </div>


    );
}
