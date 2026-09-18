import React, { useState, useEffect, useRef } from 'react';

type TypewriterTextProps = {
  text?: string;
  phrases?: string[];
  speed?: number; // ms per char
  className?: string;
};

export function TypewriterText({ text, phrases, speed = 120, className = '' }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let stopTyping: (() => void) | undefined;

    startedRef.current = false;
    setDisplayedText('');
    const startTyping = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const words = phrases?.filter(Boolean).length ? phrases.filter(Boolean) : [text || 'digital reality'];
      let wordIndex = 0;
      let characterIndex = 0;
      let removing = false;
      let timeout: ReturnType<typeof setTimeout>;
      const tick = () => {
        const word = words[wordIndex];
        characterIndex += removing ? -1 : 1;
        setDisplayedText(word.slice(0, Math.max(0, characterIndex)));
        if (!removing && characterIndex === word.length) {
          removing = true;
          timeout = setTimeout(tick, 4200);
          return;
        }
        if (removing && characterIndex === 0) {
          removing = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
        timeout = setTimeout(tick, removing ? Math.max(70, speed * 0.7) : speed);
      };
      tick();
      return () => clearTimeout(timeout);
    };

    if (!('IntersectionObserver' in window)) {
      stopTyping = startTyping();
      return () => stopTyping?.();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stopTyping = startTyping();
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      stopTyping?.();
    };
  }, [text, phrases, speed]);

  return (
    <div ref={containerRef} className={className}>
      <span>{displayedText}</span><span className="typewriter-cursor" aria-hidden="true" />
    </div>
  );
}
