import React, {useState, useEffect} from 'react'
import BlendCanvas from './components/BlendCanvas'

function LogoSettings({isDarkMode}){
  const [isOpen, setIsOpen] = useState(false)
  const [customEmoji, setCustomEmoji] = useState(() => localStorage.getItem('emo_logo_emoji') || '🎨')
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('emo_logo_title') || '情感怪獸 Emo Monster')

  const saveSettings = () => {
    localStorage.setItem('emo_logo_emoji', customEmoji)
    localStorage.setItem('emo_logo_title', customTitle)
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{padding: '6px 12px', fontSize: '12px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '600'}}>
        ⚙️ Logo 設定
      </button>
      {isOpen && (
        <div style={{position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1000}}>
          <div style={{background: isDarkMode ? 'var(--bg-light)' : '#fff', padding: '24px', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)'}}>
            <h3 style={{margin: '0 0 16px 0', color: 'var(--primary)'}}>自訂 Logo</h3>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px'}}>Logo Emoji（單個字符）</label>
              <input 
                type="text" 
                value={customEmoji} 
                onChange={(e) => setCustomEmoji(e.target.value.slice(0, 2))} 
                style={{width: '100%', padding: '8px', fontSize: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}
              />
              <div style={{marginTop: '8px', fontSize: '32px'}}>預覽：{customEmoji}</div>
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px'}}>應用標題</label>
              <input 
                type="text" 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)} 
                maxLength="50"
                style={{width: '100%', padding: '8px', fontSize: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'}}
              />
            </div>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
              <button onClick={() => setIsOpen(false)} style={{padding: '8px 16px', background: 'var(--border)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer'}}>取消</button>
              <button onClick={saveSettings} style={{padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer'}}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function HistoryCalendar(){
  const [byDate, setByDate] = useState({})
  const [dates, setDates] = useState([])
  const [selected, setSelected] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('emo_theme') || 'light'
    const isDark = saved === 'dark'
    setIsDarkMode(isDark)
    document.documentElement.setAttribute('data-theme', saved)
    document.body.setAttribute('data-theme', saved)
  }, [])

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
    <div style={{marginTop: 'var(--spacing-2xl)', padding: 'var(--spacing-lg)', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)'}}>
      <h2 style={{margin: '0 0 var(--spacing-lg) 0', fontSize: '24px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)'}}>
        📅 情緒時光機（歷史日記）
      </h2>
      
      <div style={{display:'flex', flexWrap:'wrap', gap: 'var(--spacing-md)', marginBottom: dates.length === 0 ? 0 : 'var(--spacing-lg)'}}>
        {dates.length === 0 ? (
          <div style={{padding: 'var(--spacing-lg)', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', color: '#999', textAlign: 'center', width: '100%'}}>
            🎭 尚無紀錄 - 開始孵化怪獸吧！
          </div>
        ) : (
          dates.map(d => (
            <button 
              key={d} 
              onClick={()=>setSelected(d)} 
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: weeklyHighlights.has(d) ? 'linear-gradient(135deg, #fff8dc 0%, #fffde7 100%)' : '#fff',
                border: selected===d ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all var(--transition-normal)',
                boxShadow: selected===d ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                color: selected===d ? 'var(--primary)' : 'var(--text-dark)'
              }}
            >
              {d} <strong>({byDate[d].length})</strong>
            </button>
          ))
        )}
      </div>
      
      {selected && (
        <div style={{padding: 'var(--spacing-lg)', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', animation: 'slideUp var(--transition-normal)'}}>
          <h3 style={{margin: '0 0 var(--spacing-md) 0', fontSize: '18px', color: 'var(--primary)'}}>
            📍 {selected} 的怪獸
          </h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--spacing-md)'}}>
            {byDate[selected].map(m => (
              <li 
                key={m.id} 
                style={{
                  padding: 'var(--spacing-md)',
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${m.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-normal)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <span style={{display:'inline-flex', width: '32px', height: '32px', background: m.color, borderRadius: '50%', border: `2px solid ${m.color}`, flexShrink: 0}} />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: '600', color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {m.name}
                  </div>
                  <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
                    {new Date(m.createdAt).toLocaleString('zh-TW')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function App(){
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [customEmoji, setCustomEmoji] = useState('🎨')
  const [customTitle, setCustomTitle] = useState('情感怪獸 Emo Monster')

  useEffect(() => {
    const saved = localStorage.getItem('emo_theme') || 'light'
    const isDark = saved === 'dark'
    setIsDarkMode(isDark)
    applyTheme(saved)
    
    // Load custom branding
    setCustomEmoji(localStorage.getItem('emo_logo_emoji') || '🎨')
    setCustomTitle(localStorage.getItem('emo_logo_title') || '情感怪獸 Emo Monster')
  }, [])

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('emo_theme', theme)
  }

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    applyTheme(newTheme)
  }

  // Listen for logo changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomEmoji(localStorage.getItem('emo_logo_emoji') || '🎨')
      setCustomTitle(localStorage.getItem('emo_logo_title') || '情感怪獸 Emo Monster')
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className="app">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 'var(--spacing-lg)'}}>
        <h1 style={{fontSize: '28px', margin: 0}}>
          <span style={{fontSize: '32px', marginRight: '8px'}}>{customEmoji}</span> {customTitle}
        </h1>
        <div style={{display: 'flex', gap: '8px'}}>
          <LogoSettings isDarkMode={isDarkMode} />
          <button onClick={toggleDarkMode} style={{padding: '8px 16px', background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all var(--transition-normal)'}}>
            {isDarkMode ? '☀️ 亮色模式' : '🌙 黑暗模式'}
          </button>
        </div>
      </div>
      <div style={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <BlendCanvas />
      </div>
      <div style={{flex: 0, overflow: 'auto'}}>
        <HistoryCalendar />
      </div>
    </div>
  )
}
