#!/usr/bin/env node
/**
 * list-workflows.js -- List all n8n workflows with name, ID, active status, and node count.
 *
 * Usage:
 *   node list-workflows.js              # formatted table
 *   node list-workflows.js --json       # raw JSON output
 *   node list-workflows.js --filter ai  # filter by name (case-insensitive)
 */
'use strict';

const { api } = require('./load-env');

function parseArgs(args) {
  const flags = { json: false, filter: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') flags.json = true;
    if (args[i] === '--filter' && args[i + 1]) {
      flags.filter = args[i + 1].toLowerCase();
      i++;
    }
  }
  return flags;
}

function formatTable(workflows) {
  if (!workflows.length) {
    console.log('No workflows found.');
    return;
  }

  const header = ['ID', 'Name', 'Active', 'Nodes', 'Last Updated'];
  const rows = workflows.map(w => [
    String(w.id),
    w.name || '(untitled)',
    w.active ? 'Yes' : 'No',
    String((w.nodes && w.nodes.length) || 0),
    w.updatedAt ? new Date(w.updatedAt).toLocaleString() : '-'
  ]);

  const colWidths = header.map((h, ci) =>
    Math.max(h.length, ...rows.map(r => r[ci].length)) + 2
  );

  const sep = colWidths.map(w => '-'.repeat(w)).join('-+-');
  const fmt = (cells) => cells.map((c, i) => c.padEnd(colWidths[i])).join(' | ');

  console.log(fmt(header));
  console.log(sep);
  rows.forEach(r => console.log(fmt(r)));
  console.log();
  console.log(`Total: ${workflows.length} workflow${workflows.length === 1 ? '' : 's'}`);
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  let result;
  try {
    result = await api('GET', '/api/v1/workflows');
  } catch (err) {
    console.error('Failed to fetch workflows:', err.message);
    process.exit(1);
  }

  let workflows = result.data || result;

  if (!Array.isArray(workflows)) {
    console.error('Unexpected API response:', JSON.stringify(workflows).slice(0, 300));
    process.exit(1);
  }

  if (flags.filter) {
    workflows = workflows.filter(w =>
      (w.name || '').toLowerCase().includes(flags.filter)
    );
  }

  if (flags.json) {
    console.log(JSON.stringify(workflows, null, 2));
    return;
  }

  formatTable(workflows);
}

main();
