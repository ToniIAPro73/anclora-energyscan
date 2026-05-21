'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function ScrollArrows() {
  const [scrollY, setScrollY] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);

  useEffect(() => {
    function update() {
      setScrollY(window.scrollY);
      setMaxScroll(document.body.scrollHeight - window.innerHeight);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const isAtTop = scrollY < 80;
  const isAtBottom = maxScroll > 0 && scrollY >= maxScroll - 80;
  const showUp = !isAtTop;
  const showDown = !isAtBottom && maxScroll > 0;

  if (!showUp && !showDown) return null;

  return (
    <div className="fixed right-4 sm:right-5 bottom-20 sm:bottom-24 z-[6000] flex flex-col gap-2">
      {showUp && (
        <button
          type="button"
          aria-label="Ir al inicio"
          className="scroll-arrow-btn flex h-9 w-9 items-center justify-center rounded-full focus:outline-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
      {showDown && (
        <button
          type="button"
          aria-label="Ir al final"
          className="scroll-arrow-btn flex h-9 w-9 items-center justify-center rounded-full focus:outline-none"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
