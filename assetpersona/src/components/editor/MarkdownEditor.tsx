/* ═══ MARKDOWN EDITOR — Split-pane with toolbar ═══ */
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type FormatAction = 'bold' | 'italic' | 'h2' | 'h3' | 'link' | 'image' | 'code' | 'codeblock' | 'quote' | 'ul' | 'ol' | 'hr';

const FORMAT_CONFIG: { action: FormatAction; label: string; icon: string }[] = [
  { action: 'bold', label: 'Bold', icon: 'B' },
  { action: 'italic', label: 'Italic', icon: 'I' },
  { action: 'h2', label: 'Heading 2', icon: 'H2' },
  { action: 'h3', label: 'Heading 3', icon: 'H3' },
  { action: 'link', label: 'Link', icon: '🔗' },
  { action: 'image', label: 'Image', icon: '🖼' },
  { action: 'code', label: 'Inline Code', icon: '<>' },
  { action: 'codeblock', label: 'Code Block', icon: '{ }' },
  { action: 'quote', label: 'Quote', icon: '❝' },
  { action: 'ul', label: 'Bullet List', icon: '•' },
  { action: 'ol', label: 'Numbered List', icon: '1.' },
  { action: 'hr', label: 'Divider', icon: 'HR' },
];

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (before: string, after = '', defaultText = '') => {
      const ta = textareaRef.current;
      if (!ta) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end) || defaultText;
      const newValue =
        value.substring(0, start) + before + selected + after + value.substring(end);

      onChange(newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.focus();
        const newCursorPos = start + before.length + selected.length;
        ta.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange]
  );

  const handleFormat = useCallback(
    (action: FormatAction) => {
      switch (action) {
        case 'bold':
          insertAtCursor('**', '**', 'bold text');
          break;
        case 'italic':
          insertAtCursor('*', '*', 'italic text');
          break;
        case 'h2':
          insertAtCursor('\n## ', '\n', 'Heading');
          break;
        case 'h3':
          insertAtCursor('\n### ', '\n', 'Heading');
          break;
        case 'link':
          insertAtCursor('[', '](https://)', 'link text');
          break;
        case 'image':
          insertAtCursor('![', '](https://)', 'alt text');
          break;
        case 'code':
          insertAtCursor('`', '`', 'code');
          break;
        case 'codeblock':
          insertAtCursor('\n```\n', '\n```\n', 'code here');
          break;
        case 'quote':
          insertAtCursor('\n> ', '\n', 'quote');
          break;
        case 'ul':
          insertAtCursor('\n- ', '\n');
          break;
        case 'ol':
          insertAtCursor('\n1. ', '\n');
          break;
        case 'hr':
          insertAtCursor('\n---\n');
          break;
      }
    },
    [insertAtCursor]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        handleFormat('bold');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        handleFormat('italic');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleFormat('link');
      }
    };

    ta.addEventListener('keydown', handler);
    return () => ta.removeEventListener('keydown', handler);
  }, [handleFormat]);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="md-editor">
      {/* Toolbar */}
      <div className="md-editor__toolbar">
        <div className="md-editor__toolbar-group">
          {FORMAT_CONFIG.map(({ action, label, icon }) => (
            <button
              key={action}
              type="button"
              className="md-editor__tool-btn"
              onClick={() => handleFormat(action)}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        <div className="md-editor__toolbar-right">
          <span className="md-editor__meta">
            {wordCount} words · {readTime} min read
          </span>
          <button
            type="button"
            className={`md-editor__toggle ${showPreview ? 'md-editor__toggle--active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className={`md-editor__panes ${showPreview ? 'md-editor__panes--split' : ''}`}>
        <textarea
          ref={textareaRef}
          className="md-editor__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Start writing your post in Markdown...'}
          spellCheck
        />

        {showPreview && (
          <div className="md-editor__preview">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="md-editor__preview-empty">Preview will appear here</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
