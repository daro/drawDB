import SVGPathCommander from 'svg-path-commander';
const segments = [['M', 0, 0], ['L', 100, 0], ['L', 100, 100]];
const path = SVGPathCommander.pathToString(segments as any);
const commander = new SVGPathCommander(path);
console.log('Result:', commander.toCurve().toString());
