#!/usr/bin/env node
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

