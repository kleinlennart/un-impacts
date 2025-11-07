'use client';

import { DEFAULT_IMPACT_CONFIG, KEYBOARD_SHORTCUTS, TRANSITION_DURATION } from '@/lib/constants';
import { fetchImpacts, getNextImpact, getPreviousImpact, getRandomImpact } from '@/lib/data/impacts';
import type { Impact } from '@/lib/types/impact';
import { parseTextWithHighlight, preventOrphan } from '@/lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Configuration - modify DEFAULT_IMPACT_CONFIG in lib/constants.ts to change defaults
const CONFIG = DEFAULT_IMPACT_CONFIG;

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
            if (CONFIG.sequentialMode) {
                const next = getNextImpact(impacts, currentIndex);
                setCurrentIndex(next.index);
                setCurrentImpactData(next.impact);
            } else {
                // Random mode
                const nextImpact = getRandomImpact(impacts, currentImpactData || undefined);
                if (nextImpact) {
                    setCurrentImpactData(nextImpact);
                }
            }
            setIsTransitioning(false);
        }, TRANSITION_DURATION);
    }, [impacts, currentImpactData, currentIndex]);

    // Function to go to previous impact
    const goToPrevious = useCallback(() => {
        if (impacts.length === 0) return;

        setIsTransitioning(true);
        setTimeout(() => {
            if (CONFIG.sequentialMode) {
                const prev = getPreviousImpact(impacts, currentIndex);
                setCurrentIndex(prev.index);
                setCurrentImpactData(prev.impact);
            } else {
                // Random mode
                const prevImpact = getRandomImpact(impacts, currentImpactData || undefined);
                if (prevImpact) {
                    setCurrentImpactData(prevImpact);
                }
            }
            setIsTransitioning(false);
        }, TRANSITION_DURATION);
    }, [impacts, currentImpactData, currentIndex]);

    useEffect(() => {
        fetchImpacts()
            .then((data: Impact[]) => {
                // If overwriteId is set, filter to show only that impact
                const filteredData = CONFIG.overwriteId !== null
                    ? data.filter(impact => impact.id === CONFIG.overwriteId)
                    : data;

                setImpacts(filteredData);
                if (filteredData.length > 0) {
                    const startIndex = CONFIG.sequentialMode ? 0 : Math.floor(Math.random() * filteredData.length);
                    setCurrentIndex(startIndex);
                    setCurrentImpactData(filteredData[startIndex]);
                } else if (CONFIG.overwriteId !== null) {
                    console.warn(`Impact with ID ${CONFIG.overwriteId} not found`);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error('Error loading impacts:', e);
                setLoading(false);
            });
    }, []);

    // Auto-advance effect (disabled when showing single impact)
    // Resets timer whenever currentImpactData changes
    useEffect(() => {
        if (impacts.length > 1 && CONFIG.overwriteId === null && currentImpactData) {
            const interval = setInterval(() => {
                goToNext();
            }, CONFIG.autoAdvanceInterval);
            return () => clearInterval(interval);
        }
    }, [impacts, goToNext, currentImpactData]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const nextKeys: readonly string[] = KEYBOARD_SHORTCUTS.NEXT_IMPACT;
            const prevKeys: readonly string[] = KEYBOARD_SHORTCUTS.PREV_IMPACT;
            
            if (nextKeys.includes(event.key)) {
                goToNext();
            } else if (prevKeys.includes(event.key)) {
                goToPrevious();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [goToNext, goToPrevious]);

    // Render text with highlight at the beginning
    const renderTextWithHighlight = (impact: Impact) => {
        const { highlightedText, remainingText } = parseTextWithHighlight(impact.impact, impact.highlight);

        return (
            <>
                {highlightedText && (
                    <span className="text-un-blue font-bold whitespace-nowrap">{highlightedText}</span>
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
                className="h-screen bg-background px-4 sm:px-6 flex justify-center overflow-hidden
                           portrait:flex portrait:justify-center portrait:items-center portrait:!pt-0"
            >
                {/* Fixed UN logo - responsive positioning for landscape and portrait */}
                <div
                    className="fixed top-6 left-4 sm:top-8 sm:left-6 md:top-10 md:left-8 lg:top-12 lg:left-10 
                               pointer-events-none select-none
                               portrait:top-8 portrait:left-6 portrait:md:top-12 portrait:md:left-10"
                    style={{ zIndex: 10 }}
                >
                    <Image
                        src={`${basePath}/images/UN_Logo_Stacked_Colour_English.svg`}
                        alt="UN Logo"
                        width={320}
                        height={80}
                        className="h-12 w-auto sm:h-14 md:h-16 lg:h-20 xl:h-24
                                   portrait:h-16 portrait:sm:h-20 portrait:md:h-24 portrait:lg:h-28"
                        draggable="false"
                        priority
                    />
                </div>

                {/* Text flows downward only, orphan-proofed, with balanced wrapping */}
                <div className="max-w-2xl text-left w-full
                                portrait:max-w-5xl portrait:px-12 portrait:md:px-16 portrait:lg:px-20">
                    {!loading && currentImpactData && (
                        <p
                            className={`text-foreground 
                                        text-3xl sm:text-4xl md:text-5xl 
                                        leading-relaxed tracking-tight
                                        portrait:text-5xl portrait:sm:text-6xl portrait:md:text-7xl portrait:lg:text-8xl 
                                        portrait:leading-tight portrait:tracking-tighter
                                        transition-all duration-600 ease-out transform ${isTransitioning
                                ? 'opacity-0 -translate-x-4 scale-95'
                                : 'opacity-100 translate-x-0 scale-100'
                                }`}
                            style={{
                                textWrap: 'pretty', // optimized for readability in left-aligned text
                                letterSpacing: '-0.02em', // slightly tighter for large text
                            }}
                        >
                            {currentImpactData && renderTextWithHighlight({ ...currentImpactData, impact: prettyImpact })}
                        </p>
                    )}
                </div>
            </main>

            {/* Footnote */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-xs text-gray-400 text-center px-4 whitespace-nowrap
                              portrait:text-sm portrait:md:text-base">
                    Impacts extracted from 2024 Annual Reports of UN System entities.<br />This is an unofficial site.
                </p>
            </footer>

            {/* Sequential mode ID indicator */}
            {CONFIG.sequentialMode && currentImpactData && (
                <div className="fixed bottom-4 right-4 pointer-events-none">
                    <p className="text-xs text-muted-foreground/20">
                        #{currentImpactData.id}
                    </p>
                </div>
            )}

            {/* Overwrite mode indicator */}
            {CONFIG.overwriteId !== null && currentImpactData && (
                <div className="fixed top-4 right-4 pointer-events-none z-50">
                    <p className="text-sm text-white bg-red-600 px-3 py-2 rounded shadow-lg">
                        Showing ID #{CONFIG.overwriteId}
                    </p>
                </div>
            )}
        </div>
    );
}
