---
name: agentic-ux
description: UX patterns for AI agents and assistants. Transparency, control, trust, accountability.
last_updated: 2026-03
owner: Frank
---

# Agentic UX

Design experiences for AI that acts on behalf of users. Build trust, provide control.

> **See also:** `ai-builder/agentic-workflows/SKILL.md`, `agents/ux-research/SKILL.md`

---

## Context Questions

Before designing agentic experiences:

1. **What actions can the agent take?** — Read-only, make changes, external effects
2. **What's the risk level?** — Reversible, costly, irreversible
3. **What's the user's expertise?** — Expert oversight, general consumer
4. **What's the autonomy level?** — Suggestions only, approval required, autonomous
5. **What's the frequency?** — One-off task, ongoing automation

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Autonomy** | Suggestions ←→ Full automation |
| **Control** | Micromanage ←→ Set and forget |
| **Visibility** | Black box ←→ Full transparency |
| **Risk** | Low stakes ←→ High stakes |
| **Reversibility** | Undo available ←→ Permanent |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Low risk actions | Allow autonomous execution |
| High risk actions | Require explicit approval |
| Expert users | Default to more autonomy |
| New users | Default to more oversight |
| Irreversible actions | Show preview, require confirmation |
| Batch operations | Progress + pause/cancel |

---

## TL;DR

| Need | Pattern |
|------|---------|
| **Show what agent will do** | Preview mode |
| **Let user approve** | Approval workflow |
| **Undo mistakes** | Reversibility |
| **Show reasoning** | Explainability |
| **Handle errors** | Graceful degradation |

---

## Part 1: Core Principles

### The FATE Framework

```markdown
F — FAIRNESS
    Treat all users equitably
    Avoid biased recommendations
    
A — ACCOUNTABILITY  
    Clear ownership of actions
    Audit trail for decisions
    
T — TRANSPARENCY
    Show what the agent is doing
    Explain why it made decisions
    
E — ETHICS
    Respect user autonomy
    Protect user interests
```

### Trust Calibration

```markdown
Users should trust agents APPROPRIATELY:

Under-trust → Wastes agent capability
Over-trust → Dangerous reliance

Solutions:
1. Show accuracy/confidence
2. Explain limitations
3. Track and display history
4. Allow verification
```

---

## Part 2: Autonomy Levels

### Level 0: Suggestions Only

```tsx
// Agent suggests, user decides
function SuggestionMode() {
  return (
    <div className="suggestion-card">
      <h3>AI Recommendation</h3>
      <p className="suggestion">{suggestion}</p>
      
      <div className="actions">
        <Button onClick={apply}>Apply</Button>
        <Button variant="ghost" onClick={dismiss}>Dismiss</Button>
        <Button variant="ghost" onClick={modify}>Modify</Button>
      </div>
      
      <details>
        <summary>Why this suggestion?</summary>
        <p className="reasoning">{reasoning}</p>
      </details>
    </div>
  );
}
```

### Level 1: Approval Required

```tsx
// Agent prepares, user approves
function ApprovalWorkflow() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  
  return (
    <div className="approval-workflow">
      <h3>Proposed Changes</h3>
      
      <div className="change-list">
        {changes.map(change => (
          <ChangeItem
            key={change.id}
            change={change}
            isApproved={approved.has(change.id)}
            onToggle={() => toggleApproval(change.id)}
          />
        ))}
      </div>
      
      <footer>
        <Button onClick={approveAll}>Approve All</Button>
        <Button onClick={applyApproved} disabled={approved.size === 0}>
          Apply {approved.size} Changes
        </Button>
      </footer>
    </div>
  );
}
```

### Level 2: Notify After Action

```tsx
// Agent acts, user is notified
function PostActionNotification() {
  return (
    <Toast>
      <div className="toast-content">
        <CheckIcon className="success" />
        <div>
          <p className="title">Emails archived</p>
          <p className="description">23 promotional emails moved to archive</p>
        </div>
      </div>
      
      <div className="actions">
        <Button variant="ghost" size="sm">View</Button>
        <Button variant="ghost" size="sm">Undo</Button>
      </div>
    </Toast>
  );
}
```

