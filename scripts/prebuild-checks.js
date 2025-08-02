
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
      error: (file) => `container: ${file} must end with 'Container.tsx' (except index.ts)`
    },
    {
      dir: path.join(srcDir, 'view'),
      valid: (name) => name.endsWith('View.tsx'),
      error: (file) => `view: ${file} must end with 'View.tsx'`
    },
    {
      dir: path.join(srcDir, 'workers'),
      valid: (name) => name.endsWith('Worker.ts'),
      error: (file) => `workers: ${file} must end with 'Worker.ts'`
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

// 2. Types Check (block build except for storeConfig.ts)
const typeViolations = [];
const allowedTypeExportFile = path.join(srcDir, 'store', 'config', 'storeConfig.ts');
walkDir(srcDir, (file) => {
  if (file.includes(`${path.sep}types${path.sep}`)) return;
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  if (/export\s+type\s+/.test(content)) {
    // Only allow storeConfig.ts
    if (path.resolve(file) !== path.resolve(allowedTypeExportFile)) {
      typeViolations.push(`Types Check: Found 'export type' outside of 'types/' in file ${path.relative(projectRoot, file)}.`);
    }
  }
});

if (checks.length > 0 || typeViolations.length > 0) {
  console.error('\n\x1b[31mPre-Build Checks failed!\x1b[0m');
  checks.forEach((msg) => console.error('- ' + msg));
  if (typeViolations.length > 0) {
    console.error('\n\x1b[31mTypes Check Violations (block build):\x1b[0m');
    typeViolations.forEach((msg) => console.error('- ' + msg));
  }
  process.exit(1);
} else {
  console.log('\x1b[32mPre-Build Checks successful.\x1b[0m');
}

// 3. Heuristic: View vs. Container Check
function analyzeFile(filePath) {
  const ext = path.extname(filePath);
  if (!targetExtensions.includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  let hits = 0;

  if (fileName.includes('Container')) {
    hits++;
    console.log(`+1 Point: 'Container' in filename → ${filePath}`);
  }

  if (filePath.includes('/views/')) {
    hits++;
    console.log(`+1 Point: File in 'views' folder → ${filePath}`);
  }

  if (content.includes('useEffect')) {
    hits++;
    console.log(`+1 Point: useEffect in file → ${filePath}`);
  }

  if (content.includes('useState')) {
    hits++;
    console.log(`+1 Point: useState in file → ${filePath}`);
  }

  if (hits > 0) {
    console.log(`➡ Total points for ${filePath}: ${hits}`);
    console.log('------------------------------------------');
  }
}

const viewDir = path.join(srcDir, 'view');
if (fs.existsSync(viewDir)) {
  console.log(`🔍 Starting analysis of all files under "${viewDir}" ...\n`);
  walkDir(viewDir, analyzeFile);
  console.log(`✅ Analysis completed.\n`);
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
    consoleLogViolations.push(`Console Log Check: Found 'console.log' in file ${path.relative(projectRoot, file)}.`);
  }
});

if (consoleLogViolations.length > 0) {
  console.error('\n\x1b[31mPre-Build Checks failed!\x1b[0m');
  consoleLogViolations.forEach((msg) => console.error('- ' + msg));
  process.exit(1);
}


