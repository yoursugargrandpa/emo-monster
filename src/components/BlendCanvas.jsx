import React, {useRef, useEffect, useState} from 'react'

const EMOTIONS = [
  {id: 'angry', name: '生氣', src: '/assets/emotions/angry.png'},
  {id: 'sad', name: '難過', src: '/assets/emotions/sad.png'},
  {id: 'happy', name: '快樂', src: '/assets/emotions/happy.png'}
]

export default function BlendCanvas(){
  const canvasRef = useRef(null)
  const [elements, setElements] = useState([])
  const [imagesLoaded, setImagesLoaded] = useState({})

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
  }, [])

  useEffect(()=>{
    redraw(imagesLoaded)
  }, [elements, imagesLoaded])

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

  function onDragStart(e, id){
    e.dataTransfer.setData('text/emotion', id)
  }

  function onDrop(e){
    e.preventDefault()
    const id = e.dataTransfer.getData('text/emotion')
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setElements(prev => [...prev, {id, x, y}])
  }

  function onDragOver(e){ e.preventDefault() }

  function exportPNG(){
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'emo-composite.png'
    a.click()
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
      </div>
      <div className="palette">
        {EMOTIONS.map(e=> (
          <div key={e.id} className="emotion-item">
            <img src={e.src} draggable onDragStart={(ev)=>onDragStart(ev,e.id)} alt={e.name} width={64} height={64} />
            <div>{e.name}</div>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={exportPNG}>匯出 PNG</button>
      </div>
    </div>
  )
}