### Level 3: Fully Autonomous

```tsx
// Agent acts silently, user can review history
function AutonomousAgent() {
  return (
    <Dashboard>
      <Card>
        <h3>Agent Activity</h3>
        <p className="status">
          <StatusDot color="green" />
          Running autonomously
        </p>
        
        <ActivityLog activities={recentActivities} />
        
        <footer>
          <Button variant="outline" onClick={pauseAgent}>
            Pause Automation
          </Button>
          <Link to="/settings/agent">Configure</Link>
        </footer>
      </Card>
    </Dashboard>
  );
}
```

---

## Part 3: Transparency Patterns

### Reasoning Display

```tsx
function AgentReasoning({ decision }: { decision: Decision }) {
  return (
    <div className="reasoning-panel">
      <h4>How I decided this</h4>
      
      <Steps>
        <Step icon={<SearchIcon />}>
          <strong>Analyzed</strong> your calendar and email history
        </Step>
        <Step icon={<BrainIcon />}>
          <strong>Identified</strong> recurring meeting patterns
        </Step>
        <Step icon={<FilterIcon />}>
          <strong>Prioritized</strong> based on your stated goals
        </Step>
        <Step icon={<LightbulbIcon />}>
          <strong>Recommended</strong> rescheduling to mornings
        </Step>
      </Steps>
      
      <div className="confidence">
        <span>Confidence: </span>
        <ConfidenceBadge level={decision.confidence} />
      </div>
      
      <Button variant="link">View detailed analysis</Button>
    </div>
  );
}
```

### Progress Visibility

```tsx
function AgentProgress({ task }: { task: AgentTask }) {
  return (
    <div className="agent-progress">
      <div className="header">
        <h4>{task.name}</h4>
        <Badge variant={task.status}>{task.status}</Badge>
      </div>
      
      <ProgressBar value={task.progress} max={100} />
      
      <div className="current-step">
        <Spinner size="sm" />
        <span>{task.currentStep}</span>
      </div>
      
      <div className="step-log">
        {task.completedSteps.map((step, i) => (
          <div key={i} className="step completed">
            <CheckIcon />
            <span>{step.description}</span>
            <time>{step.completedAt}</time>
          </div>
        ))}
      </div>
      
      <div className="actions">
        <Button variant="ghost" size="sm" onClick={pauseTask}>
          Pause
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelTask}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
```

### Action Preview

