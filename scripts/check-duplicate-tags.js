/**
 * Script to check for duplicate tags within each card in templates.json
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_FILE = path.join(__dirname, '../static/templates.json');

function checkDuplicateTags() {
  try {
    // Read templates.json
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    const templates = JSON.parse(data);

    console.log('🔍 Scanning for duplicate tags in cards...\n');
    console.log(`Total cards to check: ${templates.length}\n`);

    let duplicateCount = 0;
    const duplicates = [];

    // Check each card for duplicate tags
    templates.forEach((card, index) => {
      if (!card.tags || !Array.isArray(card.tags)) {
        return;
      }

      // Find duplicates in the tags array
      const tagCounts = {};
      const duplicatesInCard = [];

      card.tags.forEach((tag, tagIndex) => {
        if (tagCounts[tag]) {
          tagCounts[tag].push(tagIndex);
        } else {
          tagCounts[tag] = [tagIndex];
        }
      });

      // Check for duplicates
      Object.keys(tagCounts).forEach((tag) => {
        if (tagCounts[tag].length > 1) {
          duplicatesInCard.push({
            tag: tag,
            occurrences: tagCounts[tag].length,
            indices: tagCounts[tag]
          });
        }
      });

      if (duplicatesInCard.length > 0) {
        duplicateCount++;
        duplicates.push({
          cardIndex: index + 1,
          title: card.title || 'Untitled',
          tags: card.tags,
          duplicates: duplicatesInCard
        });
      }
    });

    // Report results
    if (duplicateCount === 0) {
      console.log('✅ No duplicate tags found! All cards are clean.\n');
    } else {
      console.log(`❌ Found ${duplicateCount} card(s) with duplicate tags:\n`);
      console.log('='.repeat(80));

      duplicates.forEach((item) => {
        console.log(`\n📌 Card #${item.cardIndex}: ${item.title}`);
        console.log(`   Tags: [${item.tags.join(', ')}]`);
        console.log(`   Duplicates found:`);
        
        item.duplicates.forEach((dup) => {
          console.log(`     - "${dup.tag}" appears ${dup.occurrences} times at indices: [${dup.indices.join(', ')}]`);
        });
        
        console.log(`\n   🔧 Fix: Remove duplicate "${item.duplicates.map(d => d.tag).join('", "')}" from the tags array`);
        console.log(`   Suggested tags: [${[...new Set(item.tags)].join(', ')}]`);
        console.log('-'.repeat(80));
      });

      console.log(`\n📊 Summary:`);
      console.log(`   Total cards checked: ${templates.length}`);
      console.log(`   Cards with duplicates: ${duplicateCount}`);
      console.log(`   Clean cards: ${templates.length - duplicateCount}\n`);
    }

    return duplicateCount;
  } catch (error) {
    console.error('❌ Error checking for duplicate tags:', error.message);
    process.exit(1);
  }
}

// Run the check
const duplicateCount = checkDuplicateTags();
process.exit(duplicateCount > 0 ? 1 : 0);
