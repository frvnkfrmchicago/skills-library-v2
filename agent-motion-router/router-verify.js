/* router-verify.js */

/**
 * QA Diagnostic Verification Suite
 * Exercises registry queries, capability filtering, routing bindings, and anti-mock policies.
 * Prints clean assertion logs to document test coverage.
 */

const CapabilityRegistry = require('./router-registry.js');

const BANNED_PLACEHOLDERS = [
  'john doe',
  'lorem ipsum',
  'test@',
  'dummy string'
];

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

function runDiagnostics() {
  console.log("\n==================================================");
  console.log("   AGENT CAPABILITY DISCOVERY HUB DIAGNOSTICS   ");
  console.log("==================================================\n");

  // TEST 1: Instantiate Registry
  const registry = new CapabilityRegistry();
  assert(registry !== null, "CapabilityRegistry instantiated successfully.");

  // TEST 2: Check pre-populated capabilities count
  const allCaps = registry.getCapabilities('all');
  assert(allCaps.length >= 10, `Registry contains ${allCaps.length} pre-registered capabilities (expected >= 10).`);

  // TEST 3: Exercise Category Query Filters
  const anims = registry.getCapabilities('animations');
  const allAreAnims = anims.every(c => c.category === 'animations');
  assert(allAreAnims && anims.length > 0, `Category query 'animations' successfully returned only animations (${anims.length} items).`);

  const inputs = registry.getCapabilities('inputs');
  const allAreInputs = inputs.every(c => c.category === 'inputs');
  assert(allAreInputs && inputs.length > 0, `Category query 'inputs' successfully returned only inputs (${inputs.length} items).`);

  // TEST 4: Validate Dynamic Route Bindings
  const initialRoutesCount = registry.getRoutes().length;
  const bindResult = registry.bindRoute('morph', 'checkout-confirm-card', 'Dynamic order morph binds.');
  assert(bindResult.success === true, "Binding function executed successfully with valid inputs.");
  
  const currentRoutes = registry.getRoutes();
  const routeExists = currentRoutes.some(r => r.capability === 'morph' && r.target === 'checkout-confirm-card');
  assert(routeExists && currentRoutes.length === initialRoutesCount + 1, "New route point successfully recorded into active registry database.");

  // TEST 5: Verify Collaborative Note logging
  const initialNotesCount = registry.getNotes().length;
  registry.addNote('AI Auditor', 'Verified coordinate grids for interactive mesh canvas.');
  const currentNotes = registry.getNotes();
  const noteSaved = currentNotes.some(n => n.author === 'AI Auditor' && n.text.includes('coordinate grids'));
  assert(noteSaved && currentNotes.length === initialNotesCount + 1, "New agent findings documented and appended inside collaborative notes workspace.");

  // TEST 6: Strict Anti-Mock Gating Scan
  console.log("\n--- Anti-Mock Policy Gating Scan ---");
  let mockDetected = false;

  // Scan all registry descriptions & notes
  allCaps.forEach(cap => {
    const textToScan = `${cap.name} ${cap.description} ${cap.instructions}`.toLowerCase();
    BANNED_PLACEHOLDERS.forEach(banned => {
      if (textToScan.includes(banned)) {
        console.warn(`[WARNING] Mock placeholder detected in capability [${cap.key}]: "${banned}"`);
        mockDetected = true;
      }
    });
  });

  currentNotes.forEach(note => {
    const textToScan = `${note.author} ${note.text}`.toLowerCase();
    BANNED_PLACEHOLDERS.forEach(banned => {
      if (textToScan.includes(banned)) {
        console.warn(`[WARNING] Mock placeholder detected in workspace notes: "${banned}"`);
        mockDetected = true;
      }
    });
  });

  assert(!mockDetected, "Anti-Mock Gating check passed (0 mock placeholders or dummy templates found).");

  // Summary Report
  console.log("\n==================================================");
  console.log(`   DIAGNOSTIC SUMMARY: Passed ${passedTests} of ${totalTests} tests.`);
  console.log("==================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Execute diagnostics
runDiagnostics();
