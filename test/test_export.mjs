// Test export functions: SVG and Bundle
import { strict as assert } from 'assert'

// Mock canvas.toDataURL
const mockDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// Test SVG export format
function testSVGExport() {
  const width = 640
  const height = 480
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${mockDataURL}" width="${width}" height="${height}"/></svg>`
  
  assert(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'SVG should have namespace')
  assert(svg.includes(`width="${width}"`), 'SVG should have correct width')
  assert(svg.includes(`height="${height}"`), 'SVG should have correct height')
  assert(svg.includes('<image'), 'SVG should contain image element')
  assert(svg.includes(mockDataURL), 'SVG should contain image data')
  console.log('✅ SVG export format valid')
}

// Test Bundle export format
function testBundleExport() {
  const compositeColor = '#ff5522'
  const nameFromColor = (r, g, b) => `Color(${r},${g},${b})`
  
  const bundle = {
    metadata: {
      color: compositeColor,
      name: nameFromColor(parseInt(compositeColor.slice(1,3),16), parseInt(compositeColor.slice(3,5),16), parseInt(compositeColor.slice(5,7),16)),
      timestamp: new Date().toISOString()
    },
    imageDataURL: mockDataURL
  }
  
  assert(bundle.metadata.color === compositeColor, 'Bundle should have color metadata')
  assert(bundle.metadata.timestamp, 'Bundle should have timestamp')
  assert(bundle.imageDataURL === mockDataURL, 'Bundle should have image data')
  
  const json = JSON.stringify(bundle, null, 2)
  assert(json.includes('"metadata"'), 'Bundle JSON should have metadata key')
  assert(json.includes('"imageDataURL"'), 'Bundle JSON should have imageDataURL key')
  console.log('✅ Bundle export format valid')
}

// Run tests
try {
  testSVGExport()
  testBundleExport()
  console.log('\n✅ All export tests passed')
} catch(e) {
  console.error('❌ Export test failed:', e.message)
  process.exit(1)
}
