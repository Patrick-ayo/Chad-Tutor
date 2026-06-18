const fs = require('fs');
const path = require('path');

const printFile = (filePath) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`=== ${filePath} ===`);
    console.log(fs.readFileSync(fullPath, 'utf8'));
  } else {
    console.log(`=== ${filePath} (Not Found) ===`);
  }
};

printFile('.env');
printFile('.env.local');
