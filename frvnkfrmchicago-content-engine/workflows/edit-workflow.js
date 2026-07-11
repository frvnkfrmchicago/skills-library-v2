#!/usr/bin/env node
/**
 * edit-workflow.js -- Edit an existing n8n workflow programmatically.
 *
 * n8n requires sending the FULL workflow JSON on PATCH (no partial updates).
 * This script: GETs the workflow -> modifies it -> PATCHes it back.
 *
 * Usage:
 *   node edit-workflow.js --id 42 --rename "New Name"
 *   node edit-workflow.js --name "My Workflow" --activate
 *   node edit-workflow.js --id 42 --deactivate
 *   node edit-workflow.js --id 42 --set-cron "0 *\/2 * * *"
 *   node edit-workflow.js --id 42 --set-node "HTTP Request" url "https://example.com"
 *   node edit-workflow.js --id 42 --export > workflow-backup.json
 *   node edit-workflow.js --id 42 --import ./workflow-backup.json
 *   node edit-workflow.js --id 42 --rename "Test" --dry-run
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { api } = require('./load-env');

function parseArgs(args) {
  const flags = {
    id: null,
    name: null,
    rename: null,
    activate: false,
    deactivate: false,
    setCron: null,
    setNode: null,
    export: false,
    import: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    switch (a) {
      case '--id':
        flags.id = args[++i];
        break;
      case '--name':
        flags.name = args[++i];
        break;
      case '--rename':
        flags.rename = args[++i];
        break;
      case '--activate':
        flags.activate = true;
        break;
      case '--deactivate':
        flags.deactivate = true;
        break;
      case '--set-cron':
        flags.setCron = args[++i];
        break;
      case '--set-node':
        flags.setNode = { node: args[i + 1], param: args[i + 2], value: args[i + 3] };
        i += 3;
        break;
      case '--export':
        flags.export = true;
        break;
      case '--import':
        flags.import = args[++i];
        break;
      case '--dry-run':
        flags.dryRun = true;
        break;
    }
  }
  return flags;
}

async function resolveWorkflowId(flags) {
  if (flags.id) return flags.id;

  if (!flags.name) {
    console.error('Provide --id <id> or --name <name> to identify the workflow.');
    process.exit(1);
  }

  console.log(`Searching for workflow matching "${flags.name}"...`);
  let result;
  try {
    result = await api('GET', '/api/v1/workflows');
  } catch (err) {
    console.error('Failed to list workflows:', err.message);
    process.exit(1);
  }

  const all = result.data || result;
  if (!Array.isArray(all)) {
    console.error('Unexpected API response format.');
    process.exit(1);
  }

  const match = all.find(w => w.name === flags.name);
  if (!match) {
    const partial = all.filter(w => (w.name || '').toLowerCase().includes(flags.name.toLowerCase()));
    if (partial.length === 1) {
      console.log(`Found: "${partial[0].name}" (ID ${partial[0].id})`);
      return partial[0].id;
    }
    if (partial.length > 1) {
      console.error(`Multiple workflows match "${flags.name}":`);
      partial.forEach(w => console.error(`  [${w.id}] ${w.name}`));
      process.exit(1);
    }
    console.error(`No workflow found matching "${flags.name}".`);
    process.exit(1);
  }

  console.log(`Found: "${match.name}" (ID ${match.id})`);
  return match.id;
}

async function getWorkflow(id) {
  try {
    return await api('GET', `/api/v1/workflows/${id}`);
  } catch (err) {
    console.error(`Failed to GET workflow ${id}:`, err.message);
    process.exit(1);
  }
}

function saveBackup(workflow) {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = (workflow.name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = path.join(backupDir, `${safeName}-${ts}.json`);

  fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
  console.log(`Backup saved: ${filePath}`);
  return filePath;
}

function applyModifications(workflow, flags) {
  const changes = [];

  if (flags.rename) {
    const old = workflow.name;
    workflow.name = flags.rename;
    changes.push(`Name: "${old}" -> "${flags.rename}"`);
  }

  if (flags.activate && flags.deactivate) {
    console.error('Cannot use both --activate and --deactivate.');
    process.exit(1);
  }

  if (flags.activate) {
    workflow.active = true;
    changes.push('Active: false -> true');
  }

  if (flags.deactivate) {
    workflow.active = false;
    changes.push('Active: true -> false');
  }

  if (flags.setCron) {
    const trigger = (workflow.nodes || []).find(n =>
      n.type === 'n8n-nodes-base.scheduleTrigger' ||
      n.type === '@n8n/n8n-nodes-langchain.scheduleTrigger'
    );
    if (!trigger) {
      console.error('No Schedule Trigger node found in this workflow.');
      process.exit(1);
    }
    const oldCron = trigger.parameters?.rule?.[0]?.expression || '(none)';
    if (!trigger.parameters) trigger.parameters = {};
    if (!trigger.parameters.rule) trigger.parameters.rule = [{}];
    trigger.parameters.rule[0].expression = flags.setCron;
    changes.push(`Cron on "${trigger.name}": "${oldCron}" -> "${flags.setCron}"`);
  }

  if (flags.setNode) {
    const { node, param, value } = flags.setNode;
    const target = (workflow.nodes || []).find(n =>
      n.name.toLowerCase() === node.toLowerCase()
    );
    if (!target) {
      console.error(`Node "${node}" not found. Available nodes:`);
      (workflow.nodes || []).forEach(n => console.error(`  - ${n.name}`));
      process.exit(1);
    }
    if (!target.parameters) target.parameters = {};
    const oldValue = target.parameters[param];
    target.parameters[param] = value;
    changes.push(`Node "${target.name}" param "${param}": "${oldValue}" -> "${value}"`);
  }

  return changes;
}

function showDiff(changes) {
  if (!changes.length) {
    console.log('No modifications specified. Use flags like --rename, --activate, --set-cron, etc.');
    return false;
  }

  console.log('\n--- Changes ---');
  changes.forEach(c => console.log(`  ${c}`));
  return true;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  const workflowId = await resolveWorkflowId(flags);
  const workflow = await getWorkflow(workflowId);

  if (flags.export) {
    console.log(JSON.stringify(workflow, null, 2));
    return;
  }

  if (flags.import) {
    const importPath = path.resolve(flags.import);
    if (!fs.existsSync(importPath)) {
      console.error(`Import file not found: ${importPath}`);
      process.exit(1);
    }
    const imported = JSON.parse(fs.readFileSync(importPath, 'utf8'));
    Object.assign(workflow, {
      nodes: imported.nodes || workflow.nodes,
      connections: imported.connections || workflow.connections,
      settings: imported.settings || workflow.settings
    });
    console.log(`Imported workflow structure from ${importPath}`);
  }

  const changes = applyModifications(workflow, flags);
  const hasChanges = showDiff(changes);

  if (!hasChanges && !flags.import) {
    return;
  }

  if (flags.dryRun) {
    console.log('\n(dry-run) No changes applied. Remove --dry-run to save.');
    return;
  }

  saveBackup(workflow);

  try {
    const updated = await api('PATCH', `/api/v1/workflows/${workflowId}`, workflow);
    console.log(`\nWorkflow "${updated.name || workflow.name}" (ID ${workflowId}) updated successfully.`);
  } catch (err) {
    console.error('PATCH failed:', err.message);
    process.exit(1);
  }
}

main();
