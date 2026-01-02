export function hexFromRGB(r,g,b){
  const toHex = v => v.toString(16).padStart(2,'0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function nameFromColor(r,g,b){
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const delta = max - min
  let h = 0
  if(delta === 0) h = 0
  else if(max === r) h = ((g - b) / delta) % 6
  else if(max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4
  h = Math.round(h * 60)
  if(h < 0) h += 360
  if(h >= 330 || h < 30) return '火焰怪'
  if(h >= 30 && h < 90) return '陽光怪'
  if(h >= 90 && h < 150) return '草地怪'
  if(h >= 150 && h < 210) return '水滴怪'
  if(h >= 210 && h < 270) return '夜空怪'
  return '夢幻怪'
}
