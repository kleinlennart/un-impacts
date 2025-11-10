'use client';

import { DEFAULT_IMPACT_CONFIG, KEYBOARD_SHORTCUTS, TRANSITION_DURATION } from '@/lib/constants';
import { fetchImpacts, getNextImpact, getPreviousImpact, getRandomImpact } from '@/lib/data/impacts';
import type { Impact } from '@/lib/types/impact';
import { parseTextWithHighlight, preventOrphan } from '@/lib/utils';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Configuration - modify DEFAULT_IMPACT_CONFIG in lib/constants.ts to change defaults
const CONFIG = DEFAULT_IMPACT_CONFIG;

export default function Home() {
    const [currentImpactData, setCurrentImpactData] = useState<Impact | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [impacts, setImpacts] = useState<Impact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [jumpDialogOpen, setJumpDialogOpen] = useState(false);
    const [jumpValue, setJumpValue] = useState('');

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

    // Function to jump to specific index by ID
    const jumpToId = useCallback((id: number) => {
        if (impacts.length === 0) return;

        const targetIndex = impacts.findIndex(impact => impact.id === id);
        if (targetIndex !== -1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(targetIndex);
                setCurrentImpactData(impacts[targetIndex]);
                setIsTransitioning(false);
            }, TRANSITION_DURATION);
        }
    }, [impacts]);

    // Handle jump dialog submission
    const handleJumpSubmit = useCallback((e?: React.FormEvent) => {
        e?.preventDefault();
        const id = parseInt(jumpValue, 10);
        if (!isNaN(id) && id > 0) {
            jumpToId(id);
            setJumpDialogOpen(false);
            setJumpValue('');
        }
    }, [jumpValue, jumpToId]);

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
            const jumpKeys: readonly string[] = KEYBOARD_SHORTCUTS.JUMP_TO_INDEX;
            
            if (nextKeys.includes(event.key)) {
                goToNext();
            } else if (prevKeys.includes(event.key)) {
                goToPrevious();
            } else if (jumpKeys.includes(event.key) && CONFIG.sequentialMode) {
                setJumpDialogOpen(true);
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
                    <span className="text-un-blue font-extrabold text-[1.1em]">{highlightedText}</span>
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
                className="h-screen bg-background flex justify-center items-start overflow-hidden
                           portrait:flex portrait:justify-center portrait:items-center portrait:!pt-0"
            >
                {/* Fixed UN logo - responsive positioning for landscape and portrait */}
                <div
                    className="fixed top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 
                               pointer-events-none select-none
                               portrait:top-6 portrait:left-6 portrait:md:top-10 portrait:md:left-10"
                    style={{ zIndex: 10 }}
                >
                    <Image
                        src="/images/UN_Logo_Stacked_Colour_English.svg"
                        alt="UN Logo"
                        width={320}
                        height={80}
                        className="h-6 w-auto sm:h-7 md:h-8 lg:h-10 xl:h-12
                                   portrait:h-8 portrait:sm:h-10 portrait:md:h-12 portrait:lg:h-14"
                        draggable="false"
                        priority
                    />
                </div>

                {/* Text box with fixed margins - keeps same distance from left and right */}
                <div className="w-full pl-12 pr-12 sm:pl-16 sm:pr-16 md:pl-20 md:pr-20 lg:pl-24 lg:pr-24 xl:pl-32 xl:pr-32
                                portrait:pl-16 portrait:pr-16 portrait:md:pl-20 portrait:md:pr-20 portrait:lg:pl-24 portrait:lg:pr-24
                                overflow-hidden">
                    <div className="text-left">
                        {!loading && currentImpactData && (
                            <p
                                className={`text-foreground 
                                            text-3xl sm:text-4xl md:text-5xl 
                                            leading-normal tracking-tight
                                            portrait:text-4xl portrait:sm:text-5xl portrait:md:text-6xl portrait:lg:text-7xl 
                                            portrait:leading-tight portrait:tracking-tighter
                                            transition-all duration-600 ease-out transform ${isTransitioning
                                    ? 'opacity-0 -translate-x-4 scale-95'
                                    : 'opacity-100 translate-x-0 scale-100'
                                    }`}
                                style={{
                                    letterSpacing: '-0.02em',
                                    hyphens: 'none',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'normal',
                                    whiteSpace: 'normal',
                                }}
                            >
                                {currentImpactData && renderTextWithHighlight({ ...currentImpactData, impact: prettyImpact })}
                            </p>
                        )}
                    </div>
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
                <div className="fixed bottom-2 right-5 pointer-events-none">
                    <p className="text-base text-gray-400 portrait:text-lg font-mono tabular-nums">
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

            {/* Jump to Index Dialog */}
            {CONFIG.sequentialMode && (
                <Dialog open={jumpDialogOpen} onOpenChange={setJumpDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Jump to Impact</DialogTitle>
                            <DialogDescription>
                                Enter the impact ID number to jump to.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleJumpSubmit}>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="number"
                                    placeholder="Enter ID..."
                                    value={jumpValue}
                                    onChange={(e) => setJumpValue(e.target.value)}
                                    min="1"
                                    autoFocus
                                    className="flex-1"
                                />
                                <Button type="submit">Go</Button>
                            </div>
                        </form>
                        <DialogFooter className="sm:justify-start">
                            <p className="text-sm text-muted-foreground">
                                Press Enter to jump or Esc to cancel
                            </p>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
