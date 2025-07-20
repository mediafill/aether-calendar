const fs = require('fs');
const path = require('path');

// Copy shared types to web app
const sharedTypesPath = path.join(__dirname, '../../packages/shared-types/src');
const webTypesPath = path.join(__dirname, 'src/types');

if (!fs.existsSync(webTypesPath)) {
  fs.mkdirSync(webTypesPath, { recursive: true });
}

// Copy the shared types file
const indexTs = fs.readFileSync(path.join(sharedTypesPath, 'index.ts'), 'utf8');
fs.writeFileSync(path.join(webTypesPath, 'shared.ts'), indexTs);

console.log('✅ Copied shared types for standalone build');

// Create standalone package.json
const originalPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const standalonePkg = {
  ...originalPkg,
  dependencies: {
    ...originalPkg.dependencies,
    // Remove workspace dependencies
  }
};

// Remove workspace references
delete standalonePkg.dependencies['@aether/config'];
delete standalonePkg.dependencies['@aether/shared-types'];
delete standalonePkg.dependencies['@aether/ui'];

fs.writeFileSync('package.standalone.json', JSON.stringify(standalonePkg, null, 2));
console.log('✅ Created standalone package.json');