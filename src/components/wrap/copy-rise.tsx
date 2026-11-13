import type { CSSProperties } from 'react';

/**
 * Text whose letters rise out of a clipping mask one after another. The
 * animation itself is defined in globals.css against a data attribute on an
 * ancestor (`data-hero-title`, `data-hero-badge-text`, …).
 */
export function CopyRise({ text }: { text: string }) {
  const words = text.split(' ');
  const total = Math.max(1, text.replace(/ /g, '').length - 1);
  let index = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            <span className="home-copy-word">
              {Array.from(word).map((char, c) => {
                const progress = index++ / total;
                return (
                  <span key={c} className="home-copy-mask">
                    <span
                      className="home-copy-unit"
                      style={{ '--copy-progress': progress } as CSSProperties}
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </span>
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>
  );
}