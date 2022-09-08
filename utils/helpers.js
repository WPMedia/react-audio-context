

let colormap = require('colormap')
const fs = require('fs');

let colors = colormap({
    colormap: 'YIGnBu',
    nshades: 256,
    format: 'float',
    alpha: 1
})

console.log(colors);

const file = fs.createWriteStream('ello.txt');

file.on('error', (err) => {
  console.log('error!!:', err)
});

colors.forEach((v, i) => {
  file.write(v.join(', ') + '],[');
});

file.end();