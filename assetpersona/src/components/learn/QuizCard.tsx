import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { QuizQuestion } from '../../types/learn';
import './QuizCard.css';

export interface QuizCardProps {
  question: QuizQuestion;
  selectedOptionIndex: number | null;
  onSelectOption: (index: number) => void;
  isLocked: boolean;
}

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuizCard({
  question,
  selectedOptionIndex,
  onSelectOption,
  isLocked,
}: QuizCardProps) {
  return (
    <div className="quiz-card">
      <div className="quiz-card__question-container">
        <h2 className="quiz-card__question">{question.question}</h2>
      </div>

      <div className="quiz-card__options">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index;
          const letter = optionLetters[index] || String(index + 1);

          return (
            <motion.button
              key={index}
              className={`quiz-card__option ${isSelected ? 'is-selected' : ''} ${
                isLocked ? 'is-locked' : ''
              }`}
              onClick={() => !isLocked && onSelectOption(index)}
              disabled={isLocked}
              whileHover={isLocked ? {} : { scale: 1.02, y: -2 }}
              whileTap={isLocked ? {} : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="quiz-card__option-letter-wrapper">
                <span className="quiz-card__option-letter">{letter}</span>
              </div>
              <span className="quiz-card__option-text">{option}</span>
              {isSelected && (
                <motion.div
                  className="quiz-card__option-indicator"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
