const path = require('path')
const fs = require('fs')
const solc = require('solc')

const sourcePath = path.resolve(__dirname, 'contracts', 'Lottery.sol') // Path to file
const source = fs.readFileSync(sourcePath, 'utf8')

console.log('sourcePath = ' + sourcePath)
console.log('compileSource: ' + source)

console.log('Compiling...')
let compilation = solc.compile(source, 1)
console.log('Result: ' + JSON.stringify(compilation))
module.exports = compilation.contracts[':Lottery']
