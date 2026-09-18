import React, { useState, useEffect, useRef } from 'react';

type TypewriterTextProps = {
  text: string;
  speed?: number; // ms per char
  className?: string;
};

export function TypewriterText({ text, speed = 22, className = '' }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const startTyping = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setIsTyping(true);

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, speed);
    };

    if (!('IntersectionObserver' in window)) {
      startTyping();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTyping();
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [text, speed]);

  // Split into paragraphs if there are double line breaks
  const paragraphs = displayedText.split('\n\n');

  return (
    <div ref={containerRef} className={className}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
          {p}
          {isTyping && idx === paragraphs.length - 1 && (
            <span className="typewriter-cursor" aria-hidden="true" />
          )}
        </p>
      ))}
    </div>
  );
}
