
/**
 * Pre-Build Checks for Naming, Types, Console Logs, and Heuristics (ESM)
 * - File Name Check: Enforce naming conventions in container, view, workers
 * - Types Check: No `export type` outside of types/
 * - Console Log Check: No `console.log` in .ts/.tsx files outside of scripts/ or workers/
 * - Heuristic Check: Analyze files in the view directory for patterns like useEffect, useState, etc.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const checks = [];
const targetExtensions = ['.tsx', '.ts', '.js'];


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

// 1. File Name Check
defaultFileNameCheck();
function defaultFileNameCheck() {
  const rules = [
    {
      dir: path.join(srcDir, 'container'),
      valid: (name) => name === 'index.ts' || name.endsWith('Container.tsx'),
      error: (file) => `container: ${file} muss mit 'Container.tsx' enden (außer index.ts)`
    },
    {
      dir: path.join(srcDir, 'view'),
      valid: (name) => name.endsWith('View.tsx'),
      error: (file) => `view: ${file} muss mit 'View.tsx' enden`
    },
    {
      dir: path.join(srcDir, 'workers'),
      valid: (name) => name.endsWith('Worker.ts'),
      error: (file) => `workers: ${file} muss mit 'Worker.ts' enden`
    },
  ];
  rules.forEach(({ dir, valid, error }) => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, (file) => {
      const base = path.basename(file);
      if (base === '.DS_Store') return; // Ignore macOS system files
      if (!valid(base)) {
        checks.push(error(path.relative(projectRoot, file)));
      }
    });
  });
}

// 2. Types Check (nur loggen, nicht build blockieren)
const typeViolations = [];
walkDir(srcDir, (file) => {
  if (file.includes(`${path.sep}types${path.sep}`)) return;
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  if (/export\s+type\s+/.test(content)) {
    typeViolations.push(`Types Check: In Datei ${path.relative(projectRoot, file)} ist ein 'export type' außerhalb von 'types/' gefunden worden.`);
  }
});

if (checks.length > 0) {
  console.error('\n\x1b[31mPre-Build Checks fehlgeschlagen!\x1b[0m');
  checks.forEach((msg) => console.error('- ' + msg));
  if (typeViolations.length > 0) {
    console.warn('\n\x1b[33mTypes Check Warnungen (blockieren Build nicht):\x1b[0m');
    typeViolations.forEach((msg) => console.warn('- ' + msg));
  }
  console.log('\n\x1b[31mWeitere Checks werden ausgeführt ...\x1b[0m');
  process.exit(1);
} else {
  if (typeViolations.length > 0) {
    console.warn('\n\x1b[33mTypes Check Warnungen (blockieren Build nicht):\x1b[0m');
    typeViolations.forEach((msg) => console.warn('- ' + msg));
  }
  console.log('\x1b[32mPre-Build Checks erfolgreich.\x1b[0m');
}

// 3. Heuristik: View vs. Container Check
function analyzeFile(filePath) {
  const ext = path.extname(filePath);
  if (!targetExtensions.includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  let hits = 0;

  if (fileName.includes('Container')) {
    hits++;
    console.log(`+1 Punkt: 'Container' im Dateinamen → ${filePath}`);
  }

  if (filePath.includes('/views/')) {
    hits++;
    console.log(`+1 Punkt: Datei liegt im 'views'-Ordner → ${filePath}`);
  }

  if (content.includes('useEffect')) {
    hits++;
    console.log(`+1 Punkt: useEffect in Datei → ${filePath}`);
  }

  if (content.includes('useState')) {
    hits++;
    console.log(`+1 Punkt: useState in Datei → ${filePath}`);
  }

  if (hits > 0) {
    console.log(`➡ Gesamtpunkte für ${filePath}: ${hits}`);
    console.log('------------------------------------------');
  }
}

const viewDir = path.join(srcDir, 'view');
if (fs.existsSync(viewDir)) {
  console.log(`🔍 Starte Analyse aller Dateien unter "${viewDir}" ...\n`);
  walkDir(viewDir, analyzeFile);
  console.log(`✅ Analyse abgeschlossen.\n`);
}

// 4. Console Log Check
const consoleLogViolations = [];
walkDir(srcDir, (file) => {
  if (
    file.includes(`${path.sep}scripts${path.sep}`) ||
    file.includes(`${path.sep}workers${path.sep}`) ||
    file.includes('.test.') || // Allow console.log in .test. files
    file.endsWith('logger.ts') // Allow console.log in logger.ts
  ) {
    return;
  }
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  if (/console\.log\(/.test(content)) {
    consoleLogViolations.push(`Console Log Check: In Datei ${path.relative(projectRoot, file)} wurde ein 'console.log' gefunden.`);
  }
});

if (consoleLogViolations.length > 0) {
  console.error('\n\x1b[31mPre-Build Checks fehlgeschlagen!\x1b[0m');
  consoleLogViolations.forEach((msg) => console.error('- ' + msg));
  process.exit(1);
}


// 5. Types Usage Check: Alle im types-Ordner exportierten Typen müssen irgendwo im Types- oder src-Ordner verwendet werden
(() => {
  const unusedTypes = [];
  const typesDir = path.join(srcDir, 'types');
  if (fs.existsSync(typesDir)) {
    // Alle exportierten Typen im types-Ordner sammeln
    const exportedTypes = [];
    walkDir(typesDir, (file) => {
      if (!file.endsWith('.ts')) return;
      const content = fs.readFileSync(file, 'utf8');
      // Finde alle "export type <TypeName>"
      const matches = [...content.matchAll(/export\s+type\s+(\w+)/g)];
      matches.forEach((m) => {
        exportedTypes.push({ typeName: m[1], file });
      });
    });

    // Für jeden exportierten Typ prüfen, ob er irgendwo im types- oder src-Ordner verwendet wird
    exportedTypes.forEach(({ typeName, file }) => {
      let used = false;
      // Suche in der eigenen Exportdatei, aber ignoriere die eigentliche Exportzeile
      const ownContent = fs.readFileSync(file, 'utf8');
      
      // Entferne die Export-Zeile für diesen Typ und prüfe dann den Rest
      const exportPattern = new RegExp(`^\\s*export\\s+type\\s+${typeName}\\b.*$`, 'gm');
      const contentWithoutExport = ownContent.replace(exportPattern, '');
      
      // Prüfe, ob der Typ im verbleibenden Inhalt als TypeScript-Typ verwendet wird
      const typeUsagePattern = new RegExp(
        `(?:^|[^\\w])(?:` +
        `${typeName}\\s*[\\[<]|` +           // Array/Generic syntax: TypeName[, TypeName<
        `:\\s*${typeName}\\b|` +             // Type annotation: : TypeName
        `:\\s*\\([^)]*:\\s*${typeName}\\b|` + // Function parameter type: : (param: TypeName
        `\\w+\\s*:\\s*${typeName}\\b|` +     // Parameter declaration: paramName: TypeName
        `<\\s*${typeName}\\b|` +             // Generic parameter: <TypeName
        `extends\\s+${typeName}\\b|` +       // Interface extension: extends TypeName
        `implements\\s+${typeName}\\b|` +    // Interface implementation: implements TypeName
        `as\\s+${typeName}\\b|` +            // Type assertion: as TypeName
        `=\\s*${typeName}\\b|` +             // Type alias assignment: = TypeName
        `\\|\\s*${typeName}\\b|` +           // Union type: | TypeName
        `&\\s*${typeName}\\b|` +             // Intersection type: & TypeName
        `\\b${typeName}\\s*;` +              // Property with type: propertyName: TypeName;
        `)`, 'gm'
      );
      if (typeUsagePattern.test(contentWithoutExport)) {
        used = true;
      }
      // Suche im types-Ordner (andere Dateien)
      if (!used) {
        walkDir(typesDir, (f) => {
          if (!f.endsWith('.ts')) return;
          if (f === file) return;
          const c = fs.readFileSync(f, 'utf8');
          const typeUsagePattern = new RegExp(
            `(?:^|[^\\w])(?:` +
            `${typeName}\\s*[\\[<]|` +           // Array/Generic syntax: TypeName[, TypeName<
            `:\\s*${typeName}\\b|` +             // Type annotation: : TypeName
            `<\\s*${typeName}\\b|` +             // Generic parameter: <TypeName
            `extends\\s+${typeName}\\b|` +       // Interface extension: extends TypeName
            `implements\\s+${typeName}\\b|` +    // Interface implementation: implements TypeName
            `as\\s+${typeName}\\b|` +            // Type assertion: as TypeName
            `=\\s*${typeName}\\b|` +             // Type alias assignment: = TypeName
            `\\|\\s*${typeName}\\b|` +           // Union type: | TypeName
            `&\\s*${typeName}\\b|` +             // Intersection type: & TypeName
            `\\b${typeName}\\s*;` +              // Property with type: propertyName: TypeName;
            `)`, 'gm'
          );
          if (typeUsagePattern.test(c)) {
            used = true;
          }
        });
      }
      // Suche im restlichen src-Ordner (außerhalb von types)
      if (!used) {
        walkDir(srcDir, (f) => {
          if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
          if (f.includes(`${path.sep}types${path.sep}`)) return; // types-Ordner überspringen
          const c = fs.readFileSync(f, 'utf8');
          const typeUsagePattern = new RegExp(
            `(?:^|[^\\w])(?:` +
            `${typeName}\\s*[\\[<]|` +           // Array/Generic syntax: TypeName[, TypeName<
            `:\\s*${typeName}\\b|` +             // Type annotation: : TypeName
            `<\\s*${typeName}\\b|` +             // Generic parameter: <TypeName
            `extends\\s+${typeName}\\b|` +       // Interface extension: extends TypeName
            `implements\\s+${typeName}\\b|` +    // Interface implementation: implements TypeName
            `as\\s+${typeName}\\b|` +            // Type assertion: as TypeName
            `=\\s*${typeName}\\b|` +             // Type alias assignment: = TypeName
            `\\|\\s*${typeName}\\b|` +           // Union type: | TypeName
            `&\\s*${typeName}\\b|` +             // Intersection type: & TypeName
            `import.*\\b${typeName}\\b|` +       // Import statement: import { TypeName }
            `\\b${typeName}\\s*;` +              // Property with type: propertyName: TypeName;
            `)`, 'gm'
          );
          if (typeUsagePattern.test(c)) {
            used = true;
          }
        });
      }
      if (!used) {
        unusedTypes.push(`Unused Type: '${typeName}' von '${path.relative(projectRoot, file)}' wird exportiert, aber nirgends verwendet.`);
      }
    });
  }
  if (unusedTypes.length > 0) {
    console.error(`\n\x1b[31mUnused Types gefunden (${unusedTypes.length}) (blockieren Build):\x1b[0m`);
    unusedTypes.forEach((msg) => console.error('- ' + msg));
    process.exit(1);
  }
})();