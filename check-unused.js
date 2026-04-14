const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git') && (!file.includes('ui') || dir !== './src/components')) {
        results = results.concat(walk(file));
      }
    } else { 
      if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const allSrcFiles = walk('./src');
const componentsDir = './src/components';
let componentFiles = [];
if(fs.existsSync(componentsDir)){
  const list = fs.readdirSync(componentsDir);
  list.forEach(f => {
    let full = path.join(componentsDir, f);
    if (fs.statSync(full).isFile() && (full.endsWith('.tsx') || full.endsWith('.ts'))) {
        componentFiles.push(full);
    } else if (f === 'sidebar8' || f === 'sidebar10') {
        const subFiles = walk(full);
        componentFiles = componentFiles.concat(subFiles);
    }
  })
}

const unused = [];
componentFiles.forEach(compPath => {
  const compName = path.parse(compPath).name; // e.g., 'nav-main' or 'Sidebar'
  const compBase = path.basename(compPath);
  let isUsed = false;
  for(const srcFile of allSrcFiles) {
    if (srcFile === compPath) continue;
    const content = fs.readFileSync(srcFile, 'utf8');
    
    // Convert compName to PascalCase or match exact string for react components
    const isImported = content.includes(`/${compName}`) || content.includes(`/${compBase}`);
    // Also might be imported using relative paths
    if (isImported) {
      isUsed = true;
      break;
    }
  }
  if (!isUsed) unused.push(compPath);
});

console.log(JSON.stringify(unused, null, 2));
