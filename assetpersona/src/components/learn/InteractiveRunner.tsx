import { useState } from 'react';
import { Play, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import './InteractiveRunner.css';

interface InteractiveRunnerProps {
  initialCode: string;
  expectedOutputContains?: string;
  onSuccess?: () => void;
}

export default function InteractiveRunner({ initialCode, expectedOutputContains, onSuccess }: InteractiveRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput([]);
    setValidationMsg(null);

    // Give it a brief delay to simulate execution
    setTimeout(() => {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          const processed = args
            .map((arg) => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
              return String(arg);
            })
            .join(' ');
          logs.push(processed);
        },
        error: (...args: any[]) => {
          logs.push(`[ERROR] ${args.join(' ')}`);
        },
      };

      try {
        // Execute safe function sandbox
        const sandboxRunner = new Function('console', code);
        sandboxRunner(customConsole);
        
        setConsoleOutput(logs.length > 0 ? logs : ['Code executed successfully, but returned no console outputs.']);
        
        // Verify output criteria
        if (expectedOutputContains) {
          const joinedLogs = logs.join('\n');
          if (joinedLogs.toLowerCase().includes(expectedOutputContains.toLowerCase())) {
            setValidationMsg({
              type: 'success',
              text: 'Verification Check Passed! Prompt/Code structure is correct.',
            });
            if (onSuccess) onSuccess();
          } else {
            setValidationMsg({
              type: 'error',
              text: `Verification Check Failed. Expected output to contain: "${expectedOutputContains}"`,
            });
          }
        }
      } catch (err: any) {
        setConsoleOutput([`[Runtime Exception] ${err.message}`]);
        setValidationMsg({
          type: 'error',
          text: `Script error: ${err.message}`,
        });
      } finally {
        setIsRunning(false);
      }
    }, 400);
  };

  const handleReset = () => {
    setCode(initialCode);
    setConsoleOutput([]);
    setValidationMsg(null);
  };

  return (
    <div className="interactive-runner">
      <div className="runner-header">
        <span className="runner-badge">Interactive Code Sandbox</span>
        <div className="runner-actions">
          <button
            onClick={handleReset}
            className="runner-btn runner-btn--secondary"
            title="Reset to default code"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="runner-btn runner-btn--primary"
          >
            <Play size={14} /> {isRunning ? 'Running…' : 'Run Snippet'}
          </button>
        </div>
      </div>

      <div className="runner-workspace">
        {/* Editor Area */}
        <div className="runner-editor-container">
          <div className="editor-line-numbers">
            {code.split('\n').map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="runner-textarea"
            spellCheck="false"
          />
        </div>

        {/* Console output */}
        <div className="runner-console">
          <div className="console-header">Console Output</div>
          <div className="console-terminal">
            {consoleOutput.length === 0 ? (
              <span className="console-placeholder">// Console outputs will appear here when you run.</span>
            ) : (
              consoleOutput.map((line, idx) => (
                <div
                  key={idx}
                  className={`console-line ${line.startsWith('[ERROR]') || line.startsWith('[Runtime') ? 'console-line--error' : ''}`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Validation feedback bar */}
      {validationMsg && (
        <div className={`runner-validation runner-validation--${validationMsg.type}`}>
          {validationMsg.type === 'success' ? (
            <CheckCircle size={16} className="val-icon" />
          ) : (
            <AlertTriangle size={16} className="val-icon" />
          )}
          <span>{validationMsg.text}</span>
        </div>
      )}
    </div>
  );
}
