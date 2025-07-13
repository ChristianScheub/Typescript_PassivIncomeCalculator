# Build and Release System

This project includes automated build prerequisites and GitHub Actions workflow for creating releases.

## Build Prerequisites

The build system enforces quality checks before allowing builds to proceed:

### Lint Check
- **Requirement**: Fewer than 40 lint issues total (errors + warnings)
- **Current Status**: 291 issues found (builds will fail until this is reduced)
- **Script**: `npm run check-lint`
- **Implementation**: `scripts/check-lint.js`

### Tests
- **Requirement**: All tests must pass
- **Current Status**: No tests implemented (placeholder passes)
- **Script**: `npm run test`
- **Implementation**: `scripts/run-tests.js`

## NPM Scripts

The build prerequisites are enforced through npm scripts as requested:

```json
{
  "scripts": {
    "build": "npm run prebuild && tsc && vite build",
    "prebuild": "npm run check-lint && npm run test",
    "check-lint": "node scripts/check-lint.js",
    "test": "node scripts/run-tests.js"
  }
}
```

### How it works:
1. `npm run build` automatically calls `prebuild` first
2. `prebuild` runs lint check and tests
3. If either fails, the build is blocked
4. Only successful builds proceed to TypeScript compilation and Vite build

## GitHub Actions Workflow

Location: `.github/workflows/build-and-release.yml`

### Triggers:
- **Tags**: Any tag starting with `v` (e.g., `v1.0.0`, `v2.1.3`)
- **Manual**: Can be triggered manually via GitHub Actions UI

### Process:
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (`npm ci`)
4. ✅ Build application (`npm run build`)
   - This automatically runs lint check and tests due to prebuild script
   - **Fails if lint issues >= 40 or tests fail**
5. ✅ Create release archives (tar.gz and zip)
6. ✅ Create GitHub release with build information
7. ✅ Upload build artifacts

### Release Assets:
- `passive-income-calculator-{version}.tar.gz`
- `passive-income-calculator-{version}.zip`

## Current Status

⚠️ **Builds are currently blocked** due to 291 lint issues (requirement: < 40)

To enable builds:
1. Fix lint issues to get below 40 total issues
2. Or run individual commands:
   - `npm run lint` - See all lint issues
   - `npm run lint -- --fix` - Auto-fix some issues
   - `npm run check-lint` - Check if build would be allowed

## Testing the Workflow

To test the release workflow:

1. Fix lint issues to get below 40
2. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will automatically build and create a release

## Files Created/Modified

- `package.json` - Updated build scripts with prerequisites
- `scripts/check-lint.js` - Lint threshold checker
- `scripts/run-tests.js` - Test runner (placeholder)
- `.github/workflows/build-and-release.yml` - Release automation