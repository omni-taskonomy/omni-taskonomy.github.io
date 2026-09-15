import type { ReactNode } from 'react';

// Wrap exact terms without replacing characters or matching inside other words.
export function coloredTerms(value: string): ReactNode {
  const pattern = /\b(image[- ]to[- ]image|image[- ]to[- ]text|image generation|image understanding|generation|understanding|I2I|I2T)\b/gi;
  return value.split(pattern).map((part, index) => {
    if (index % 2 === 0) return part;
    const generation = /generation|image[- ]to[- ]image|i2i/i.test(part);
    return <span key={index} className={generation ? 'term-generation' : 'term-understanding'}>{part}</span>;
  });
}
