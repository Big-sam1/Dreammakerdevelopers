import React, { useState, useEffect } from 'react';

type TypewriterTextProps = {
  text?: string;
  phrases?: string[];
  speed?: number; // ms per char
  className?: string;
};

export function TypewriterText({ text, phrases, speed = 120, className = '' }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
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
  }, [text, phrases, speed]);

  return (
    <span className={className}>
      <span>{displayedText}</span><span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
