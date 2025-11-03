'use client';

import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  isActive?: boolean; // only animate when true
  className?: string;
  onComplete?: () => void;
}

export function TypingText({
  text,
  speed = 25,
  isActive = true,
  className = '',
  onComplete
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If not active, show full text immediately
    if (!isActive) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text, isActive]);

  useEffect(() => {
    // Skip animation if not active
    if (!isActive || currentIndex >= text.length) {
      if (currentIndex >= text.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isActive, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isActive && currentIndex < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </span>
  );
}
