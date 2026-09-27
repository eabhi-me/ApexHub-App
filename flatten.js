const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'client', 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace neumorphic card backgrounds with pure white
  content = content.replace(/background:\s*['"]#eef0f5['"]/g, "background: '#ffffff'");
  
  // Replace neumorphic inset backgrounds with light gray
  content = content.replace(/background:\s*['"]#e4e6ef['"]/g, "background: '#f8fafc'");

  // Replace box-shadow values with 'none' or simple flat shadows
  // For neo.card: 
  content = content.replace(/boxShadow:\s*['"](?:inset\s+)?-?\d+px[^'"]+['"]/g, "boxShadow: 'none'");
  content = content.replace(/boxShadow:\s*`[^`]+`/g, "boxShadow: 'none'");
  content = content.replace(/boxShadow:\s*disabled\s*\?\s*'none'\s*:\s*`[^`]+`/g, "boxShadow: 'none'");
  
  // Replace linear gradients with the first color
  // Format: linear-gradient(135deg, #6366f1, #8b5cf6) -> #6366f1
  content = content.replace(/linear-gradient\([^,]+,\s*(#[a-fA-F0-9]{3,6})[^)]+\)/g, "$1");

  // Fix up borders
  content = content.replace(/border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.\d+['"]/g, "border: '1px solid #e2e8f0'");
  
  // Add some border to neo inset replacements if they had border
  content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,0.4\)['"]/g, "border: '1px solid #cbd5e1'");

  // Update neo object definitions manually for good measure
  content = content.replace(/boxShadow:\s*'(?:inset\s+)?-?\d+px[^']+'/g, "boxShadow: 'none'");
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Flat design overrides applied to ' + files.length + ' files.');
