
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
            .then(response => response.json())
            .then((data: Impact[]) => {
                setImpacts(data);
                if (data.length > 0) {
                    setCurrentImpact(data[Math.floor(Math.random() * data.length)].impact);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading impacts:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (impacts.length > 0) {
            const interval = setInterval(() => {
                const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
                setCurrentImpact(randomImpact.impact);
            }, 5000); // Change impact every 5 seconds

            return () => clearInterval(interval);
        }
    }, [impacts]);

    const renderTextWithFirstWords = (text: string) => {
        // Split text into sentences based on common sentence endings
        const sentences = text.split(/([.!?]+\s+)/).filter(Boolean);

        return sentences.map((sentence, index) => {
            // Skip if this is just punctuation/whitespace
            if (/^[.!?\s]+$/.test(sentence)) {
                return sentence;
            }

            // Find the first word (sequence of non-whitespace characters)
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
        <main className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
            <div className="text-center">
                {/* Logo - Fixed position relative to center */}
                <div className="absolute -translate-y-25 left-1/2 -translate-x-1/2">
                    <Image
                        src="/images/UN Logo_Horizontal_English/Colour/UN Logo_Horizontal_Colour_English.svg"
                        alt="UN Logo"
                        width={320}
                        height={80}
                        className="h-16 sm:h-20 w-auto select-none"
                        draggable="false"
                    />
                </div>

                {/* Content - Centered text that can expand down */}
                <div className="max-w-2xl">
                    {loading ? (
                        <p className="text-muted-foreground text-lg">Loading...</p>
                    ) : (
                        <p className="text-foreground text-xl sm:text-2xl md:text-3xl leading-relaxed">
                            {renderTextWithFirstWords(currentImpact)}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
