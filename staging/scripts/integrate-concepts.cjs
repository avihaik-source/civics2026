#!/usr/bin/env node
/**
 * integrate-concepts.cjs — Integrate parsed concept JSON into data.js
 * Usage: node scripts/integrate-concepts.cjs <concepts.json> <unit-id> [--dry-run]
 * Example: node scripts/integrate-concepts.cjs unit-03.json 11
 * 
 * This will:
 * 1. Read existing data.js
 * 2. Find the target unit by id
 * 3. Add/replace enriched concepts at the beginning of the unit
 * 4. Write updated data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'static', 'data.js');

function integrate(conceptsFile, unitId, dryRun = false) {
  // Read parsed concepts
  const concepts = JSON.parse(fs.readFileSync(conceptsFile, 'utf8'));
  console.log(`📦 Loaded ${concepts.length} concepts from ${conceptsFile}`);

  // Read data.js
  const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
  
  // Parse UNITS_DATA
  const match = dataContent.match(/(const UNITS_DATA\s*=\s*)(\[[\s\S]*?\n\]);/);
  if (!match) {
    console.error('Could not parse UNITS_DATA from data.js');
    process.exit(1);
  }

  const units = JSON.parse(match[2]);
  const targetUnit = units.find(u => u.id === parseInt(unitId));
  
  if (!targetUnit) {
    console.error(`Unit ${unitId} not found. Available: ${units.map(u => u.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`🎯 Target: Unit ${targetUnit.id} "${targetUnit.title}" (${targetUnit.concepts.length} existing concepts)`);

  // Convert parsed concepts to data.js format
  const enrichedConcepts = concepts.map((c, idx) => {
    const conceptId = `${unitId}-${idx + 1}`;
    const result = {
      id: conceptId,
      title: c.title || '',
      term: c.title || '',
      difficulty: 2,
      frequency: c.frequency || 'high',
      source: 'מיקוד בגרות 2026',
      content: {
        definition: c.definition || '',
        mainPoint: c.mainPoint || '',
      }
    };

    if (c.detailedExplanation) result.content.detailedExplanation = c.detailedExplanation;
    if (c.relatedConcepts) result.content.relatedConcepts = c.relatedConcepts;
    if (c.examples) result.content.examples = c.examples;
    if (c.faq && c.faq.length > 0) result.content.faq = c.faq;
    if (c.comparisonTable) result.content.comparisonTable = c.comparisonTable;
    if (c.keyPoints) result.content.keyPoints = c.keyPoints;
    if (c.learningTip) result.content.learningTip = c.learningTip;

    return result;
  });

  // Remove existing enriched concepts (those with content object) to avoid duplicates
  const existingSimple = targetUnit.concepts.filter(c => !c.content || typeof c.content !== 'object');
  
  // Merge: enriched first, then existing simple
  targetUnit.concepts = [...enrichedConcepts, ...existingSimple];
  
  console.log(`✅ Result: ${enrichedConcepts.length} enriched + ${existingSimple.length} simple = ${targetUnit.concepts.length} total`);

  // Stats
  const withSimplify = enrichedConcepts.filter(c => c.content.faq && c.content.faq.some(q => q.simplified_text));
  const totalFaq = enrichedConcepts.reduce((sum, c) => sum + (c.content.faq ? c.content.faq.length : 0), 0);
  console.log(`📊 Stats: ${totalFaq} FAQ questions, ${withSimplify.length} concepts with simplify button`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN — no files changed');
    enrichedConcepts.forEach((c, i) => {
      const faqCount = c.content.faq ? c.content.faq.length : 0;
      const simpCount = c.content.faq ? c.content.faq.filter(q => q.simplified_text).length : 0;
      console.log(`  ${i + 1}. "${c.title}" | ${faqCount} FAQ (${simpCount} simplified)`);
    });
    return;
  }

  // Write back
  const newDataContent = dataContent.replace(
    /(const UNITS_DATA\s*=\s*)\[[\s\S]*?\n\];/,
    match[1] + JSON.stringify(units, null, 2) + ';'
  );

  // Backup
  const backupPath = DATA_FILE + '.bak-' + new Date().toISOString().slice(0, 10);
  fs.copyFileSync(DATA_FILE, backupPath);
  console.log(`💾 Backup: ${backupPath}`);

  fs.writeFileSync(DATA_FILE, newDataContent, 'utf8');
  console.log(`\n✅ Updated ${DATA_FILE}`);
  console.log(`\n🚀 Next: npm run build && test the app`);
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node scripts/integrate-concepts.cjs <concepts.json> <unit-id> [--dry-run]');
    console.log('Example: node scripts/integrate-concepts.cjs unit-03.json 11 --dry-run');
    process.exit(0);
  }
  const dryRun = args.includes('--dry-run');
  integrate(args[0], args[1], dryRun);
}

module.exports = { integrate };
