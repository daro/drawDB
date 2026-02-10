import SVGPathCommander from 'svg-path-commander';
const segments = SVGPathCommander.parsePathString('M0 0 L100 0 L100 100');
console.log('Segments:', JSON.stringify(segments));
