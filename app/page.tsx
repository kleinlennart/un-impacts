
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface CSVRow {
    entity: string;
    active_phrase: string;
    is_edited: string;
    to_use: string;
}

export default function Home() {
    const [currentSentence, setCurrentSentence] = useState<string>('');
    const [sentences, setSentences] = useState<CSVRow[]>([]);
    const [loading, setLoading] = useState(true);

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    };

    const loadCSVData = useCallback(async () => {
        try {
            const response = await fetch('/data/filtered_results.csv');
            const csvText = await response.text();

            // Parse CSV
            const lines = csvText.split('\n');

            const data: CSVRow[] = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = parseCSVLine(line);
                    data.push({
                        entity: values[0] || '',
                        active_phrase: values[1] || '',
                        is_edited: values[2] || '',
                        to_use: values[3] || ''
                    });
                }
            }

            setSentences(data);
            if (data.length > 0) {
                setCurrentSentence(getRandomSentence(data));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading CSV:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCSVData();
    }, [loadCSVData]);

    useEffect(() => {
        if (sentences.length > 0) {
            const interval = setInterval(() => {
                setCurrentSentence(getRandomSentence(sentences));
            }, 10000); // Change sentence every 5 seconds

            return () => clearInterval(interval);
        }
    }, [sentences]);

    const getRandomSentence = (data: CSVRow[]) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex].active_phrase;
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
                <div className="max-w-3xl">
                    {loading ? (
                        <p className="text-muted-foreground text-lg">Loading...</p>
                    ) : (
                        <p className="text-foreground text-xl sm:text-2xl md:text-3xl leading-relaxed font-medium">
                            {currentSentence}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
