const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');

fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import React if missing
    if (!content.includes('import React') && !content.includes('import * as React')) {
      content = "import React from 'react';\n" + content;
    }

    // Replace export default ComponentName; with export default React.memo(ComponentName);
    if (!content.includes('export default React.memo')) {
      content = content.replace(/export default ([A-Za-z0-9_]+);/g, 'export default React.memo($1);');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
