import React, {useState, useEffect} from 'react'
import BlendCanvas from './components/BlendCanvas'

function HistoryCalendar(){
  const [byDate, setByDate] = useState({})
  const [dates, setDates] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    const monsters = JSON.parse(localStorage.getItem('emo_monsters') || '[]')
    const map = {}
    monsters.forEach(m => {
      const key = new Date(m.createdAt).toISOString().slice(0,10)
      if(!map[key]) map[key] = []
      map[key].push(m)
    })
    const ds = Object.keys(map).sort((a,b)=>b.localeCompare(a))
    setByDate(map)
    setDates(ds)
  }, [])

  // simple weekly highlight: dates that are multiples of 7 days from the earliest entry
  const weeklyHighlights = new Set()
  if(dates.length > 0){
    const earliest = new Date(dates[dates.length-1])
    dates.forEach(dateStr =>{
      const d = new Date(dateStr)
      const diff = Math.round((d - earliest) / (1000*60*60*24))
      if(diff % 7 === 0) weeklyHighlights.add(dateStr)
    })
  }

  return (
    <div style={{marginTop:20}}>
      <h2>情緒時光機（歷史日記）</h2>
      <div style={{display:'flex',flexWrap:'wrap'}}>
        {dates.length === 0 ? <div>尚無紀錄</div> : dates.map(d => (
          <button key={d} onClick={()=>setSelected(d)} style={{margin:6,padding:8,background: weeklyHighlights.has(d) ? '#fff8d6' : '#fff', border: selected===d ? '2px solid #333' : '1px solid #ccc'}}>
            {d} ({byDate[d].length})
          </button>
        ))}
      </div>
      {selected && (
        <div style={{marginTop:12}}>
          <h3>{selected}</h3>
          <ul>
            {byDate[selected].map(m => (
              <li key={m.id} style={{marginBottom:6}}>
                <span style={{display:'inline-block',width:18,height:18,background:m.color,borderRadius:9,marginRight:8,verticalAlign:'middle'}} />
                {m.name} — {new Date(m.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function App(){
  return (
    <div className="app">
      <h1>Emo Monster — MVP</h1>
      <BlendCanvas />
      <HistoryCalendar />
    </div>
  )
}
