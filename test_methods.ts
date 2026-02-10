import SVGPathCommander from 'svg-path-commander';
const segments = [['M', 0, 0], ['L', 100, 0], ['L', 100, 100]];
const commander = new SVGPathCommander('M0 0 L100 0 L100 100');
// @ts-ignore
if (commander.smooth) {
  // @ts-ignore
  console.log('Smooth exists');
} else {
  console.log('Smooth does not exist');
}
console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(commander)));
