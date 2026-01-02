import assert from 'assert'
import {hexFromRGB, nameFromColor} from '../src/utils.js'

// hexFromRGB
assert.strictEqual(hexFromRGB(255,0,0), '#ff0000')
assert.strictEqual(hexFromRGB(0,255,0), '#00ff00')
assert.strictEqual(hexFromRGB(0,0,255), '#0000ff')

// nameFromColor expectations based on hue ranges in utils
assert.strictEqual(nameFromColor(255,0,0), '火焰怪') // red
assert.strictEqual(nameFromColor(255,255,0), '陽光怪') // yellow
assert.strictEqual(nameFromColor(0,255,0), '草地怪') // green
assert.strictEqual(nameFromColor(0,128,255), '夜空怪') // blue-ish

console.log('All utils tests passed')
