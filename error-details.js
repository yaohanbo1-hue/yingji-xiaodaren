const fs = require('fs');
const line = fs.readFileSync('game-engines.js', 'utf-8').split(/\r?\n/)[357];

// Try to parse and get detailed error info
try {
  new Function(line);
} catch(e) {
  console.log('Error message:', e.message);
  console.log('Error name:', e.name);
  console.log('Error properties:', Object.keys(e));
  console.log('Error stack:', e.stack);
  
  // Check if there's position info
  if (e.pos !== undefined) console.log('Error pos:', e.pos);
  if (e.loc !== undefined) console.log('Error loc:', e.loc);
}

// Try with vm module
try {
  require('vm').runInNewContext(line);
} catch(e) {
  console.log('VM Error message:', e.message);
  console.log('VM Error stack:', e.stack);
}

// Try to compile as a Script to get better error info
try {
  new (require('vm').Script)(line, { filename: 'test.js' });
} catch(e) {
  console.log('Script Error message:', e.message);
  console.log('Script Error stack:', e.stack);
}
