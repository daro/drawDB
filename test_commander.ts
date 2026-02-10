import SVGPathCommander from 'svg-path-commander';
const path = 'M0 0 L100 0 L100 100';
const commander = new SVGPathCommander(path);
console.log('Original:', path);
console.log('Absolute:', commander.toAbsolute().toString());
console.log('Curve:', commander.toCurve().toString());
