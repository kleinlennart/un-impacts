'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { preventOrphan, parseTextWithHighlight } from '@/lib/utils';

// Configuration constants
const SEQUENTIAL_MODE = false; // Set to true for sequential navigation, false for random
const AUTO_ADVANCE_INTERVAL = 5000; // milliseconds

interface Impact {
    id: number;
    entity: string;
    highlight: string;
    impact: string;
}

export default function Home() {
    const [currentImpactData, setCurrentImpactData] = useState<Impact | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [impacts, setImpacts] = useState<Impact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Function to go to next impact
    const goToNext = useCallback(() => {
        if (impacts.length === 0) return;

        setIsTransitioning(true);
        setTimeout(() => {
            if (SEQUENTIAL_MODE) {
                const nextIndex = (currentIndex + 1) % impacts.length;
                setCurrentIndex(nextIndex);
                setCurrentImpactData(impacts[nextIndex]);
            } else {
                // Random mode - existing logic
                const getNextImpact = (): Impact => {
                    if (impacts.length <= 1) {
                        return impacts[0];
                    }

                    let availableImpacts = impacts;

                    // Filter out impacts with same sentence or entity as current
                    if (currentImpactData) {
                        availableImpacts = impacts.filter(impact =>
                            impact.impact !== currentImpactData.impact &&
                            impact.entity !== currentImpactData.entity
                        );
                    }

                    // If no valid impacts found (shouldn't happen with diverse data), 
                    // just filter out the exact same impact
                    if (availableImpacts.length === 0 && currentImpactData) {
                        availableImpacts = impacts.filter(impact =>
                            impact.id !== currentImpactData.id
                        );
                    }

                    // Final fallback to prevent infinite loop
                    if (availableImpacts.length === 0) {
                        availableImpacts = impacts;
                    }

                    return availableImpacts[Math.floor(Math.random() * availableImpacts.length)];
                };

                const nextImpact = getNextImpact();
                setCurrentImpactData(nextImpact);
            }
            setIsTransitioning(false);
        }, 300);
    }, [impacts, currentImpactData, currentIndex]);

    useEffect(() => {
        fetch('/api/impacts')
            .then((r) => r.json())
            .then((data: Impact[]) => {
                setImpacts(data);
                if (data.length > 0) {
                    const startIndex = SEQUENTIAL_MODE ? 0 : Math.floor(Math.random() * data.length);
                    setCurrentIndex(startIndex);
                    setCurrentImpactData(data[startIndex]);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error('Error loading impacts:', e);
                setLoading(false);
            });
    }, []);

    // Auto-advance effect
    useEffect(() => {
        if (impacts.length > 0) {
            const interval = setInterval(() => {
                goToNext();
            }, AUTO_ADVANCE_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [impacts, goToNext]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'n' || event.key === 'N') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [goToNext]);

    // Render text with highlight at the beginning
    const renderTextWithHighlight = (impact: Impact) => {
        const { highlightedText, remainingText } = parseTextWithHighlight(impact.impact, impact.highlight);

        return (
            <>
                {highlightedText && (
                    <span className="text-un-blue font-medium">{highlightedText}</span>
                )}
                {remainingText && (
                    <span className="font-normal">{remainingText}</span>
                )}
            </>
        );
    };

    const prettyImpact = useMemo(() => {
        if (!currentImpactData?.impact) return '';
        return preventOrphan(currentImpactData.impact.trim());
    }, [currentImpactData?.impact]);

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
                    {!loading && currentImpactData && (
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
                            {currentImpactData && renderTextWithHighlight({ ...currentImpactData, impact: prettyImpact })}
                        </p>
                    )}
                </div>
            </main>

            {/* Footnote */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-xs text-muted-foreground/40 text-center px-4">
                    Impacts extracted from the 2024 Annual Reports of UN system entities. This is an unofficial site.
                </p>
            </footer>

            {/* Sequential mode ID indicator */}
            {SEQUENTIAL_MODE && currentImpactData && (
                <div className="fixed bottom-4 right-4 pointer-events-none">
                    <p className="text-xs text-muted-foreground/20">
                        #{currentImpactData.id}
                    </p>
                </div>
            )}
        </div>
    );
}
