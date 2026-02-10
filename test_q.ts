import SVGPathCommander from 'svg-path-commander';
const segments = [['M', 0, 0], ['L', 90, 0], ['Q', 100, 0, 100, 10], ['L', 100, 100]];
console.log('Path:', SVGPathCommander.pathToString(segments as any));
