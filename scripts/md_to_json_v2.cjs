#!/usr/bin/env node
/**
 * md_to_json_v2.cjs — Parse Civics2026 concept MD files (v2 format)
 * Supports: source, simplified_text, comparisonTable, relatedConcepts
 * Usage: node scripts/md_to_json_v2.cjs <input-dir> [output-file]
 * Example: node scripts/md_to_json_v2.cjs /home/user/uploaded_files/unit-03 unit-03-data.json
 */

const fs = require('fs');
const path = require('path');

function parseConceptMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const concept = { _sourceFile: path.basename(filePath) };

  // Title (H1)
  const titleMatch = content.match(/^# (.+)$/m);
  concept.title = titleMatch ? titleMatch[1].trim() : '';

  // Definition (📚 or 📌 הגדרה בסיסית)
  const defMatch = content.match(/## .{1,4}הגדרה בסיסית[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  concept.definition = defMatch ? defMatch[1].trim() : '';

  // Main Point (🔍 or 🎯 משמעות מרכזית)
  const mainMatch = content.match(/## .{1,4}(?:מהי ה)?משמעות מרכזית[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  concept.mainPoint = mainMatch ? mainMatch[1].trim() : '';

  // Detailed Explanation (📖 הסבר מפורט)
  const detailMatch = content.match(/## .{1,4}הסבר מפורט[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  if (detailMatch) {
    concept.detailedExplanation = detailMatch[1].trim().split('\n\n')
      .map(p => p.trim()).filter(p => p && !p.startsWith('##'));
  }

  // Related Concepts (🔗 קונספטים קשורים / קשר למושגים)
  const relMatch = content.match(/## .{1,4}(?:קונספטים קשורים|קשר למושגים)[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  if (relMatch) {
    concept.relatedConcepts = [];
    const lines = relMatch[1].trim().split('\n');
    lines.forEach(line => {
      const m = line.match(/\*?\*?\s*\*?\*?([^*–-]+?)\*?\*?\s*[–-]\s*(.+)/);
      if (m) {
        concept.relatedConcepts.push({ conceptId: m[1].trim(), relation: m[2].trim() });
      }
    });
  }

  // Examples (🌍 or 💡 דוגמאות)
  const exMatch = content.match(/## .{1,4}דוגמאות[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  if (exMatch) {
    concept.examples = [];
    const blocks = exMatch[1].trim().split(/\n### \*?\*?/);
    blocks.forEach(block => {
      if (!block.trim()) return;
      const lines = block.trim().split('\n');
      const title = lines[0].replace(/\*?\*?/g, '').replace(/:?\s*$/, '').trim();
      const text = lines.slice(1).join(' ').trim();
      if (title && text) concept.examples.push({ title, text });
    });
    // Fallback: line-based parsing
    if (concept.examples.length === 0) {
      const exLines = exMatch[1].trim().split('\n');
      let currentTitle = '';
      let currentText = '';
      exLines.forEach(line => {
        const titleM = line.match(/^\*?\*?דוגמה\s*\d*:?\s*(.+?)\*?\*?\s*$/);
        if (titleM) {
          if (currentTitle) concept.examples.push({ title: currentTitle, text: currentText.trim() });
          currentTitle = titleM[1].replace(/\*?\*?/g, '').trim();
          currentText = '';
        } else if (currentTitle) {
          currentText += line + ' ';
        }
      });
      if (currentTitle) concept.examples.push({ title: currentTitle, text: currentText.trim() });
    }
  }

  // FAQ with source + simplified_text (❓ שאלות ותשובות)
  const faqMatch = content.match(/## .{1,4}שאלות ותשובות[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  if (faqMatch) {
    concept.faq = [];
    const faqContent = faqMatch[1];
    
    // Pattern: ### **question**\n**מקור:** source\n\n**תשובה:**\nanswer\n\n<details>...<div class="simplified-question">\nsimplified\n</div>
    const questionBlocks = faqContent.split(/\n?### \*\*/).filter(b => b.trim());
    questionBlocks.forEach(block => {
      const faqItem = {};
      
      // Question title — first line up to closing **
      const qMatch = block.match(/^([^*\n]+?)\*\*/);
      faqItem.question = qMatch ? qMatch[1].replace(/^#+\s*/, '').trim() : '';

      // Skip blocks that don't look like questions
      if (!faqItem.question || faqItem.question.length < 3) return;

      // Source
      const srcMatch = block.match(/\*\*מקור:\*\*\s*(.+)/);
      faqItem.source = srcMatch ? srcMatch[1].trim() : '';

      // Answer
      const ansMatch = block.match(/\*\*תשובה:\*\*\s*([\s\S]+?)(?=\n\n<details|\n\n### |\n\n## |$)/);
      faqItem.answer = ansMatch ? ansMatch[1].trim() : '';

      // Simplified text
      const simpMatch = block.match(/<div class="simplified-question">\s*\n?([\s\S]+?)\n?\s*<\/div>/);
      faqItem.simplified_text = simpMatch ? simpMatch[1].trim() : '';

      if (faqItem.question) concept.faq.push(faqItem);
    });
  }

  // Comparison Table (📊 טבלת השוואה)
  const cmpMatch = content.match(/## .{1,4}טבלת השוואה[^\n]*\n\n([\s\S]+?)(?=\n## )/);
  if (cmpMatch) {
    const tableLines = cmpMatch[1].trim().split('\n').filter(l => l.includes('|'));
    if (tableLines.length >= 3) {
      const parseRow = line => line.split('|').map(c => c.trim()).filter(c => c);
      concept.comparisonTable = {
        title: '',
        headers: parseRow(tableLines[0]),
        rows: tableLines.slice(2).map(parseRow) // Skip separator line
      };
      // Try to find title
      const tblTitle = cmpMatch[1].match(/###?\s*\*?\*?(.+?)\*?\*?\s*\n/);
      if (tblTitle) concept.comparisonTable.title = tblTitle[1].trim();
    }
  }

  // Key Points (🔑 or ✅ נקודות מרכזיות / מפתח)
  const kpMatch = content.match(/## .{1,4}נקודות (?:מרכזיות לזכור|מפתח)[^\n]*\n\n([\s\S]+?)(?=\n## |$)/);
  if (kpMatch) {
    concept.keyPoints = kpMatch[1].trim().split('\n')
      .filter(l => l.match(/^[✅•\-\d\.]/))
      .map(l => l.replace(/^[✅•\-\d\.]\s*/, '').trim())
      .filter(l => l);
  }

  // Learning Tip (💡 or 🎓 טיפ)
  const tipMatch = content.match(/## .{1,4}טיפ (?:ללמידה|למידה)[^\n]*\n\n([\s\S]+?)(?=\n## |$)/);
  if (tipMatch) {
    const tipContent = tipMatch[1].trim();
    const methodMatch = tipContent.match(/\*\*שיטה:\*\*\s*(.+)/);
    concept.learningTip = {
      method: methodMatch ? methodMatch[1].trim() : '',
      content: tipContent.replace(/\*\*שיטה:\*\*\s*.+\n?/, '').trim()
    };
  }

  return concept;
}

function processDirectory(inputDir, outputFile) {
  if (!fs.existsSync(inputDir)) {
    console.error(`Directory not found: ${inputDir}`);
    process.exit(1);
  }

  const mdFiles = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.md') && f.startsWith('concept-'))
    .sort();

  if (mdFiles.length === 0) {
    console.error(`No concept-*.md files found in ${inputDir}`);
    process.exit(1);
  }

  console.log(`Found ${mdFiles.length} concept files:`);
  const concepts = [];

  mdFiles.forEach(file => {
    const filePath = path.join(inputDir, file);
    console.log(`  Parsing: ${file}`);
    try {
      const concept = parseConceptMd(filePath);
      concepts.push(concept);
      const faqCount = concept.faq ? concept.faq.length : 0;
      const simpCount = concept.faq ? concept.faq.filter(q => q.simplified_text).length : 0;
      console.log(`    → "${concept.title}" | ${faqCount} FAQ (${simpCount} with simplify) | ${(concept.keyPoints || []).length} key points`);
    } catch (e) {
      console.error(`    ✗ Error: ${e.message}`);
    }
  });

  const output = outputFile || 'concepts-parsed.json';
  fs.writeFileSync(output, JSON.stringify(concepts, null, 2), 'utf8');
  console.log(`\n✅ Saved ${concepts.length} concepts to ${output}`);
  return concepts;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/md_to_json_v2.cjs <input-dir> [output-file]');
    console.log('Example: node scripts/md_to_json_v2.cjs /home/user/uploaded_files/unit-03 unit-03.json');
    process.exit(0);
  }
  processDirectory(args[0], args[1]);
}

module.exports = { parseConceptMd, processDirectory };
