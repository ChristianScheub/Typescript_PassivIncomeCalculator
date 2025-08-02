/**
 * Language Key Check Script
 *
 * Checks:
 * 1. All translation keys from de.json are used somewhere in src/ (or types/)
 * 2. Finds all usages of translation keys in src/ that are not present in de.json (missing translations)
 *
 * Usage: node scripts/language-key-check.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const localesDir = path.join(srcDir, 'locales');
const deJsonPath = path.join(localesDir, 'de.json');

if (!fs.existsSync(deJsonPath)) {
  console.error(`\x1b[31mde.json not found at ${deJsonPath}\x1b[0m`);
  process.exit(1);
}

// Load all keys from de.json (deep keys, e.g. a.b.c)
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getAllKeys(obj[k], prefix ? `${prefix}.${k}` : k));
    } else {
      keys.push(prefix ? `${prefix}.${k}` : k);
    }
  }
  return keys;
}

const deJson = JSON.parse(fs.readFileSync(deJsonPath, 'utf8'));
const allTranslationKeys = getAllKeys(deJson);

// Find all translation key usages in src/ (e.g. t('key'), t("key"), t(`key`))
function walkDir(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

const usedKeys = new Set();
const missingKeys = new Set();
const keyUsagePattern = /t\s*\(\s*(['"`])([^'"`]+)\1/g;

walkDir(srcDir, (file) => {
  if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js')) return;
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyUsagePattern.exec(content)) !== null) {
    const key = match[2];
    usedKeys.add(key);
    if (!allTranslationKeys.includes(key)) {
      missingKeys.add(key);
    }
  }
});

// 1. Check for unused keys in de.json
const unusedKeys = allTranslationKeys.filter((key) => !usedKeys.has(key));
if (unusedKeys.length > 0) {
  console.error(`\n\x1b[31mUnused translation keys in de.json (${unusedKeys.length}):\x1b[0m`);
  unusedKeys.forEach((key) => console.error('- ' + key));
}

// 2. Check for missing translations (used but not present in de.json)
if (missingKeys.size > 0) {
  console.error(`\n\x1b[31mMissing translation keys (used in code but not in de.json) (${missingKeys.size}):\x1b[0m`);
  missingKeys.forEach((key) => console.error('- ' + key));
}

if (unusedKeys.length === 0 && missingKeys.size === 0) {
  console.log('\x1b[32mLanguage Key Check successful. All keys are used and present.\x1b[0m');
  process.exit(0);
} else {
  process.exit(1);
}
