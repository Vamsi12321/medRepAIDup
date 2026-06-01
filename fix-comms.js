const fs = require('fs');
let c = fs.readFileSync('app/mr/announcements/page.js', 'utf8');

// Replace all purple/indigo with orange equivalents
c = c.replace(/from-indigo-700 via-purple-700 to-pink-700/g, 'from-orange-500 via-red-500 to-pink-600');
c = c.replace(/from-indigo-600 to-purple-600/g, 'from-orange-500 to-red-500');
c = c.replace(/from-indigo-500 to-purple-500/g, 'from-orange-500 to-red-500');
c = c.replace(/from-purple-600 to-indigo-600/g, 'from-orange-500 to-red-500');
c = c.replace(/from-purple-500 to-indigo-500/g, 'from-orange-500 to-red-500');
c = c.replace(/bg-indigo-600/g, 'bg-orange-500');
c = c.replace(/bg-indigo-500/g, 'bg-orange-500');
c = c.replace(/bg-purple-600/g, 'bg-orange-500');
c = c.replace(/bg-purple-500/g, 'bg-orange-500');
c = c.replace(/text-indigo-600/g, 'text-orange-600');
c = c.replace(/text-indigo-500/g, 'text-orange-500');
c = c.replace(/text-purple-600/g, 'text-orange-600');
c = c.replace(/text-purple-500/g, 'text-orange-500');
c = c.replace(/bg-indigo-50/g, 'bg-orange-50');
c = c.replace(/bg-purple-50/g, 'bg-orange-50');
c = c.replace(/text-indigo-700/g, 'text-orange-700');
c = c.replace(/text-purple-700/g, 'text-orange-700');
c = c.replace(/border-indigo/g, 'border-orange');
c = c.replace(/border-purple/g, 'border-orange');
c = c.replace(/ring-indigo/g, 'ring-orange');
c = c.replace(/ring-purple/g, 'ring-orange');
c = c.replace(/focus:ring-indigo/g, 'focus:ring-orange');
c = c.replace(/hover:bg-indigo/g, 'hover:bg-orange');
c = c.replace(/hover:text-indigo/g, 'hover:text-orange');

fs.writeFileSync('app/mr/announcements/page.js', c);
console.log('Fixed announcements page');

// Verify remaining
const remaining = [...c.matchAll(/from-indigo|from-purple|to-purple|to-indigo|bg-indigo|bg-purple|text-indigo|text-purple/g)].map(m=>m[0]);
console.log('Remaining:', [...new Set(remaining)]);
