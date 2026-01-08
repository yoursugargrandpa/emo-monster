import React, {useRef, useEffect, useState} from 'react'
import {hexFromRGB, nameFromColor} from '../utils.js'

const EMOTIONS = [
  {id: 'angry', name: '生氣', emoji: '😠', src: '/assets/emotions/angry.png'},
  {id: 'sad', name: '難過', emoji: '😢', src: '/assets/emotions/sad.png'},
  {id: 'happy', name: '快樂', emoji: '😊', src: '/assets/emotions/happy.png'}
]


const SHOP_ITEMS = [
  {id: 'wing', name: '翅膀', cost: 5, emoji: '✨', rarity: 'common'},
  {id: 'horn', name: '角', cost: 8, emoji: '👑', rarity: 'rare'},
  {id: 'crown', name: '皇冠', cost: 15, emoji: '👑', rarity: 'epic'},
  {id: 'star', name: '星星', cost: 3, emoji: '⭐', rarity: 'common'},
  {id: 'flame', name: '火焰', cost: 12, emoji: '🔥', rarity: 'rare'},
  {id: 'heart', name: '心形', cost: 10, emoji: '❤️', rarity: 'rare'}
]

export default function BlendCanvas(){
  const canvasRef = useRef(null)
  const [elements, setElements] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})
  const [compositeColor, setCompositeColor] = useState('#ffffff')
  const [monsterPreviewKey, setMonsterPreviewKey] = useState(0)
  const [collectionCount, setCollectionCount] = useState(0)
  const [eggs, setEggs] = useState([])
  const [animatePreview, setAnimatePreview] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dragPulse, setDragPulse] = useState(false)
  const [hatchAnimating, setHatchAnimating] = useState(false)
  const particleRef = useRef(null)
  const particlesRef = useRef([])
  const particleAnimRef = useRef(null)
  const [settings, setSettings] = useState({particleCount:18, particleSize:6, volume:0.18, evoBase:5})
  const [evolveModalVisible, setEvolveModalVisible] = useState(false)
  const [evolveCandidate, setEvolveCandidate] = useState(null)
  const [modalPulse, setModalPulse] = useState(false)
  const [evolveAnimating, setEvolveAnimating] = useState(false)
  const [shopVisible, setShopVisible] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)

  useEffect(()=>{
    let iv = null
    if(evolveModalVisible){
      iv = setInterval(()=> setModalPulse(p=>!p), 420)
      setModalPulse(true)
    } else {
      setModalPulse(false)
    }
    return ()=> iv && clearInterval(iv)
  }, [evolveModalVisible])

  useEffect(()=>{
    try{
      const s = JSON.parse(localStorage.getItem('emo_settings') || '{}')
      if(s && Object.keys(s).length) setSettings(prev=>({...prev,...s}))
      const c = parseInt(localStorage.getItem('emo_coins') || '0', 10)
      setCoins(isNaN(c) ? 0 : c)
      const inv = JSON.parse(localStorage.getItem('emo_inventory') || '[]')
      setInventory(inv)
    }catch(e){}
  }, [])

  function playPopSound(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 800
      g.gain.value = 0.001
      o.connect(g); g.connect(ctx.destination)
      o.start()
      const vol = (settings && settings.volume) ? settings.volume : 0.18
      g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      o.stop(ctx.currentTime + 0.26)
    }catch(e){/* ignore audio errors */}
  }

  function spawnParticles(color){
    const canvas = canvasRef.current
    const pCanvas = particleRef.current
    if(!canvas || !pCanvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = rect.width/2
    const cy = rect.height/2
    const count = settings.particleCount || 18
    const arr = particlesRef.current
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2
      const speed = 1 + Math.random()*3
      arr.push({
        x: cx, y: cy,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - (Math.random()*1.5),
        life: 1, decay: 0.02 + Math.random()*0.03,
        size: (settings.particleSize || 6) * (0.6 + Math.random()*0.8),
        color
      })
    }
    // start animation loop
    if(!particleAnimRef.current){
      const ctx = pCanvas.getContext('2d')
      const step = ()=>{
        pCanvas.width = canvas.width
        pCanvas.height = canvas.height
        ctx.clearRect(0,0,pCanvas.width,pCanvas.height)
        const next = []
        arr.forEach(p=>{
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.08
          p.life -= p.decay
          if(p.life>0){
            ctx.globalAlpha = Math.max(0, p.life)
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2)
            ctx.fill()
            next.push(p)
          }
        })
        particlesRef.current = next
        if(next.length>0){
          particleAnimRef.current = requestAnimationFrame(step)
        } else {
          particleAnimRef.current = null
          ctx.clearRect(0,0,pCanvas.width,pCanvas.height)
        }
      }
      particleAnimRef.current = requestAnimationFrame(step)
    }
  }

  // Shop and inventory
  const [coins, setCoins] = useState(0)
  const [inventory, setInventory] = useState([])

  function earnChallenge(){
    const v = (coins || 0) + 10
    setCoins(v)
    localStorage.setItem('emo_coins', String(v))
    spawnParticles('#8bc34a')
  }

  function buyItem(item){
    if((coins || 0) < item.cost){ alert('金幣不足'); return }
    const v = (coins || 0) - item.cost
    setCoins(v)
    localStorage.setItem('emo_coins', String(v))
    const invItem = {...item, iid: `inv_${Date.now()}`}
    const n = [...inventory, invItem]
    setInventory(n)
    localStorage.setItem('emo_inventory', JSON.stringify(n))
    spawnParticles('#ffd54f')
    playPopSound()
  }

  function equipItemToMonster(monsterId){
    const inv = JSON.parse(localStorage.getItem('emo_inventory') || '[]')
    if(inv.length === 0){ alert('無可裝備物品'); return }
    const item = inv.shift()
    const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    const m = monsters.find(x=>x.id === monsterId)
    if(!m){ alert('找不到怪獸'); return }
    m.accessories = m.accessories || []
    m.accessories.push(item)
    localStorage.setItem('emo_monsters', JSON.stringify(monsters))
    setInventory(inv)
    localStorage.setItem('emo_inventory', JSON.stringify(inv))
    setMonsterPreviewKey(k=>k+1)
    spawnParticles(m.color)
    playPopSound()
  }

  function removeItemFromInventory(iid){
    const inv = inventory.filter(x => x.iid !== iid)
    setInventory(inv)
    localStorage.setItem('emo_inventory', JSON.stringify(inv))
  }


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
    // load collection count and eggs
    const col = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    setCollectionCount(col.length)
    const eg = JSON.parse(localStorage.getItem('emo_eggs') || '[]')
    setEggs(eg)
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

  useEffect(()=>{
    let iv = null
    if(isDragging){
      iv = setInterval(()=> setDragPulse(p => !p), 520)
      setDragPulse(true)
    } else {
      setDragPulse(false)
    }
    return ()=> iv && clearInterval(iv)
  }, [isDragging])

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
    const monster = {id: `m_${Date.now()}`, color: egg.color, baseName: name, level: 1, exp: 0, name: `${name} Lv.1`, createdAt: Date.now()}
    // award initial exp for hatching and auto-evolve if threshold met
    monster.exp = (monster.exp || 0) + 6
    monsters.push(monster)
    // try automatic evolution
    tryAutoEvolve(monster, monsters)
    localStorage.setItem('emo_monsters', JSON.stringify(monsters))
    setCollectionCount(monsters.length)
    // simple notification and preview refresh with animation + particles + sound
    setHatchAnimating(true)
    spawnParticles(egg.color)
    playPopSound()
    setMonsterPreviewKey(k=>k+1)
    setTimeout(()=> setHatchAnimating(false), 900)
    alert(`孵化完成：${monster.name}`)
  }

  async function hatchAll(){
    const eggsArr = JSON.parse(localStorage.getItem('emo_eggs') || '[]')
    if(eggsArr.length === 0){ alert('沒有情緒蛋可孵化'); return }
    const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    const hatched = []
    for(let i=0;i<eggsArr.length;i++){
      const egg = eggsArr[i]
      // pre-hatch delay / cracking
      setHatchAnimating(true)
      await new Promise(r=>setTimeout(r, 520))
      // particle + sound per egg
      spawnParticles(egg.color)
      playPopSound()
      await new Promise(r=>setTimeout(r, 180))
      const hex = egg.color.replace('#','')
      const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16)
      const name = nameFromColor(r,g,b)
      const monster = {id: `m_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, color: egg.color, baseName: name, level: 1, exp: 0, name: `${name} Lv.1`, createdAt: Date.now()}
      // award initial exp for hatching and attempt auto-evolve per monster
      monster.exp = (monster.exp || 0) + 6
      monsters.push(monster)
      hatched.push(name)
      // try auto evolve immediately
      tryAutoEvolve(monster, monsters)
      // update storage incrementally so UI reflects progress
      localStorage.setItem('emo_monsters', JSON.stringify(monsters))
      const remaining = eggsArr.slice(i+1)
      localStorage.setItem('emo_eggs', JSON.stringify(remaining))
      setEggs(remaining)
      setCollectionCount(monsters.length)
      setMonsterPreviewKey(k=>k+1)
      // short post-hatch pause for visual
      await new Promise(r=>setTimeout(r, 260))
      setHatchAnimating(false)
    }
    alert(`孵化完成：共 ${hatched.length} 隻 (${hatched.join(', ')})`)
  }

  function evolveLastMonster(){
    const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    if(monsters.length === 0){ alert('沒有怪獸可進化'); return }
    const m = monsters[monsters.length-1]
    setEvolveCandidate(m.id)
    setEvolveModalVisible(true)
  }

  function tryAutoEvolve(monster, monsters){
    // simple threshold: level * 5 exp to reach next level
    const threshold = (monster.level || 1) * (settings.evoBase || 5)
    let changed = false
    while((monster.exp || 0) >= threshold){
      monster.exp = (monster.exp || 0) - threshold
      monster.level = (monster.level || 1) + 1
      monster.name = `${monster.baseName || monster.name} Lv.${monster.level}`
      changed = true
      // visual + sound per auto-evo
      spawnParticles(monster.color)
      playPopSound()
    }
    if(changed){
      // persist
      localStorage.setItem('emo_monsters', JSON.stringify(monsters))
      setMonsterPreviewKey(k=>k+1)
    }
  }

  function awardExp(monsterId, amount){
    try{
      const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
      const m = monsters.find(x=>x.id === monsterId)
      if(!m) return
      m.exp = (m.exp || 0) + (amount || 1)
      // attempt auto evolve after awarding exp
      tryAutoEvolve(m, monsters)
      localStorage.setItem('emo_monsters', JSON.stringify(monsters))
      setMonsterPreviewKey(k=>k+1)
      setCollectionCount(monsters.length)
    }catch(e){ console.warn('awardExp error', e) }
  }

  function confirmEvolve(){
    try{
      const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
      const m = monsters.find(x=>x.id === evolveCandidate)
      if(!m){ alert('找不到怪獸'); return }
      
      const threshold = (m.level || 1) * (settings.evoBase || 5)
      if((m.exp || 0) < threshold){ alert('經驗值不足'); return }
      
      // Start evolution animation
      setEvolveAnimating(true)
      
      // Perform evolution with visual feedback
      const oldLevel = m.level || 1
      m.exp = (m.exp || 0) - threshold
      m.level = oldLevel + 1
      m.name = `${m.baseName || m.name.split(' Lv')[0]} Lv.${m.level}`
      
      // Spawn multiple particles bursts for dramatic effect
      for(let i=0; i<3; i++){
        setTimeout(()=>{
          spawnParticles(m.color)
          playPopSound()
        }, i * 200)
      }
      
      // Persist changes
      localStorage.setItem('emo_monsters', JSON.stringify(monsters))
      setMonsterPreviewKey(k=>k+1)
      
      // Close modal after animation
      setTimeout(()=>{
        setEvolveModalVisible(false)
        setEvolveCandidate(null)
        setEvolveAnimating(false)
      }, 700)
      
      // Try auto-evolve if threshold is met again
      tryAutoEvolve(m, monsters)
      
      alert(`進化成功！${m.baseName || m.name} 升至 Lv.${m.level}`)
    }catch(e){
      console.warn('confirmEvolve error', e)
      alert('進化失敗')
      setEvolveAnimating(false)
    }
  }

  return (
    <div className="blend-wrap">
      <div className="canvas-area" style={{position:'relative'}}>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{border: '1px solid #ccc', background: '#fff'}}
        />
        <canvas ref={particleRef} width={640} height={480} style={{position:'absolute', left:0, top:0, pointerEvents:'none'}} />
        {evolveModalVisible && (
          <div style={{position:'absolute', left:0, top:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', zIndex:100}}>
            <div style={{background:'#fff', padding:16, borderRadius:8, width:360, boxShadow:'0 10px 30px rgba(0,0,0,0.3)', transform: evolveAnimating ? 'scale(0.95)' : 'scale(1)', transition:'transform 600ms cubic-bezier(.2,.9,.3,1)', opacity: evolveAnimating ? 0.6 : 1}}>
              <h3>進化確認</h3>
              {(() => {
                const mons = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
                const m = mons.find(x=>x.id === evolveCandidate)
                if(!m) return <div>找不到怪獸</div>
                const threshold = (m.level || 1) * (settings.evoBase || 5)
                const canAuto = (m.exp || 0) >= threshold
                const nextLevel = (m.level || 1) + 1
                const expAfter = (m.exp || 0) - threshold
                return (
                  <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:120}}>
                      <div style={{width:84,height:84,borderRadius:42,background:m.color,border:'2px solid #333',transform: modalPulse ? 'scale(1.06)' : 'scale(1)',transition:'transform 360ms ease'}} />
                      <div style={{fontSize:12,marginTop:8}}>預覽色 / 縮圖</div>
                      {(m.accessories && m.accessories.length > 0) && (
                        <div style={{marginTop:8, fontSize:12, fontWeight:'bold'}}>
                          配件：{m.accessories.map((a, i) => <span key={i}>{a.emoji}</span>)}
                        </div>
                      )}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{marginTop:6}}>目前：{m.baseName || m.name} • Level {m.level} • Exp {m.exp}</div>
                      <div style={{marginTop:6}}>升級門檻：{threshold} exp</div>
                      <div style={{marginTop:8, padding:8, background:'#fafafa', borderRadius:6}}>
                        預覽：若確認，怪獸將升至 <strong>Level {nextLevel}</strong>{canAuto ? `（自動進化條件已達成，會嘗試進行更多升級）` : ''}
                        <div style={{fontSize:12,color:'#666',marginTop:6}}>升級後剩餘 Exp: {expAfter > 0 ? expAfter : 0}</div>
                        {(m.accessories && m.accessories.length > 0) && (
                          <div style={{fontSize:12,color:'#2e7d32',marginTop:6}}>✓ 已裝備配件將保留</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div style={{marginTop:12, display:'flex', justifyContent:'flex-end'}}>
                <button onClick={()=>setEvolveModalVisible(false)} style={{marginRight:8}} disabled={evolveAnimating}>取消</button>
                <button onClick={confirmEvolve} disabled={evolveAnimating}>確認進化</button>
              </div>
            </div>
          </div>
        )}
        {shopVisible && (
          <div style={{position:'absolute', left:0, top:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', zIndex:10}}>
            <div style={{background:'#fff', padding:20, borderRadius:12, maxWidth:700, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 10px 40px rgba(0,0,0,0.3)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                <h2>🛍️ 商店</h2>
                <button onClick={()=>setShopVisible(false)} style={{fontSize:20, border:'none', background:'none', cursor:'pointer'}}>✕</button>
              </div>
              
              <div style={{marginBottom:16, padding:12, background:'#fffde7', borderRadius:8}}>
                <strong style={{fontSize:18}}>💰 你的金幣：{coins}</strong>
              </div>

              <h3 style={{marginTop:16, marginBottom:12}}>📦 商品列表</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:12, marginBottom:20}}>
                {SHOP_ITEMS.map(item => (
                  <div key={item.id} style={{border:'1px solid #ddd', borderRadius:8, padding:12, textAlign:'center', background:'#fafafa', transition:'all 200ms ease', cursor:'pointer'}} onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}>
                    <div style={{fontSize:32, marginBottom:8}}>{item.emoji}</div>
                    <div style={{fontWeight:'bold', marginBottom:6}}>{item.name}</div>
                    <div style={{fontSize:12, color:'#666', marginBottom:8}}>💰 {item.cost}</div>
                    <button onClick={()=>buyItem(item)} style={{width:'100%', padding:'6px 8px', background:coins>=item.cost?'#4caf50':'#ccc', color:'#fff', border:'none', borderRadius:4, cursor:coins>=item.cost?'pointer':'not-allowed'}}>購買</button>
                  </div>
                ))}
              </div>

              <h3 style={{marginTop:16, marginBottom:12}}>背包 ({inventory.length})</h3>
              {inventory.length === 0 ? (
                <div style={{padding:12, background:'#f5f5f5', borderRadius:8, color:'#999'}}>背包空空的</div>
              ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:12}}>
                  {inventory.map(item => (
                    <div key={item.iid} style={{border:'1px solid #bbb', borderRadius:8, padding:12, background:'#e8f5e9', textAlign:'center'}}>
                      <div style={{fontSize:28, marginBottom:6}}>{item.emoji}</div>
                      <div style={{fontWeight:'bold', fontSize:12, marginBottom:8}}>{item.name}</div>
                      <button onClick={()=>removeItemFromInventory(item.iid)} style={{width:'100%', padding:'4px 6px', fontSize:11, background:'#f44336', color:'#fff', border:'none', borderRadius:4, cursor:'pointer'}}>丟棄</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
                <button onClick={()=>setShopVisible(false)} style={{padding:'8px 16px', fontSize:14}}>關閉</button>
              </div>
            </div>
          </div>
        )}
        {isDragging && (
          <div style={{
            position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            background: 'rgba(255,255,255,0.45)',
            border: '2px dashed #ff9800', borderRadius: 8,
            transform: (typeof dragPulse !== 'undefined' && dragPulse) ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 450ms ease, background 200ms ease'
          }}>
            <div style={{padding:12, background:'rgba(255,255,255,0.9)', borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.12)'}}>
              拖放表情到此或點擊表情以加入（手機支援）
            </div>
          </div>
        )}
        <div style={{marginTop:8}}>
          當前合成色： <span style={{display:'inline-block',width:24,height:24,background:compositeColor,border:'1px solid #333',verticalAlign:'middle'}} /> {compositeColor}
        </div>
        <div style={{marginTop:8, padding:10, background:'#fffde7', borderRadius:6, display:'flex', alignItems:'center', gap:12}}>
          <span style={{fontSize:18}}>💰</span>
          <strong>金幣：{coins}</strong>
          <button onClick={earnChallenge} style={{marginLeft:8, padding:'4px 12px'}}>完成挑戰 +10</button>
          <button onClick={()=>setShopVisible(true)} style={{marginLeft:8, padding:'4px 12px'}}>🛍️ 進入商店</button>
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
          <div key={e.id} className="emotion-item" draggable onDragStart={(ev)=>onDragStart(ev,e.id)} onClick={()=>addEmotionAtCenter(e.id)} style={{cursor:'pointer', transition:'all 200ms ease'}} onMouseEnter={(evt)=>evt.currentTarget.style.transform='scale(1.05)'} onMouseLeave={(evt)=>evt.currentTarget.style.transform='scale(1)'}>
            <div style={{fontSize:'48px', cursor:'grab'}}>{e.emoji}</div>
            <div>{e.name}</div>
          </div>
        ))}
        <div style={{marginTop:12}}>
          收藏數量：{collectionCount}
        </div>
        <div style={{marginTop:8}}>
          情緒蛋：{eggs.length}
          {eggs.length>0 && (
            <button onClick={hatchAll} style={{marginLeft:8}}>孵化全部</button>
          )}
          <div style={{marginTop:6}}>
            {eggs.map(e=> (
              <span key={e.id} style={{display:'inline-block',marginRight:8}} title={new Date(e.awardedAt).toLocaleString()}>
                <span style={{display:'inline-block',width:18,height:18,background:e.color,border:'1px solid #333',borderRadius:9,verticalAlign:'middle'}} />
              </span>
            ))}
          </div>
        </div>

        <div style={{marginTop:12, padding:10, background:'#e3f2fd', borderRadius:8}}>
          <strong>🎖️ 怪獸配件</strong>
          <div style={{marginTop:8, maxHeight:200, overflowY:'auto'}}>
            {(() => {
              try {
                const mons = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
                if(mons.length === 0) return <div style={{fontSize:12, color:'#666'}}>暫無怪獸</div>
                return (
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {mons.map(m => (
                      <div key={m.id} style={{padding:8, background:'#fff', borderRadius:6, border:'1px solid #90caf9'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                          <span style={{display:'inline-block',width:20,height:20,borderRadius:10,background:m.color,border:'1px solid #333'}} />
                          <strong style={{fontSize:12}}>{m.name}</strong>
                        </div>
                        {(m.accessories && m.accessories.length > 0) ? (
                          <div style={{display:'flex', gap:4}}>
                            {m.accessories.map((acc, idx) => (
                              <span key={idx} title={acc.name} style={{fontSize:14}}>{acc.emoji}</span>
                            ))}
                          </div>
                        ) : (
                          <div style={{fontSize:11, color:'#999'}}>無配件</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              } catch(e) { return null }
            })()}
          </div>
        </div>

      </div>
      <div className="controls">
        <div style={{marginBottom:12, padding:10, border:'1px solid #eee', borderRadius:8, background:'#fff'}}>
          <strong>視覺與音效設定（醒目）</strong>
          <div style={{marginTop:8,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <label style={{fontSize:12}}>粒子數量:
              <input type="number" value={settings.particleCount} onChange={(ev)=>{ const v=parseInt(ev.target.value)||0; const s2={...settings,particleCount:v}; setSettings(s2); localStorage.setItem('emo_settings', JSON.stringify(s2))}} style={{width:68, marginLeft:8}} />
            </label>
            <label style={{fontSize:12}}>粒子大小:
              <input type="number" value={settings.particleSize} onChange={(ev)=>{ const v=parseFloat(ev.target.value)||0; const s2={...settings,particleSize:v}; setSettings(s2); localStorage.setItem('emo_settings', JSON.stringify(s2))}} style={{width:68, marginLeft:8}} />
            </label>
            <label style={{fontSize:12,display:'flex',alignItems:'center'}}>音量:
              <input type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={(ev)=>{ const v=parseFloat(ev.target.value)||0; const s2={...settings,volume:v}; setSettings(s2); localStorage.setItem('emo_settings', JSON.stringify(s2))}} style={{marginLeft:8}} />
            </label>
            <label style={{fontSize:12}}>進化門檻基數:
              <input type="number" value={settings.evoBase} onChange={(ev)=>{ const v=parseInt(ev.target.value)||0; const s2={...settings,evoBase:v}; setSettings(s2); localStorage.setItem('emo_settings', JSON.stringify(s2))}} style={{width:68, marginLeft:8}} />
            </label>
            <button onClick={()=>{ const s2={particleCount:18,particleSize:6,volume:0.18,evoBase:5}; setSettings(s2); localStorage.setItem('emo_settings', JSON.stringify(s2))}} style={{marginLeft:8}}>重置</button>
          </div>
        </div>
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
          <div style={{marginTop:8}}>預覽怪獸（簡單程式化） <button onClick={evolveLastMonster} style={{marginLeft:8}}>進化最近孵化的怪獸</button></div>
        </div>
      </div>
    </div>
  )
}
