import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Typography utilities
export function preventOrphan(text: string | undefined | null): string {
    if (!text) return '';
    const trimmedText = text.trim();
    if (!trimmedText) return '';

    const words = trimmedText.split(' ');
    if (words.length < 2) return trimmedText;
    return words.slice(0, -1).join(' ') + '\u00A0' + words[words.length - 1];
}

// Parse text with specified highlight text
export function parseTextWithHighlight(text: string | undefined | null, highlight: string | undefined | null) {
    if (!text) return { highlightedText: '', remainingText: '' };
    const trimmedText = text.trim();
    const trimmedHighlight = highlight?.trim() || '';

    if (!trimmedHighlight || !trimmedText.startsWith(trimmedHighlight)) {
        // If no highlight or text doesn't start with highlight, return as normal text
        return { highlightedText: '', remainingText: trimmedText };
    }

    const remainingText = trimmedText.slice(trimmedHighlight.length).trim();

    return {
        highlightedText: trimmedHighlight,
        remainingText: remainingText ? ' ' + remainingText : ''
    };
}
