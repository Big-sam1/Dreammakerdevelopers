import React, { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: string;
  duration?: number;
  className?: string;
};

export function CountUp({ value, duration = 1800, className = '' }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const elRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Parse target number, decimal places, prefix, and suffix
    const match = value.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const numStr = match[2];
    const suffix = match[3] || '';
    const target = parseFloat(numStr);
    const hasDecimal = numStr.includes('.');
    const decimals = hasDecimal ? numStr.split('.')[1].length : 0;

    const startCounting = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;

      const startTime = performance.now();

      const updateCount = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutExpo function for slick decelerating counter animation
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * ease;

        const formatted = hasDecimal
          ? current.toFixed(decimals)
          : Math.floor(current).toString();

        setDisplayValue(`${prefix}${formatted}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(updateCount);
    };

    const currentEl = elRef.current;
    if (!currentEl) {
      startCounting();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      startCounting();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
          observer.unobserve(currentEl);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={elRef} className={className}>
      {displayValue}
    </span>
  );
}
