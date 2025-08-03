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
      // Ignore __tests__ folders
      if (entry.name === '__tests__') return;
      walkDir(fullPath, callback);
    } else {
      // Ignore test files
      if (
        fullPath.endsWith('.test.ts') ||
        fullPath.endsWith('.test.tsx') ||
        fullPath.endsWith('.spec.ts') ||
        fullPath.endsWith('.spec.tsx')
      ) return;
      callback(fullPath);
    }
  });
}

const usedKeys = new Set();
const missingKeys = new Set();
const dynamicKeys = new Set();
const importKeys = new Set();
const keyUsagePattern = /t\s*\(\s*(['"`])([^'"`]+)\1/g;

walkDir(srcDir, (file) => {
  if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js')) return;
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyUsagePattern.exec(content)) !== null) {
    const key = match[2];
    // Ignore dynamic keys (template strings, variables, etc.)
    if (
      key.includes('${') || // template string
      key.includes('\n') || key.includes('\r') || // line breaks
      key.includes(',') || // comma separated
      key.includes('/') || key.includes('@') || key.includes('./') || key.includes('../') || // import/module path
      key.match(/\s/) // whitespace (likely not a real key)
    ) {
      // Collect import/module keys separately
      if (key.includes('/') || key.includes('@') || key.includes('./') || key.includes('../')) {
        importKeys.add(key);
      } else {
        dynamicKeys.add(key);
      }
      continue;
    }
    usedKeys.add(key);
    if (!allTranslationKeys.includes(key)) {
      missingKeys.add(key);
    }
  }
});

// 1. Check for unused keys in de.json (simple substring search in src/)
function isKeyUsedInSrc(key) {
  let found = false;
  walkDir(srcDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.js')) return;
    // Ignore test files and __tests__
    if (
      file.endsWith('.test.ts') ||
      file.endsWith('.test.tsx') ||
      file.endsWith('.spec.ts') ||
      file.endsWith('.spec.tsx') ||
      file.includes(`${path.sep}__tests__${path.sep}`)
    ) return;
    const content = fs.readFileSync(file, 'utf8');
    if (content.indexOf(key) !== -1) {
      found = true;
    }
  });
  return found;
}
const unusedKeys = allTranslationKeys.filter((key) => !isKeyUsedInSrc(key));

// Entferne die unusedKeys aus dem deJson Objekt (rekursiv)
function removeDeepKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) return;
    current = current[parts[i]];
  }
  const last = parts[parts.length - 1];
  // Prüfe ob Array-Index (z.B. "0")
  if (Array.isArray(current) && !isNaN(last)) {
    current.splice(Number(last), 1);
  } else {
    delete current[last];
  }
}
if (unusedKeys.length > 0) {
  unusedKeys.forEach((key) => removeDeepKey(deJson, key));
  fs.writeFileSync(deJsonPath, JSON.stringify(deJson, null, 2), 'utf8');
  console.error(`\n\x1b[31mUnused translation keys in de.json (${unusedKeys.length}) wurden automatisch entfernt und die Datei wurde aktualisiert.\x1b[0m`);
}

// 2. Check for missing translations (used but not present in de.json)
if (missingKeys.size > 0) {
  // Filter out obvious non-translation keys
  const filteredMissingKeys = Array.from(missingKeys).filter(key => {
    // Ignore keys that are just whitespace, line breaks, single chars, or technical/common words
    if (!key || key.length < 2) return false;
    if (/^\s+$/.test(key)) return false;
    if (key === '\n' || key === '\n\n' || key === '\r' || key === ',') return false;
    if (/^[a-zA-Z]$/.test(key)) return false;
    if (/^de-DE$|^en-US$|^redux$|^fetch$|^Uncategorized$|^portfolioIntradayData$|^portfolioHistory$/.test(key)) return false;
    // Ignore keys with only numbers
    if (/^\d+$/.test(key)) return false;
    // Ignore keys that look like file names or technical identifiers
    if (/\.(js|ts|tsx|json|css|png|jpg|svg)$/.test(key)) return false;
    return true;
  });
  if (filteredMissingKeys.length > 0) {
    console.error(`\n\x1b[31mMissing translation keys (used in code but not in de.json) (${filteredMissingKeys.length}):\x1b[0m`);
    filteredMissingKeys.forEach((key) => console.error('- ' + key));
  }
}

// 3. Show dynamic keys (template strings, variables, etc.)
if (dynamicKeys.size > 0) {
  console.warn(`\n\x1b[33mDynamic translation keys (not checked, may be valid at runtime) (${dynamicKeys.size}):\x1b[0m`);
  dynamicKeys.forEach((key) => console.warn('- ' + key));
}

// 4. Show import/module keys (likely not translation keys)
if (importKeys.size > 0) {
  console.warn(`\n\x1b[33mImport/Module-like keys found in t() (${importKeys.size}):\x1b[0m`);
  importKeys.forEach((key) => console.warn('- ' + key));
}

if (unusedKeys.length === 0 && missingKeys.size === 0) {
  console.log('\x1b[32mLanguage Key Check successful. All keys are used and present.\x1b[0m');
  process.exit(0);
} else {
  process.exit(1);
}
