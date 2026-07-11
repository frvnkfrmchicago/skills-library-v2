import { useState, useEffect } from 'react';
import type { MatchPair } from '../../types/learn';
import './MatchGame.css';

interface MatchGameProps {
  pairs: MatchPair[];
  onComplete: () => void;
}

interface GridItem {
  id: string;
  type: 'term' | 'definition';
  text: string;
  pairValue: string; // The term it binds to
  isMatched: boolean;
  isFading: boolean;
}

export default function MatchGame({ pairs, onComplete }: MatchGameProps) {
  const [items, setItems] = useState<GridItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongMatchIds, setWrongMatchIds] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  // Initialize and shuffle grid items
  useEffect(() => {
    if (!pairs || pairs.length === 0) return;

    const termItems: GridItem[] = pairs.map((p, idx) => ({
      id: `term-${idx}-${p.term}`,
      type: 'term',
      text: p.term,
      pairValue: p.term,
      isMatched: false,
      isFading: false,
    }));

    const definitionItems: GridItem[] = pairs.map((p, idx) => ({
      id: `definition-${idx}-${p.term}`,
      type: 'definition',
      text: p.definition,
      pairValue: p.term,
      isMatched: false,
      isFading: false,
    }));

    // Unified random shuffle
    const shuffled = [...termItems, ...definitionItems].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setSelectedId(null);
    setWrongMatchIds([]);
    setIsBusy(false);
  }, [pairs]);

  const handleSelect = (clicked: GridItem) => {
    if (isBusy || clicked.isMatched || clicked.isFading) return;
    
    // De-select if clicked again
    if (selectedId === clicked.id) {
      setSelectedId(null);
      return;
    }

    if (selectedId === null) {
      setSelectedId(clicked.id);
      return;
    }

    // Secondary click: check match logic
    const firstSelected = items.find((item) => item.id === selectedId);
    if (!firstSelected) return;

    // Prevent matching term-to-term or definition-to-definition
    if (firstSelected.type === clicked.type) {
      setSelectedId(clicked.id); // Swap active selection
      return;
    }

    setIsBusy(true);

    if (firstSelected.pairValue === clicked.pairValue) {
      // CORRECT MATCH!
      setItems((prev) =>
        prev.map((item) =>
          item.id === firstSelected.id || item.id === clicked.id
            ? { ...item, isFading: true }
            : item
        )
      );

      setSelectedId(null);
      setIsBusy(false);

      // Trigger matched status after animation finishes
      setTimeout(() => {
        setItems((prev) => {
          const next = prev.map((item) =>
            item.id === firstSelected.id || item.id === clicked.id
              ? { ...item, isMatched: true, isFading: false }
              : item
          );

          // If all matched, trigger completion
          const allMatched = next.every((item) => item.isMatched);
          if (allMatched) {
            onComplete();
          }
          return next;
        });
      }, 550);
    } else {
      // INCORRECT MATCH!
      setWrongMatchIds([firstSelected.id, clicked.id]);
      
      // Delay to let shake error run before resetting selected borders
      setTimeout(() => {
        setSelectedId(null);
        setWrongMatchIds([]);
        setIsBusy(false);
      }, 700);
    }
  };

  return (
    <div className="match-game">
      <div className="match-game__hint">
        Tap a term card, then tap its matching definition card to pair them up.
      </div>
      <div className="match-game__grid">
        {items.map((item) => {
          if (item.isMatched) return <div key={item.id} className="match-game__card-placeholder" />;
          
          const isSelected = selectedId === item.id;
          const isWrong = wrongMatchIds.includes(item.id);
          const isFading = item.isFading;

          let cardClass = 'match-game__card';
          if (isSelected) cardClass += ' match-game__card--selected';
          if (isWrong) cardClass += ' match-game__card--wrong anim-shake';
          if (isFading) cardClass += ' match-game__card--fading anim-fade-match';
          cardClass += ` match-game__card--${item.type}`;

          return (
            <button
              key={item.id}
              type="button"
              className={cardClass}
              onClick={() => handleSelect(item)}
              disabled={isBusy}
            >
              <span className="match-game__card-label">{item.type}</span>
              <span className="match-game__card-text">{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
