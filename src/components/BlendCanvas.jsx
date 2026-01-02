import React, {useRef, useEffect, useState} from 'react'

const EMOTIONS = [
  {id: 'angry', name: '生氣', src: '/assets/emotions/angry.png'},
  {id: 'sad', name: '難過', src: '/assets/emotions/sad.png'},
  {id: 'happy', name: '快樂', src: '/assets/emotions/happy.png'}
]

function hexFromRGB(r,g,b){
  const toHex = v => v.toString(16).padStart(2,'0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function nameFromColor(r,g,b){
  // simple hue-ish mapping
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

export default function BlendCanvas(){
  const canvasRef = useRef(null)
  const [elements, setElements] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [compositeColor, setCompositeColor] = useState('#ffffff')
  const [monsterPreviewKey, setMonsterPreviewKey] = useState(0)
  const [collectionCount, setCollectionCount] = useState(0)
  const [animatePreview, setAnimatePreview] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(()=>{
    const imgs = {}
    let loaded = 0
    EMOTIONS.forEach(e=>{
      const img = new Image()
      img.src = e.src
      img.onload = ()=>{
        imgs[e.id] = img
        loaded++
        if(loaded === EMOTIONS.length){
          setImagesLoaded(imgs)
          redraw(imgs)
        }
      }
      img.onerror = ()=>{
        const c = document.createElement('canvas')
        c.width = c.height = 256
        const ctx = c.getContext('2d')
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(0,0,256,256)
        const img2 = new Image()
        img2.src = c.toDataURL('image/png')
        imgs[e.id] = img2
        loaded++
        if(loaded === EMOTIONS.length){
          setImagesLoaded(imgs)
          redraw(imgs)
        }
      }
    })
    // load collection count
    const col = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    setCollectionCount(col.length)
  }, [])

  useEffect(()=>{
    redraw(imagesLoaded)
    computeCompositeColor()
  }, [elements, imagesLoaded])

  useEffect(()=>{
    // trigger animation when preview key changes
    setAnimatePreview(true)
    const t = setTimeout(()=>setAnimatePreview(false), 700)
    return ()=>clearTimeout(t)
  }, [monsterPreviewKey])

  useEffect(()=>{
    const check = ()=>{
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 600)
    }
    check()
    window.addEventListener('resize', check)
    return ()=>window.removeEventListener('resize', check)
  }, [])

  function redraw(imgs){
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.globalCompositeOperation = 'lighter'
    elements.forEach(el=>{
      const img = imgs[el.id]
      if(img) ctx.drawImage(img, el.x - img.width/2, el.y - img.height/2)
    })
    ctx.globalCompositeOperation = 'source-over'
  }

  function computeCompositeColor(){
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    // sample a downscaled region for performance
    const w = canvas.width, h = canvas.height
    const data = ctx.getImageData(0,0,w,h).data
    let r=0,g=0,b=0,count=0
    for(let i=0;i<data.length;i+=4){
      const alpha = data[i+3]
      if(alpha>10){
        r += data[i]
        g += data[i+1]
        b += data[i+2]
        count++
      }
    }
    if(count===0) return setCompositeColor('#ffffff')
    r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count)
    setCompositeColor(hexFromRGB(r,g,b))
  }

  function onDragStart(e, id){
    e.dataTransfer.setData('text/emotion', id)
  }

  function onDrop(e){
    e.preventDefault()
    setIsDragging(false)
    const id = e.dataTransfer.getData('text/emotion')
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setElements(prev => [...prev, {id, x, y}])
  }

  function onDragOver(e){ e.preventDefault(); if(!isDragging) setIsDragging(true) }

  function addEmotionAtCenter(id){
    const canvas = canvasRef.current
    if(!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = rect.width/2
    const y = rect.height/2
    setElements(prev=>[...prev,{id,x,y}])
  }

  function exportPNG(){
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'emo-composite.png'
    a.click()
  }

  function exportJSON(){
    const preview = {
      color: compositeColor,
      name: nameFromColor(parseInt(compositeColor.slice(1,3),16), parseInt(compositeColor.slice(3,5),16), parseInt(compositeColor.slice(5,7),16)),
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(preview, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'emo-preview.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportSVG(){
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${dataURL}" width="${canvas.width}" height="${canvas.height}"/></svg>`
    const blob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'emo-composite.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportBundle(){
    const canvas = canvasRef.current
    const dataURL = canvas.toDataURL('image/png')
    const bundle = {
      metadata: {
        color: compositeColor,
        name: nameFromColor(parseInt(compositeColor.slice(1,3),16), parseInt(compositeColor.slice(3,5),16), parseInt(compositeColor.slice(5,7),16)),
        timestamp: new Date().toISOString()
      },
      imageDataURL: dataURL
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'emo-bundle.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function awardEgg(){
    // simulate awarding an egg after solving a prescription
    const eggs = JSON.parse(localStorage.getItem('emo_eggs') || '[]')
    const egg = {id: `egg_${Date.now()}`, color: compositeColor, awardedAt: Date.now()}
    eggs.push(egg)
    localStorage.setItem('emo_eggs', JSON.stringify(eggs))
    alert('獲得情緒蛋！可以到下方孵化。')
  }

  function hatchEgg(){
    const eggs = JSON.parse(localStorage.getItem('emo_eggs') || '[]')
    if(eggs.length === 0){ alert('沒有情緒蛋可孵化'); return }
    const egg = eggs.shift() // consume first egg
    localStorage.setItem('emo_eggs', JSON.stringify(eggs))
    // create monster from egg color
    // parse rgb
    const hex = egg.color.replace('#','')
    const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16)
    const name = nameFromColor(r,g,b)
    const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    const monster = {id: `m_${Date.now()}`, color: egg.color, name, createdAt: Date.now()}
    monsters.push(monster)
    localStorage.setItem('emo_monsters', JSON.stringify(monsters))
    setCollectionCount(monsters.length)
    // simple notification and preview refresh
    setMonsterPreviewKey(k=>k+1)
    alert(`孵化完成：${name}`)
  }

  return (
    <div className="blend-wrap">
      <div className="canvas-area">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{border: '1px solid #ccc', background: '#fff'}}
        />
        <div style={{marginTop:8}}>
          當前合成色： <span style={{display:'inline-block',width:24,height:24,background:compositeColor,border:'1px solid #333',verticalAlign:'middle'}} /> {compositeColor}
        </div>
        <div style={{marginTop:8}}>
          <button onClick={awardEgg}>獲得情緒蛋（模擬）</button>
          <button onClick={hatchEgg} style={{marginLeft:8}}>孵化情緒蛋</button>
          <button onClick={exportPNG} style={{marginLeft:8}}>匯出 PNG</button>
          <button onClick={exportJSON} style={{marginLeft:8}}>匯出 JSON</button>
          <button onClick={exportSVG} style={{marginLeft:8}}>匯出 SVG</button>
          <button onClick={exportBundle} style={{marginLeft:8}}>匯出 Bundle</button>
        </div>
      </div>
      <div className="palette">
        {EMOTIONS.map(e=> (
          <div key={e.id} className="emotion-item">
            <img src={e.src} draggable onDragStart={(ev)=>onDragStart(ev,e.id)} alt={e.name} width={64} height={64} />
            <div>{e.name}</div>
          </div>
        ))}
        <div style={{marginTop:12}}>
          收藏數量：{collectionCount}
        </div>
      </div>
      <div className="controls">
        <div style={{marginTop:12}}>
          <div style={{width:120,height:120,display:'flex',alignItems:'center',justifyContent:'center',border:'1px dashed #666',borderRadius:12}} key={monsterPreviewKey}>
            <div style={{
              width:80,height:80,borderRadius:40,background:compositeColor,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'bold',
              transform: animatePreview ? 'scale(1.18)' : 'scale(1)',
              transition: 'transform 620ms cubic-bezier(.2,.9,.3,1)',
              boxShadow: animatePreview ? '0 8px 20px rgba(0,0,0,0.25)' : 'none'
            }}>
              怪
            </div>
          </div>
          <div style={{marginTop:8}}>預覽怪獸（簡單程式化）</div>
        </div>
      </div>
    </div>
  )
}