// 5. Types Usage Check: All types exported in types folder must be used somewhere in types or src folder
(() => {
  const unusedTypes = [];
  const typesDir = path.join(srcDir, 'types');
  if (fs.existsSync(typesDir)) {
    // Collect all exported types in types folder
    const exportedTypes = [];
    walkDir(typesDir, (file) => {
      if (!file.endsWith('.ts')) return;
      const content = fs.readFileSync(file, 'utf8');
      // Find all "export type <TypeName>"
      const matches = [...content.matchAll(/export\s+type\s+(\w+)/g)];
      matches.forEach((m) => {
        exportedTypes.push({ typeName: m[1], file });
      });
    });

    // For each exported type, check if it's used anywhere in types or src folder
    exportedTypes.forEach(({ typeName, file }) => {
      let used = false;
      // Search in own export file, but ignore the actual export line
      const ownContent = fs.readFileSync(file, 'utf8');
      
      // Remove the export line for this type and then check the rest
      const exportPattern = new RegExp(`^\\s*export\\s+type\\s+${typeName}\\b.*$`, 'gm');
      const contentWithoutExport = ownContent.replace(exportPattern, '');
      
      // Check if the type is used in the remaining content as TypeScript type
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
        `\\b${typeName}\\s*;|` +             // Property with type: propertyName: TypeName;
        `\\)\\s*:\\s*${typeName}\\b|` +      // Function return type: ): TypeName
        `let\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Variable declaration: let variable: TypeName
        `const\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Const declaration: const variable: TypeName
        `var\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Var declaration: var variable: TypeName
        `Record<[^,>]+,\\s*${typeName}\\b|` + // Record utility type: Record<Key, TypeName>
        `Record<\\s*[^,>]+\\s*,\\s*${typeName}\\b|` + // Record with spaces: Record< Key , TypeName>
        `ZodObject<Record<[^,>]+,\\s*${typeName}\\b|` + // ZodObject<Record<Key, TypeName>>
        `z\\.ZodObject<Record<[^,>]+,\\s*${typeName}\\b|` + // z.ZodObject<Record<Key, TypeName>>
        `Omit<[^,]+,\\s*${typeName}\\b|` +   // Omit utility type: Omit<Type, TypeName>
        `Pick<[^,]+,\\s*${typeName}\\b|` +   // Pick utility type: Pick<Type, TypeName>
        `Exclude<[^,]+,\\s*${typeName}\\b|` + // Exclude utility type: Exclude<Type, TypeName>
        `Extract<[^,]+,\\s*${typeName}\\b` +  // Extract utility type: Extract<Type, TypeName>
        `)`, 'gm'
      );
      if (typeUsagePattern.test(contentWithoutExport)) {
        used = true;
      }
      // Search in types folder (other files)
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
      // Search in rest of src folder (outside of types)
      if (!used) {
        walkDir(srcDir, (f) => {
          if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
          if (f.includes(`${path.sep}types${path.sep}`)) return; // Skip types folder
          const c = fs.readFileSync(f, 'utf8');
          
          // First check if the type is imported from types/ (handle multiline imports)
          const importPattern = new RegExp(
            `import\\s*(?:\\{[^}]*\\b${typeName}\\b[^}]*\\}|.*\\b${typeName}\\b.*)\\s*from\\s*['"].*(?:types|@/types).*['"]`, 'gm'
          );
          
          // Only if the type is imported, then search for usage
          if (importPattern.test(c)) {
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
              `\\b${typeName}\\s*;|` +             // Property with type: propertyName: TypeName;
              `\\)\\s*:\\s*${typeName}\\b|` +      // Function return type: ): TypeName
              `let\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Variable declaration: let variable: TypeName
              `const\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Const declaration: const variable: TypeName
              `var\\s+\\w+\\s*:\\s*${typeName}\\b|` + // Var declaration: var variable: TypeName
              `Record<[^,>]+,\\s*${typeName}\\b|` + // Record utility type: Record<Key, TypeName>
              `Record<\\s*[^,>]+\\s*,\\s*${typeName}\\b|` + // Record with spaces: Record< Key , TypeName>
              `ZodObject<Record<[^,>]+,\\s*${typeName}\\b|` + // ZodObject<Record<Key, TypeName>>
              `z\\.ZodObject<Record<[^,>]+,\\s*${typeName}\\b|` + // z.ZodObject<Record<Key, TypeName>>
              `Omit<[^,]+,\\s*${typeName}\\b|` +   // Omit utility type: Omit<Type, TypeName>
              `Pick<[^,]+,\\s*${typeName}\\b|` +   // Pick utility type: Pick<Type, TypeName>
              `Exclude<[^,]+,\\s*${typeName}\\b|` + // Exclude utility type: Exclude<Type, TypeName>
              `Extract<[^,]+,\\s*${typeName}\\b` +  // Extract utility type: Extract<Type, TypeName>
              `)`, 'gm'
            );
            if (typeUsagePattern.test(c)) {
              used = true;
            }
          }
        });
      }
      if (!used) {
        unusedTypes.push(`Unused Type: '${typeName}' from '${path.relative(projectRoot, file)}' is exported but not used anywhere.`);
      }
    });
  }
  if (unusedTypes.length > 0) {
    console.error(`\n\x1b[31mUnused Types found (${unusedTypes.length}) (block build):\x1b[0m`);
    unusedTypes.forEach((msg) => console.error('- ' + msg));
    process.exit(1);
  }
})();