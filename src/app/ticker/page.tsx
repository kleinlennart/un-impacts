'use client';

import { fetchImpacts } from '@/lib/data/impacts';
import type { Impact } from '@/lib/types/impact';
import { parseTextWithHighlight, preventOrphan } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Shuffle impacts ensuring no consecutive duplicates
const shuffleWithoutConsecutiveDuplicates = (arr: Impact[]): Impact[] => {
    if (arr.length === 0) return [];
    
    const shuffled = [...arr];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Fix any consecutive duplicates
    for (let i = 1; i < shuffled.length; i++) {
        if (shuffled[i].id === shuffled[i - 1].id) {
            // Find a different item to swap with
            let swapIndex = i + 1;
            while (swapIndex < shuffled.length && 
                   (shuffled[swapIndex].id === shuffled[i - 1].id || 
                    shuffled[swapIndex].id === shuffled[i + 1]?.id)) {
                swapIndex++;
            }
            if (swapIndex < shuffled.length) {
                [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
            }
        }
    }
    
    return shuffled;
};

// Create an endless loop of shuffled impacts
const createEndlessImpacts = (baseImpacts: Impact[]): Impact[] => {
    if (baseImpacts.length === 0) return [];
    
    const endless: Impact[] = [];
    // Create multiple shuffled copies to ensure smooth endless scrolling
    for (let i = 0; i < 10; i++) {
        const shuffled = shuffleWithoutConsecutiveDuplicates(baseImpacts);
        
        // Ensure no duplicate between end of previous batch and start of new batch
        if (endless.length > 0 && shuffled.length > 0) {
            const lastImpact = endless[endless.length - 1];
            if (shuffled[0].id === lastImpact.id) {
                // Swap first with second if available
                if (shuffled.length > 1) {
                    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
                }
            }
        }
        
        endless.push(...shuffled);
    }
    
    return endless;
};

export default function TickerPage() {
    const [shuffledImpacts, setShuffledImpacts] = useState<Impact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImpacts()
            .then((data: Impact[]) => {
                setShuffledImpacts(createEndlessImpacts(data));
                setLoading(false);
            })
            .catch((e) => {
                console.error('Error loading impacts:', e);
                setLoading(false);
            });
    }, []);

    // Render text with highlight
    const renderTextWithHighlight = (impact: Impact) => {
        const { highlightedText, remainingText } = parseTextWithHighlight(impact.impact, impact.highlight);

        return (
            <>
                {highlightedText && (
                    <span className="text-un-blue font-extrabold text-[1.125em]">{highlightedText}</span>
                )}
                {remainingText && (
                    <span className="font-normal">{remainingText}</span>
                )}
            </>
        );
    };

    if (loading) {
        return null;
    }

    return (
        <div className="h-screen overflow-hidden bg-background relative">
            {/* Scrolling container */}
            <div className="animate-scroll-up">
                <div className="text-justify" style={{ textAlignLast: 'justify' }}>
                    {shuffledImpacts.map((impact, index) => {
                        const prettyImpact = preventOrphan(impact.impact.trim());
                        
                        return (
                            <span
                                key={`${impact.id}-${index}`}
                                className="inline text-foreground 
                                          text-3xl sm:text-4xl md:text-5xl 
                                          leading-normal tracking-tight"
                                style={{
                                    letterSpacing: '-0.02em',
                                    hyphens: 'auto',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {renderTextWithHighlight({ ...impact, impact: prettyImpact })}
                                {index < shuffledImpacts.length - 1 && (
                                    <span className="mx-4 text-foreground">·</span>
                                )}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