```tsx
function ActionPreview({ action }: { action: ProposedAction }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Changes</DialogTitle>
          <DialogDescription>
            Review what the agent will do before confirming
          </DialogDescription>
        </DialogHeader>
        
        <div className="preview-content">
          {action.type === 'email' && (
            <EmailPreview
              to={action.to}
              subject={action.subject}
              body={action.body}
            />
          )}
          
          {action.type === 'spreadsheet' && (
            <DiffView
              before={action.before}
              after={action.after}
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={edit}>
            Edit Before Sending
          </Button>
          <Button onClick={confirm}>
            Confirm & Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Part 4: Control Patterns

### Guardrails Configuration

```tsx
function AgentGuardrails() {
  return (
    <SettingsSection title="Agent Guardrails">
      <Setting
        title="Maximum spend per action"
        description="Agent cannot make purchases above this amount"
      >
        <Input type="number" value={maxSpend} prefix="$" />
      </Setting>
      
      <Setting
        title="Always ask before"
        description="Actions that require your approval"
      >
        <CheckboxGroup>
          <Checkbox value="external_emails">
            Sending external emails
          </Checkbox>
          <Checkbox value="file_deletion">
            Deleting files
          </Checkbox>
          <Checkbox value="calendar_changes">
            Modifying calendar events
          </Checkbox>
        </CheckboxGroup>
      </Setting>
      
      <Setting
        title="Operating hours"
        description="When agent can take autonomous actions"
      >
        <TimeRangePicker
          start={operatingStart}
          end={operatingEnd}
        />
      </Setting>
      
      <Setting
        title="Daily action limit"
        description="Maximum number of automated actions per day"
      >
        <Slider min={10} max={100} value={dailyLimit} />
      </Setting>
    </SettingsSection>
  );
}
```

### Pause & Resume

```tsx
function AgentControls() {
  const [isPaused, setIsPaused] = useState(false);
  
  return (
    <div className="agent-controls">
      {isPaused ? (
        <Button onClick={() => setIsPaused(false)}>
          <PlayIcon />
          Resume Agent
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setIsPaused(true)}>
          <PauseIcon />
          Pause Agent
        </Button>
      )}
      
      {isPaused && (
        <Alert>
          <AlertTitle>Agent Paused</AlertTitle>
          <AlertDescription>
            The agent will not take any actions until you resume it.
            <br />
            Paused since: {pausedAt}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### Undo & Rollback

```tsx
function UndoableAction({ action }: { action: CompletedAction }) {
  const [canUndo, setCanUndo] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanUndo(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="undoable-action">
      <p>{action.description}</p>
      
      {canUndo && (
        <Button variant="ghost" size="sm" onClick={undo}>
          Undo ({timeRemaining}s)
        </Button>
      )}
    </div>
  );
}
```

---

## Part 5: Error Handling

### Graceful Degradation

```tsx
function AgentErrorState({ error }: { error: AgentError }) {
  return (
    <Alert variant="warning">
      <AlertCircleIcon />
      <AlertTitle>Agent couldn't complete the task</AlertTitle>
      <AlertDescription>
        {error.message}
      </AlertDescription>
      
      <div className="error-actions">
        <Button variant="outline" size="sm" onClick={retry}>
          Try Again
        </Button>
        <Button variant="ghost" size="sm" onClick={doManually}>
          Do It Manually
        </Button>
        <Button variant="ghost" size="sm" onClick={reportIssue}>
          Report Issue
        </Button>
      </div>
      
      <details className="error-details">
        <summary>Technical details</summary>
        <pre>{JSON.stringify(error.details, null, 2)}</pre>
      </details>
    </Alert>
  );
}
```

### Uncertainty Communication

```tsx
function LowConfidenceWarning({ confidence }: { confidence: number }) {
  if (confidence > 0.8) return null;
  
  return (
    <Alert variant="info">
      <InfoIcon />
      <AlertTitle>Lower confidence suggestion</AlertTitle>
      <AlertDescription>
        I'm {Math.round(confidence * 100)}% confident about this recommendation.
        You may want to verify before proceeding.
        
        <div className="alternative-actions">
          <Button variant="link" onClick={showAlternatives}>
            Show alternatives
          </Button>
          <Button variant="link" onClick={explainUncertainty}>
            Why am I uncertain?
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Part 6: Onboarding

### Progressive Autonomy

```tsx
function AgentOnboarding() {
  const [step, setStep] = useState(0);
  const [autonomyLevel, setAutonomyLevel] = useState(0);
  
  const steps = [
    {
      title: "Week 1: Watch Mode",
      description: "Agent observes and suggests. You approve everything.",
      autonomy: 0
    },
    {
      title: "Week 2: Low-risk Automation",
      description: "Agent handles routine tasks. You review daily.",
      autonomy: 1
    },
    {
      title: "Week 3+: Trusted Partner",
      description: "Agent handles approved categories. You review weekly.",
      autonomy: 2
    }
  ];
  
  return (
    <OnboardingFlow>
      <StepIndicator steps={steps} current={step} />
      
      <Card>
        <h3>{steps[step].title}</h3>
        <p>{steps[step].description}</p>
        
        <div className="autonomy-preview">
          <h4>The agent will:</h4>
          <ul>
            {getCapabilities(steps[step].autonomy).map(cap => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
        </div>
        
        <Button onClick={() => setStep(s => s + 1)}>
          Continue
        </Button>
      </Card>
    </OnboardingFlow>
  );
}
```

### Permissions Request

```tsx
function PermissionRequest({ permission }: { permission: Permission }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permission Request</DialogTitle>
        </DialogHeader>
        
        <div className="permission-details">
          <div className="icon-wrapper">
            {permission.icon}
          </div>
          
          <h4>{permission.title}</h4>
          <p>{permission.description}</p>
          
          <div className="what-this-means">
            <h5>What this means:</h5>
            <ul>
              {permission.implications.map(imp => (
                <li key={imp}>{imp}</li>
              ))}
            </ul>
          </div>
          
          <div className="you-control">
            <h5>You're always in control:</h5>
            <ul>
              <li>Revoke anytime in Settings</li>
              <li>View all actions in Activity Log</li>
              <li>Set limits on what agent can do</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={deny}>
            Not Now
          </Button>
          <Button onClick={allow}>
            Allow Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Part 7: Feedback Loops

### Inline Feedback

```tsx
function AgentFeedback({ action }: { action: AgentAction }) {
  return (
    <div className="feedback-prompt">
      <span>Was this helpful?</span>
      
      <div className="feedback-buttons">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => submitFeedback('positive')}
        >
          <ThumbsUpIcon />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => submitFeedback('negative')}
        >
          <ThumbsDownIcon />
        </Button>
      </div>
    </div>
  );
}
```

### Correction Interface

```tsx
function CorrectionDialog({ action }: { action: AgentAction }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Help improve the agent</DialogTitle>
          <DialogDescription>
            Tell us what went wrong so we can do better
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup value={correctionType} onValueChange={setCorrectionType}>
          <RadioItem value="wrong_action">
            Wrong action — should have done something else
          </RadioItem>
          <RadioItem value="wrong_timing">
            Wrong timing — not the right moment
          </RadioItem>
          <RadioItem value="missing_context">
            Missing context — didn't consider something important
          </RadioItem>
          <RadioItem value="other">
            Other
          </RadioItem>
        </RadioGroup>
        
        <Textarea
          placeholder="Optional: Tell us more..."
          value={details}
          onChange={e => setDetails(e.target.value)}
        />
        
        <DialogFooter>
          <Button onClick={submitCorrection}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Part 8: Activity & Audit

### Activity Log

```tsx
function ActivityLog() {
  return (
    <div className="activity-log">
      <div className="log-header">
        <h3>Agent Activity</h3>
        <div className="filters">
          <Select value={filter} onValueChange={setFilter}>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="autonomous">Autonomous only</SelectItem>
            <SelectItem value="approved">User approved</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </Select>
          
          <DatePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>
      
      <div className="log-entries">
        {activities.map(activity => (
          <ActivityEntry
            key={activity.id}
            activity={activity}
            onExpand={() => setExpandedId(activity.id)}
          />
        ))}
      </div>
      
      <div className="log-footer">
        <Button variant="outline" onClick={exportLog}>
          Export Log
        </Button>
      </div>
    </div>
  );
}
```

---

## Part 9: Design Checklist

### Before Launch

```markdown
□ Clear explanation of what agent does
□ User understands scope of agent actions
□ Autonomy level is configurable
□ Guardrails prevent harmful actions
□ All actions are auditable
□ Undo available where possible
□ Error handling is graceful
□ Feedback mechanism exists
□ Privacy implications explained
□ Kill switch accessible
```

### Ongoing

```markdown
□ Monitor user trust levels
□ Track undo/correction rates
□ Review edge case failures
□ Update guardrails as needed
□ Collect and act on feedback
```

---

## Checklist

- [ ] Autonomy levels defined
- [ ] Approval workflows for high-risk actions
- [ ] Transparency patterns implemented
- [ ] Guardrails configurable by user
- [ ] Undo/rollback available
- [ ] Error handling graceful
- [ ] Feedback loop implemented
- [ ] Activity log available
- [ ] Progressive onboarding designed

---

## Resources

- Google AI UX: https://pair.withgoogle.com
- Apple Human Interface (AI): https://developer.apple.com/ai
- Microsoft HAX Toolkit: https://www.microsoft.com/haxtoolkit

---

## Related Skills

- `agents/ux-research/SKILL.md` — User research
- `ai-builder/agentic-workflows/SKILL.md` — Agent architecture
- `ai-builder/conversational-ai/SKILL.md` — Chat patterns
- `agents/ui-design/SKILL.md` — UI patterns
