import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { PaperPlaneTilt } from '@phosphor-icons/react';

/* ═══════════════════════════════════════════════
   AP-MODERNIZE-2026-05 · Lane 2 · MessageComposer
   ═══════════════════════════════════════════════
   Sticky bottom composer used inside MessageThread. Enter sends, Shift+Enter
   inserts a newline. Caps at 2000 characters. The send button is a 44px
   touch target so mobile-first-enforcing stays happy.

   Props:
     onSend(body)  — fired with the trimmed body. Parent clears any error.
     disabled       — true while a parent action (auth check, etc.) blocks input.
     autoFocus      — focus the textarea on mount.
   ═══════════════════════════════════════════════ */

interface Props {
  onSend: (body: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 2000;

export default function MessageComposer({
  onSend,
  disabled = false,
  autoFocus = false,
  placeholder = 'Write a message... (Enter to send, Shift+Enter for new line)',
}: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Auto-grow the textarea up to a sensible cap.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value.slice(0, MAX_LENGTH);
    setText(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  const remaining = MAX_LENGTH - text.length;
  const showCount = text.length > MAX_LENGTH - 200;

  return (
    <form
      className="dm-composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={textareaRef}
        className="dm-composer__input"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        aria-label="Direct message body"
      />
      <div className="dm-composer__actions">
        {showCount && (
          <span
            className={`dm-composer__count ${remaining < 0 ? 'dm-composer__count--over' : ''}`}
            aria-live="polite"
          >
            {remaining}
          </span>
        )}
        <button
          type="submit"
          className="dm-composer__send"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
        >
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </div>
    </form>
  );
}
