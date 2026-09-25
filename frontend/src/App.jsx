import { useState, useEffect, useRef, useCallback } from 'react'
import {
  analyseReport, chatWithReport, saveReport,
  register, login, logout, getUser, setUser,
  getHistory, getHistoryReport, deleteHistoryReport
} from './api'

// ─── COLOURS ────────────────────────────────────────────────────────────────
const C = {
  bg:       '#f0fdf4',
  bgCard:   '#ffffff',
  green:    '#16a34a',
  greenDk:  '#14532d',
  greenMd:  '#15803d',
  greenLt:  '#dcfce7',
  greenXlt: '#f0fdf4',
  border:   '#e2e8f0',
  borderGn: '#bbf7d0',
  text:     '#111827',
  muted:    '#6b7280',
  subtle:   '#9ca3af',
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ onUpload, language, setLanguage, user, onLogin, onLogout, onHistory, onOpenChat }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = ['Features','How it works','Tech stack','Roadmap']

  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,
      background: scrolled ? '#fff' : 'rgba(255,255,255,0.85)',
      backdropFilter:'blur(12px)',
      borderBottom: scrolled ? `1px solid ${C.greenLt}` : '1px solid transparent',
      boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      transition:'all .25s',
    }}>
      <div style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={onUpload}>
          <div style={{width:36,height:36,background:C.green,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="font-display" style={{fontSize:18,color:C.greenDk,letterSpacing:'-0.2px'}}>
            MediScan <span style={{color:C.green}}>AI</span>
          </span>
        </div>

        {/* Desktop links */}
        <div style={{display:'flex',alignItems:'center',gap:32}} className="nav-desktop">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              style={{fontSize:14,color:C.muted,textDecoration:'none',fontWeight:500,transition:'color .2s'}}
              onMouseEnter={e=>e.target.style.color=C.green}
              onMouseLeave={e=>e.target.style.color=C.muted}
            >{l}</a>
          ))}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              style={{
                display:'flex',alignItems:'center',gap:6,
                background:C.greenXlt,border:`1px solid ${C.borderGn}`,
                color:C.greenDk,borderRadius:99,padding:'6px 12px',
                fontSize:13,fontWeight:600,cursor:'pointer',
                transition:'all .15s ease'
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.greenLt}
              onMouseLeave={e=>e.currentTarget.style.background=C.greenXlt}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Ask AI
            </button>
          )}
        </div>

        {/* Right side */}
        <div style={{display:'flex',alignItems:'center',gap:12}} className="nav-desktop">
          <select value={language} onChange={e=>setLanguage(e.target.value)}
            style={{fontSize:13,color:C.muted,border:'none',background:'transparent',cursor:'pointer',outline:'none'}}>
            <option value="english">English</option>
            <option value="hindi">हिंदी</option>
          </select>

          {user ? (
            <div style={{position:'relative'}}>
              <button onClick={()=>setDropOpen(d=>!d)}
                style={{display:'flex',alignItems:'center',gap:8,background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:10,padding:'7px 14px',cursor:'pointer',fontSize:13,fontWeight:600,color:C.greenDk}}>
                <div style={{width:26,height:26,borderRadius:'50%',background:C.green,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700}}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                {user.name?.split(' ')[0]}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.greenDk} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {dropOpen && (
                <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',background:'#fff',border:`1px solid ${C.border}`,borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,0.1)',minWidth:180,zIndex:200,overflow:'hidden'}}>
                  <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border}`}}>
                    <p style={{fontSize:13,fontWeight:700,color:C.text,margin:0}}>{user.name}</p>
                    <p style={{fontSize:12,color:C.muted,margin:'2px 0 0'}}>{user.email}</p>
                  </div>
                  <button onClick={()=>{setDropOpen(false);onHistory()}}
                    style={{width:'100%',textAlign:'left',padding:'11px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.text,display:'flex',alignItems:'center',gap:8}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    My Reports
                  </button>
                  <button onClick={()=>{setDropOpen(false);onLogout()}}
                    style={{width:'100%',textAlign:'left',padding:'11px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#dc2626',display:'flex',alignItems:'center',gap:8,borderTop:`1px solid ${C.border}`}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={()=>onLogin('login')}
                style={{fontSize:14,fontWeight:500,color:C.text,background:'none',border:'none',cursor:'pointer'}}>Log in</button>
              <button onClick={()=>onLogin('signup')}
                style={{fontSize:14,fontWeight:600,color:'#fff',background:C.green,border:'none',borderRadius:10,padding:'9px 20px',cursor:'pointer',boxShadow:'0 2px 8px rgba(22,163,74,.25)',transition:'background .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.greenMd}
                onMouseLeave={e=>e.currentTarget.style.background=C.green}
              >Get started</button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="nav-mobile" onClick={()=>setOpen(o=>!o)}
          style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:C.text}}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{background:'#fff',borderTop:`1px solid ${C.greenLt}`,padding:'16px 24px',display:'flex',flexDirection:'column',gap:16}}>
          {links.map(l=>(
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              onClick={()=>setOpen(false)}
              style={{fontSize:15,color:C.text,textDecoration:'none',fontWeight:500}}>{l}</a>
          ))}
          {onOpenChat && (
            <button
              onClick={()=>{setOpen(false);onOpenChat();}}
              style={{
                display:'flex',alignItems:'center',gap:8,
                background:C.greenXlt,border:`1px solid ${C.borderGn}`,
                borderRadius:10,padding:'11px 14px',fontSize:14,fontWeight:600,color:C.greenDk,cursor:'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask AI Assistant
            </button>
          )}
          {user ? (
            <>
              <button onClick={()=>{onHistory();setOpen(false)}} style={{background:C.greenXlt,color:C.greenDk,border:`1px solid ${C.borderGn}`,borderRadius:10,padding:'11px',fontSize:15,fontWeight:600,cursor:'pointer'}}>My Reports</button>
              <button onClick={()=>{onLogout();setOpen(false)}} style={{background:'#fee2e2',color:'#b91c1c',border:'none',borderRadius:10,padding:'11px',fontSize:15,fontWeight:600,cursor:'pointer'}}>Sign out</button>
            </>
          ) : (
            <button onClick={()=>{onLogin('signup');setOpen(false)}}
              style={{background:C.green,color:'#fff',border:'none',borderRadius:10,padding:'11px',fontSize:15,fontWeight:600,cursor:'pointer'}}>Get started</button>
          )}
        </div>
      )}

      <style>{`
        @media(min-width:769px){.nav-mobile{display:none!important}}
        @media(max-width:768px){.nav-desktop{display:none!important}.nav-mobile{display:flex!important}}
      `}</style>
    </nav>
  )
}


// ─── ECG SVG ────────────────────────────────────────────────────────────────
function EcgLine() {
  return (
    <svg viewBox="0 0 420 60" style={{width:'100%'}} preserveAspectRatio="none">
      <polyline className="ecg-line"
        points="0,30 50,30 70,30 82,6 94,54 106,30 140,30 158,3 170,57 182,30 220,30 238,14 252,46 265,30 310,30 328,30 340,8 352,52 364,30 420,30"
        fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ onUpload }) {
  return (
    <section style={{minHeight:'100vh',background:`linear-gradient(160deg,#e8f5e9 0%,${C.bg} 40%,${C.bg} 100%)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'100px 24px 64px',textAlign:'center'}}>

      {/* Badge */}
      <div style={{display:'inline-flex',alignItems:'center',gap:8,border:`1px solid ${C.borderGn}`,borderRadius:999,padding:'6px 16px',marginBottom:32,background:'rgba(255,255,255,0.7)'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
        <span style={{fontSize:13,color:C.muted,fontWeight:500}}>Student AI portfolio project · in development</span>
      </div>

      {/* Headline */}
      <h1 className="font-display" style={{fontSize:'clamp(38px,6vw,68px)',lineHeight:1.1,letterSpacing:'-1.5px',maxWidth:760,marginBottom:24}}>
        Your medical reports,<br/>
        <span style={{color:C.green}}>explained in plain language.</span>
      </h1>

      <p style={{fontSize:'clamp(15px,2vw,18px)',color:C.muted,lineHeight:1.7,maxWidth:560,marginBottom:40}}>
        MediScan AI reads your lab tests, blood work and radiology reports, flags what's abnormal, and explains it like a friend who happens to be a doctor — in English or Hindi.
      </p>

      {/* CTA */}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginBottom:64}}>
        <button onClick={onUpload}
          style={{display:'inline-flex',alignItems:'center',gap:10,background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'14px 28px',fontSize:16,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 16px rgba(22,163,74,.3)',transition:'all .2s'}}
          onMouseEnter={e=>{e.currentTarget.style.background=C.greenMd;e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.transform='translateY(0)'}}>
          Upload your report
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

      {/* Demo report card */}
      <div style={{width:'100%',maxWidth:780,background:C.bgCard,borderRadius:20,boxShadow:'0 4px 32px rgba(0,0,0,0.08)',overflow:'hidden',textAlign:'left'}}>
        {/* macOS dots */}
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:12,height:12,borderRadius:'50%',background:'#ff5f56',display:'inline-block'}}/>
          <span style={{width:12,height:12,borderRadius:'50%',background:'#ffbd2e',display:'inline-block'}}/>
          <span style={{width:12,height:12,borderRadius:'50%',background:'#27c93f',display:'inline-block'}}/>
          <span style={{fontSize:13,color:C.subtle,marginLeft:12,fontFamily:'monospace'}}>blood_report_oct.pdf · analyzed</span>
        </div>

        <div style={{padding:24}}>
          {/* Param cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[
              {label:'HEMOGLOBIN',    val:'11.2 g/dL', tag:'FLAGGED',   tagBg:'#fff7ed',tagCol:'#c2410c', bg:'#fffbeb',border:'#fde68a'},
              {label:'VITAMIN D',     val:'14 ng/mL',  tag:'FLAGGED',   tagBg:'#fff7ed',tagCol:'#c2410c', bg:'#fffbeb',border:'#fde68a'},
              {label:'CHOLESTEROL',   val:'178 mg/dL', tag:'IN RANGE',  tagBg:'#f0fdf4',tagCol:'#15803d', bg:'#f8fffe',border:'#d1fae5'},
            ].map(p=>(
              <div key={p.label} style={{background:p.bg,border:`1px solid ${p.border}`,borderRadius:12,padding:'14px 16px'}}>
                <p style={{fontSize:10,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',marginBottom:6}}>{p.label}</p>
                <p className="font-mono" style={{fontSize:20,fontWeight:600,color:C.text,marginBottom:4}}>{p.val}</p>
                <span style={{fontSize:10,fontWeight:700,color:p.tagCol,background:p.tagBg,padding:'2px 8px',borderRadius:999}}>{p.tag}</span>
              </div>
            ))}
          </div>

          {/* Plain English summary */}
          <div style={{background:'#f8fafc',border:`1px solid ${C.border}`,borderRadius:12,padding:'16px 20px'}}>
            <p style={{fontSize:15,color:C.text,lineHeight:1.65}}>
              <span style={{color:C.green,fontWeight:700}}>In plain English:</span> Your iron and vitamin D are a bit low — common, and usually fixable with diet or supplements. Cholesterol looks fine. Consider seeing a <strong>general physician</strong> within 2 weeks.
            </p>
          </div>
        </div>
      </div>

      <p style={{fontSize:13,color:C.subtle,marginTop:14}}>No real medical data is processed — this is a student demo.</p>
    </section>
  )
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features() {
  const items = [
    { icon:'📄', title:'PDF & scan ingestion',         desc:'Drop in lab PDFs, photos of reports, even handwritten notes — OCR handles the messy bits.' },
    { icon:'✨', title:'Plain-language explanations',  desc:"GPT-4o rewrites dense medical jargon into something you'd actually say out loud." },
    { icon:'🛡️', title:'Risk scoring',                desc:"Each report gets a severity score so you know what's chill and what isn't." },
    { icon:'📈', title:'Health timeline',              desc:'Track values across uploads — see trends in your cholesterol, hemoglobin, vitamin D, more.' },
    { icon:'🩺', title:'Specialist suggestions',       desc:'Recommends which doctor to consult based on what the report flags.' },
    { icon:'🌐', title:'Hindi support',                desc:'Read explanations in English or Hindi — built for real Indian patients.' },
  ]
  return (
    <section id="features" style={{padding:'96px 24px',background:C.bg}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <p style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>WHAT IT DOES</p>
        <h2 className="font-display" style={{fontSize:'clamp(28px,4vw,48px)',textAlign:'center',letterSpacing:'-1px',marginBottom:56,color:C.greenDk}}>
          Everything you'd want a doctor friend to do.
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          {items.map((f,i)=>(
            <div key={i}
              style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:'28px 24px',transition:'all .22s',cursor:'default'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.08)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{width:40,height:40,background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:16}}>{f.icon}</div>
              <p style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>{f.title}</p>
              <p style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num:'01', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
      title:'Upload your report', desc:'PDF, JPG, PNG — even a phone photo. OCR + PyMuPDF extract the raw text.' },
    { num:'02', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18.5 3.5l1.5 1.5-1.5 1.5-1.5-1.5z"/></svg>,
      title:'AI extracts & interprets', desc:'Values, ranges and abnormal flags are pulled out. GPT-4o then explains them clearly.' },
    { num:'03', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      title:'Get a clear summary', desc:'Risk score, what each value means, and which specialist to consider — plus a chat to ask follow-ups.' },
  ]
  return (
    <section id="how-it-works" style={{padding:'96px 24px',background:C.bg}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <p style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>HOW IT WORKS</p>
        <h2 className="font-display" style={{fontSize:'clamp(28px,4vw,48px)',textAlign:'center',letterSpacing:'-1px',marginBottom:56,color:C.greenDk}}>
          Three steps from PDF to peace of mind.
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          {steps.map((s,i)=>(
            <div key={i}
              style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:'28px 24px',transition:'all .22s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.08)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                <span className="font-display" style={{fontSize:40,color:C.greenLt,letterSpacing:'-2px',lineHeight:1}}>{s.num}</span>
                <div style={{width:34,height:34,background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.icon}</div>
              </div>
              <p style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>{s.title}</p>
              <p style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TECH STACK ──────────────────────────────────────────────────────────────
function TechStack() {
  const rows = [
    ['Frontend','React (Vite) + Tailwind'],
    ['Backend','FastAPI (Python)'],
    ['LLM','Groq / Llama 3.3 70B'],
    ['OCR','Tesseract + PyMuPDF'],
    ['Database','SQLite → PostgreSQL'],
    ['Auth','JWT'],
    ['Storage','Local → AWS S3'],
    ['Deploy','Vercel + Render'],
  ]
  return (
    <section id="tech-stack" style={{padding:'96px 24px',background:C.bg}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <p style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>UNDER THE HOOD</p>
        <h2 className="font-display" style={{fontSize:'clamp(26px,4vw,46px)',textAlign:'center',letterSpacing:'-1px',marginBottom:56,color:C.greenDk}}>
          Built on a clean, modern stack.
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {rows.map(([k,v])=>(
            <div key={k} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,color:C.muted,fontWeight:500}}>{k}</span>
              <span className="font-mono" style={{fontSize:13,color:C.green,fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ROADMAP ─────────────────────────────────────────────────────────────────
function Roadmap() {
  const phases = [
    { label:'Phase 1 — Project setup & repo structure',         done:true },
    { label:'Phase 2 — PDF / image ingestion + OCR pipeline',  done:false },
    { label:'Phase 3 — GPT-4o report explanation engine',       done:false },
    { label:'Phase 4 — Risk scorer + structured extraction',    done:false },
    { label:'Phase 5 — Upload page + report display UI',        done:false },
    { label:'Phase 6 — Chat interface',                         done:false },
    { label:'Phase 7 — Health timeline dashboard',              done:false },
    { label:'Phase 8 — Auth (JWT)',                             done:false },
    { label:'Phase 9 — Hindi language support',                 done:false },
    { label:'Phase 10 — Production deployment',                 done:false },
  ]
  return (
    <section id="roadmap" style={{padding:'96px 24px',background:C.bg}}>
      <div style={{maxWidth:760,margin:'0 auto'}}>
        <p style={{fontSize:12,fontWeight:700,color:C.green,letterSpacing:'0.1em',textTransform:'uppercase',textAlign:'center',marginBottom:12}}>ROADMAP</p>
        <h2 className="font-display" style={{fontSize:'clamp(26px,4vw,46px)',textAlign:'center',letterSpacing:'-1px',marginBottom:56,color:C.greenDk}}>
          Where it's headed.
        </h2>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {phases.map((p,i)=>(
            <div key={i} style={{
              background:p.done?C.bgCard:'#fff',
              border:`1px solid ${p.done?C.green:C.border}`,
              borderRadius:12,padding:'16px 20px',
              display:'flex',alignItems:'center',gap:14,
              boxShadow:p.done?`0 0 0 1px ${C.green}20`:undefined,
            }}>
              <div style={{
                width:24,height:24,borderRadius:'50%',flexShrink:0,
                border:`2px solid ${p.done?C.green:C.border}`,
                background:p.done?C.green:'transparent',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {p.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{fontSize:14,color:p.done?C.text:C.muted,fontWeight:p.done?600:400}}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── UPLOAD SECTION ───────────────────────────────────────────────────────────
function UploadSection({ onFileSelect, loading, error }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const ref = useRef()

  const pick = (f) => { if(f){setFile(f);onFileSelect(f)} }

  const sideSteps = [
    { n:'1', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, title:'Upload', desc:'PDF, scan or phone photo. OCR handles handwriting too.' },
    { n:'2', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>, title:'Understand', desc:'Plain-language explanation of every value, in English or Hindi.' },
    { n:'3', icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title:'Ask', desc:"Chat with the report to clarify anything you don't get." },
  ]

  return (
    <section id="upload" style={{padding:'96px 24px',background:C.bg}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        <h2 className="font-display" style={{fontSize:'clamp(26px,4vw,44px)',textAlign:'center',letterSpacing:'-1px',marginBottom:12,color:C.greenDk}}>
          Upload your report.
        </h2>
        <p style={{textAlign:'center',color:C.muted,fontSize:15,marginBottom:48,lineHeight:1.6}}>
          Drop in a lab PDF or a photo of your report. We'll run a mock analysis right here — no data leaves your browser.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start'}} className="upload-grid">
          {/* Drop zone */}
          <div
            style={{
              border:`2px dashed ${dragging?C.green:C.borderGn}`,
              borderRadius:16,padding:'72px 32px',
              textAlign:'center',cursor:loading?'not-allowed':'pointer',
              background:dragging?C.greenXlt:'#fff',
              transition:'all .2s',opacity:loading?.65:1,
              minHeight:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,
            }}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);pick(e.dataTransfer.files[0])}}
            onClick={()=>!loading&&ref.current?.click()}
          >
            <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={e=>pick(e.target.files[0])} />
            <div style={{width:52,height:52,background:C.greenXlt,border:`1.5px solid ${C.borderGn}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            {file ? (
              <div>
                <p style={{fontSize:15,fontWeight:600,color:C.text}}>{file.name}</p>
                <p style={{fontSize:13,color:C.subtle,marginTop:4}}>Ready to analyse</p>
              </div>
            ) : (
              <div>
                <p style={{fontSize:16,fontWeight:600,color:C.text,marginBottom:4}}>{dragging?'Drop it here':'Drop your report here'}</p>
                <p style={{fontSize:13,color:C.subtle}}>PDF · JPG · PNG · up to 10MB</p>
              </div>
            )}
            {!file && (
              <button
                style={{background:C.green,color:'#fff',border:'none',borderRadius:9,padding:'9px 22px',fontSize:14,fontWeight:600,cursor:'pointer',pointerEvents:'none'}}
              >Choose file</button>
            )}
          </div>

          {/* Steps sidebar */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {sideSteps.map(s=>(
              <div key={s.n} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:14,padding:'16px 18px',display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:32,height:32,background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.icon}</div>
                <div>
                  <p style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{s.n}. {s.title}</p>
                  <p style={{fontSize:13,color:C.muted,lineHeight:1.55}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{marginTop:20,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:14,padding:'16px 20px'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <p style={{fontSize:14,fontWeight:600,color:'#b91c1c',marginBottom:4}}>Analysis Failed</p>
                <p style={{fontSize:13,color:'#dc2626',lineHeight:1.6}}>{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@media(max-width:720px){.upload-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}

// ─── CTA + FOOTER ────────────────────────────────────────────────────────────
function Footer({ onUpload }) {
  return (
    <>
      {/* CTA */}
      <section style={{padding:'96px 24px',background:C.bg,textAlign:'center'}}>
        <h2 className="font-display" style={{fontSize:'clamp(26px,4vw,48px)',letterSpacing:'-1px',marginBottom:16,color:C.greenDk}}>
          Ready to decode your next report?
        </h2>
        <p style={{fontSize:16,color:C.muted,marginBottom:36}}>Create an account to save your reports and build your health timeline.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={onUpload}
            style={{background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'13px 28px',fontSize:15,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 16px rgba(22,163,74,.25)',transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.greenMd}
            onMouseLeave={e=>e.currentTarget.style.background=C.green}>
            Create an account
          </button>
          <button style={{background:'#fff',color:C.text,border:`1px solid ${C.border}`,borderRadius:12,padding:'13px 28px',fontSize:15,fontWeight:500,cursor:'pointer',transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            I already have one
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:'24px',background:C.bg}}>
        <div style={{maxWidth:1120,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:28,height:28,background:C.green,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span className="font-display" style={{fontSize:15,color:C.text}}>MediScan AI</span>
            <span style={{fontSize:14,color:C.subtle}}>— built as a student AI project.</span>
          </div>
          <span style={{fontSize:13,color:C.subtle}}>© 2026 MediScan AI</span>
        </div>
        <div style={{maxWidth:1120,margin:'12px auto 0',padding:'12px 0 0',borderTop:`1px solid ${C.borderGn}`}}>
          <p style={{fontSize:12,color:C.subtle,textAlign:'center'}}>
            🔒 Educational tool only — does not provide medical advice, diagnosis, or treatment.
          </p>
        </div>
      </footer>
    </>
  )
}

// ─── LOADING ─────────────────────────────────────────────────────────────────
function LoadingScreen({ filename }) {
  const [step,setStep] = useState(0)
  const steps = ['Extracting text from report…','Reading lab values…','Comparing with reference ranges…','Generating your explanation…']
  useEffect(()=>{
    const t=setInterval(()=>setStep(s=>Math.min(s+1,steps.length-1)),2800)
    return()=>clearInterval(t)
  },[])

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,#e8f5e9,${C.bg})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32}}>
      <div style={{position:'relative',marginBottom:32}}>
        <div style={{width:72,height:72,border:`3px solid ${C.greenLt}`,borderTopColor:C.green,borderRadius:'50%'}} className="spinner"/>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
      </div>
      <h3 className="font-display" style={{fontSize:28,color:C.greenDk,marginBottom:8}}>Analysing Your Report</h3>
      <p style={{fontSize:14,color:C.subtle,marginBottom:40,maxWidth:320,textAlign:'center'}}>{filename}</p>
      <div style={{display:'flex',flexDirection:'column',gap:14,width:'100%',maxWidth:340}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,opacity:i<=step?1:0.3,transition:'opacity .4s'}}>
            <div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:i<step?C.green:i===step?C.greenXlt:'#f3f4f6',border:i===step?`2px solid ${C.green}`:'2px solid transparent',transition:'all .4s'}}>
              {i<step?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                :i===step?<span className="pulse-dot" style={{width:7,height:7,background:C.green,borderRadius:'50%',display:'block'}}/>:null}
            </div>
            <span style={{fontSize:14,color:i<=step?C.text:'#d1d5db',fontWeight:i===step?600:400,transition:'all .3s'}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CHAT PANEL ──────────────────────────────────────────────────────────────
function FormattedChatMessage({ content, isUser }) {
  if (isUser) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
  }

  const lines = (content || '').split('\n')
  return (
    <div className="chat-formatted-text" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} style={{ height: 6 }} />
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')
        const cleanLine = isBullet ? trimmed.replace(/^([•\-\*]\s*)/, '') : line

        // Parse bold **text**
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g)
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} style={{ fontWeight: 650, color: '#14532d' }}>
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })

        if (isBullet) {
          return (
            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'flex-start' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold', lineHeight: '1.4' }}>•</span>
              <span style={{ flex: 1 }}>{rendered}</span>
            </div>
          )
        }

        return (
          <div key={idx} style={{ marginBottom: idx < lines.length - 1 ? 4 : 0 }}>
            {rendered}
          </div>
        )
      })}
    </div>
  )
}

function ChatPanel({ analysis, filename, language = 'english', onLanguageChange, onClose }) {
  const [chatLang, setChatLang] = useState(language)
  const [speaking, setSpeaking] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [listening, setListening] = useState(false)

  const buildInitialGreeting = (lang, rep) => {
    const isHindi = lang === 'hindi'
    if (rep) {
      const repName = rep.report_type || 'Report'
      return isHindi
        ? `नमस्ते! मैं MediScan AI Chat हूँ। आपकी **${repName}** का डेटा मेरे पास उपलब्ध है। आप किसी भी पैरामीटर, असामान्य मानों या डॉक्टर से परामर्श के बारे में पूछ सकते हैं।`
        : `Hi! I'm MediScan AI Chat. Your **${repName}** findings are loaded in our session. Ask me about your biomarkers, abnormal values, normal ranges, or next steps.`
    }
    return isHindi
      ? `नमस्ते! मैं MediScan AI Chat हूँ। आप किसी भी मेडिकल टेस्ट (जैसे CBC, Lipid Profile, Thyroid, LFT), सामान्य सीमाओं या स्वास्थ्य सलाह के बारे में पूछ सकते हैं।`
      : `Hi! I'm MediScan AI Chat. Ask me anything about lab tests (CBC, Lipid Panel, Thyroid, LFT, KFT), biomarker reference ranges, or healthy lifestyle guidance.`
  }

  const [messages, setMessages] = useState([
    { role: 'assistant', content: buildInitialGreeting(language, analysis) }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Sync language with parent if changed
  const handleLangToggle = (newLang) => {
    setChatLang(newLang)
    if (onLanguageChange) onLanguageChange(newLang)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Stop TTS speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const send = async (explicitText) => {
    const text = (explicitText || input).trim()
    if (!text || loading) return

    if (speaking && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    if (!explicitText) setInput('')
    setLoading(true)

    try {
      const res = await chatWithReport(updatedMessages, analysis, chatLang)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch (err) {
      console.warn('Chat request failed, backend fallback:', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: chatLang === 'hindi'
            ? 'क्षमा करें, सर्वर से प्रतिक्रिया प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : "I'm having a brief issue connecting. Please click below to try again.",
          isError: true,
          failedQuery: text,
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    if (speaking && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
    setMessages([
      { role: 'assistant', content: buildInitialGreeting(chatLang, analysis) }
    ])
  }

  const copyMessage = (text, idx) => {
    if (!navigator?.clipboard) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1800)
    })
  }

  const toggleSpeak = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#•]/g, ' ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = chatLang === 'hindi' ? 'hi-IN' : 'en-US'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const toggleVoiceInput = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Voice dictation is supported in Google Chrome, Edge, and modern Chromium browsers.')
      return
    }
    if (listening) {
      setListening(false)
      return
    }
    try {
      const rec = new SpeechRec()
      rec.lang = chatLang === 'hindi' ? 'hi-IN' : 'en-US'
      rec.interimResults = false
      rec.onresult = (ev) => {
        const trans = ev.results?.[0]?.[0]?.transcript
        if (trans) {
          setInput(prev => (prev ? prev + ' ' + trans : trans))
        }
        setListening(false)
      }
      rec.onerror = () => setListening(false)
      rec.onend = () => setListening(false)
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  const suggestionQuestions = analysis
    ? (chatLang === 'hindi' ? [
        'मेरी रिपोर्ट में क्या असामान्य है?',
        'मुझे किस डॉक्टर से मिलना चाहिए?',
        'मेरा स्वास्थ्य जोखिम स्कोर समझाएं',
        'डॉक्टर से क्या सवाल पूछने चाहिए?'
      ] : [
        'What is abnormal in my report?',
        'Which specialist should I consult?',
        'Explain my overall risk score',
        'What questions should I ask my doctor?'
      ])
    : (chatLang === 'hindi' ? [
        'कोलेस्ट्रॉल कम करने के क्या उपाय हैं?',
        'सामान्य Hemoglobin स्तर क्या होता है?',
        'Vitamin D की कमी के क्या लक्षण हैं?',
        'CBC टेस्ट में क्या-क्या जांचा जाता है?'
      ] : [
        'What is normal Hemoglobin range?',
        'How can I lower high LDL cholesterol?',
        'Common signs of Vitamin D deficiency?',
        'What tests are in a CBC panel?'
      ])

  return (
    <div className="chat-panel" style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, maxWidth: '96vw',
      background: '#fff', boxShadow: '-6px 0 36px rgba(0,0,0,0.14)',
      display: 'flex', flexDirection: 'column', zIndex: 220,
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 6 }}>
              MediScan AI Chat
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>24/7</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Clinical Guidance & Lab Assistant</div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Language toggle button */}
          <button
            onClick={() => handleLangToggle(chatLang === 'hindi' ? 'english' : 'hindi')}
            title="Switch Language"
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8,
              padding: '4px 8px', color: '#fff', fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {chatLang === 'hindi' ? '🇮🇳 हि' : '🌐 EN'}
          </button>

          {/* Clear chat button */}
          <button
            onClick={clearChat}
            title="Restart conversation"
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8,
              width: 28, height: 28, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close chat"
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 8,
              width: 28, height: 28, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Context status banner */}
      {analysis ? (
        <div style={{
          padding: '7px 16px', background: '#f0fdf4',
          borderBottom: `1px solid ${C.borderGn}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11.5, color: C.greenDk,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Report: {filename || analysis.report_type || 'Active Report'}
            </span>
          </div>
          <span style={{
            background: '#dcfce7', color: '#15803d',
            padding: '2px 8px', borderRadius: 99, fontWeight: 700, fontSize: 10.5, flexShrink: 0
          }}>
            {analysis.risk_badge || 'Synced'}
          </span>
        </div>
      ) : (
        <div style={{
          padding: '7px 16px', background: '#f8fafc',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, color: C.muted,
        }}>
          <span>✨</span>
          <span>General Health Assistant • Ask any medical or lab question</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map((m, i) => (
          <div key={i} className="chat-bubble chat-bubble-wrapper" style={{
            marginBottom: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '88%',
              padding: '11px 15px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              color: m.role === 'user' ? '#fff' : C.text,
              fontSize: 13.5,
              lineHeight: 1.65,
              boxShadow: m.role === 'user' ? '0 2px 8px rgba(22,163,74,0.2)' : 'none',
              border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
            }}>
              <FormattedChatMessage content={m.content} isUser={m.role === 'user'} />
              {m.isError && m.failedQuery && (
                <button
                  onClick={() => send(m.failedQuery)}
                  style={{
                    marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca',
                    padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 650, cursor: 'pointer'
                  }}
                >
                  🔄 Retry question
                </button>
              )}
            </div>

            {/* Bubble Action Bar for assistant responses */}
            {m.role === 'assistant' && (
              <div className="chat-bubble-action" style={{
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, marginLeft: 6
              }}>
                <button
                  onClick={() => copyMessage(m.content, i)}
                  title="Copy explanation"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: C.muted, padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 3
                  }}
                >
                  {copiedIdx === i ? (
                    <span style={{ color: C.green, fontWeight: 600 }}>✓ Copied</span>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleSpeak(m.content)}
                  title={speaking ? 'Stop speech' : 'Listen to explanation'}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, color: speaking ? C.green : C.muted, padding: '2px 4px',
                    display: 'flex', alignItems: 'center', gap: 3
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  {speaking ? 'Stop' : 'Listen'}
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>MediScan AI is thinking</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="pulse-dot" style={{
                  width: 6, height: 6, background: C.green, borderRadius: '50%',
                  display: 'block', animationDelay: `${i * 0.18}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 14px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 650, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Suggested Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {suggestionQuestions.map((q, i) => (
              <button
                key={i}
                className="chat-suggestion-chip"
                onClick={() => send(q)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: C.greenXlt, border: `1px solid ${C.borderGn}`,
                  borderRadius: 10, padding: '8px 12px', fontSize: 12,
                  color: C.greenDk, cursor: 'pointer', fontWeight: 550
                }}
              >
                💬 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div style={{
        padding: '10px 14px 14px',
        borderTop: `1px solid ${C.border}`,
        background: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#f9fafb',
          border: `1.5px solid ${C.border}`,
          borderRadius: 14,
          padding: '4px 6px',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={chatLang === 'hindi' ? 'यहाँ सवाल पूछें… (Enter दबाएँ)' : 'Ask about tests, ranges, advice… (Enter to send)'}
            rows={1}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              padding: '8px 8px', fontSize: 13.5, resize: 'none', outline: 'none',
              fontFamily: 'inherit', color: C.text, lineHeight: 1.4,
              maxHeight: 90,
            }}
          />

          {/* Voice Input button */}
          <button
            onClick={toggleVoiceInput}
            title={listening ? 'Listening...' : 'Voice dictation'}
            style={{
              background: listening ? '#fee2e2' : 'transparent',
              border: 'none', borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: listening ? '#dc2626' : C.muted, flexShrink: 0
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>

          {/* Send button */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              background: (!input.trim() || loading) ? C.greenLt : C.green,
              border: 'none', borderRadius: 10, width: 34, height: 34,
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background .2s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={(!input.trim() || loading) ? C.green : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>

        <div style={{ marginTop: 6, fontSize: 10.5, color: C.subtle, textAlign: 'center' }}>
          🔒 MediScan AI is an educational assistant. Consult a physician for diagnosis.
        </div>
      </div>
    </div>
  )
}


// ─── RESULTS ─────────────────────────────────────────────────────────────────
const RISK_STYLE = {
  'All Normal':    {bg:'#f0fdf4',col:'#15803d',border:'#bbf7d0',bar:'#22c55e'},
  'Low Risk':      {bg:'#f0fdf4',col:'#15803d',border:'#bbf7d0',bar:'#22c55e'},
  'Medium Risk':   {bg:'#fefce8',col:'#a16207',border:'#fde68a',bar:'#eab308'},
  'High Risk':     {bg:'#fff7ed',col:'#c2410c',border:'#fed7aa',bar:'#f97316'},
  'Critical Risk': {bg:'#fef2f2',col:'#b91c1c',border:'#fecaca',bar:'#ef4444'},
}
const PARAM_STYLE = {
  Normal:   {bg:'#f0fdf4',border:'#bbf7d0',tag:'#15803d',tagBg:'#dcfce7',icon:'✓'},
  High:     {bg:'#fef2f2',border:'#fecaca',tag:'#b91c1c',tagBg:'#fee2e2',icon:'↑'},
  Low:      {bg:'#eff6ff',border:'#bfdbfe',tag:'#1d4ed8',tagBg:'#dbeafe',icon:'↓'},
  Critical: {bg:'#fff1f2',border:'#fda4af',tag:'#9f1239',tagBg:'#ffe4e6',icon:'⚠'},
}

function RiskGauge({ score, badge }) {
  const rs = RISK_STYLE[badge] || RISK_STYLE['Low Risk']
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:600,color:C.muted}}>Risk Score</span>
        <span className="font-mono" style={{fontSize:22,fontWeight:700,color:rs.col}}>{score}/100</span>
      </div>
      <div style={{height:8,background:'#f3f4f6',borderRadius:999,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${score}%`,background:rs.bar,borderRadius:999,transition:'width .8s ease'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
        {['0','25','50','75','100'].map(v=><span key={v} style={{fontSize:10,color:'#d1d5db'}}>{v}</span>)}
      </div>
    </div>
  )
}

function Results({ data, filename, onReset, language, onOpenChat }) {
  const { analysis } = data
  const [tab, setTab] = useState('all')
  const params = (analysis.parameters||[]).filter(p=>
    tab==='all' ? true : tab==='abnormal' ? p.status!=='Normal' : p.status==='Normal'
  )
  const rs = RISK_STYLE[analysis.risk_badge] || RISK_STYLE['Low Risk']
  const sb = analysis.score_breakdown || {}

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingTop:80,paddingBottom:64}}>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'0 24px'}}>

        {/* Page header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,flexWrap:'wrap',gap:12,paddingTop:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p style={{fontSize:13,color:C.subtle}}>{filename}</p>
            </div>
            <h2 className="font-display" style={{fontSize:30,color:C.greenDk,letterSpacing:'-0.5px'}}>Report Analysis</h2>
          </div>
          <button onClick={onReset}
            style={{display:'flex',alignItems:'center',gap:7,border:`1px solid ${C.border}`,background:'#fff',borderRadius:10,padding:'9px 18px',fontSize:14,color:C.muted,cursor:'pointer',transition:'all .2s',fontWeight:500}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted}}>
            ↺ Analyse Another Report
          </button>
        </div>

        {/* ── PATIENT DEMOGRAPHICS BANNER ── */}
        {analysis.patient_info && (analysis.patient_info.patient_name || analysis.patient_info.age || analysis.patient_info.lab_name) && (
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 20px',marginBottom:14,display:'flex',flexWrap:'wrap',gap:16,alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
              {analysis.patient_info.patient_name && (
                <div>
                  <span style={{fontSize:11,fontWeight:700,color:C.subtle,textTransform:'uppercase'}}>Patient Name: </span>
                  <span style={{fontSize:14,fontWeight:700,color:C.text}}>{analysis.patient_info.patient_name}</span>
                </div>
              )}
              {analysis.patient_info.age && (
                <div>
                  <span style={{fontSize:11,fontWeight:700,color:C.subtle,textTransform:'uppercase'}}>Age: </span>
                  <span style={{fontSize:14,fontWeight:600,color:C.text}}>{analysis.patient_info.age} Yrs</span>
                </div>
              )}
              {analysis.patient_info.gender && (
                <div>
                  <span style={{fontSize:11,fontWeight:700,color:C.subtle,textTransform:'uppercase'}}>Gender: </span>
                  <span style={{fontSize:14,fontWeight:600,color:C.text,textTransform:'capitalize'}}>{analysis.patient_info.gender}</span>
                </div>
              )}
              {analysis.patient_info.referring_doctor && (
                <div>
                  <span style={{fontSize:11,fontWeight:700,color:C.subtle,textTransform:'uppercase'}}>Referred By: </span>
                  <span style={{fontSize:14,fontWeight:600,color:C.text}}>{analysis.patient_info.referring_doctor}</span>
                </div>
              )}
            </div>
            {analysis.patient_info.lab_name && (
              <span style={{fontSize:12,fontWeight:600,color:C.greenDk,background:C.greenLt,padding:'4px 12px',borderRadius:8}}>
                🏢 {analysis.patient_info.lab_name}
              </span>
            )}
          </div>
        )}

        {/* ── ROW 1: Risk overview + Meta cards ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:14}} className="r-grid-3">

          {/* Risk card */}
          <div style={{background:'#fff',border:`1.5px solid ${rs.border}`,borderRadius:16,padding:22,gridColumn:'span 1'}}>
            <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14}}>Overall Risk</p>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:rs.bg,border:`1px solid ${rs.border}`,borderRadius:999,padding:'6px 14px',marginBottom:16}}>
              <span className="pulse-dot" style={{width:7,height:7,background:rs.col,borderRadius:'50%',display:'inline-block'}}/>
              <span style={{fontSize:13,fontWeight:700,color:rs.col}}>{analysis.risk_badge}</span>
            </div>
            <RiskGauge score={analysis.risk_score} badge={analysis.risk_badge}/>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.65,borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:4}}>{analysis.risk_reason}</p>
          </div>

          {/* Score breakdown */}
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22}}>
            <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:14}}>Parameter Breakdown</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {l:'Total',    v:sb.total_parameters, c:'#374151', bg:'#f9fafb'},
                {l:'Normal',   v:sb.normal,           c:'#15803d', bg:'#f0fdf4'},
                {l:'High',     v:sb.high,             c:'#b91c1c', bg:'#fef2f2'},
                {l:'Low',      v:sb.low,              c:'#1d4ed8', bg:'#eff6ff'},
                {l:'Critical', v:sb.critical,         c:'#9f1239', bg:'#fff1f2'},
                {l:'Abnormal', v:sb.abnormal_total,   c:'#c2410c', bg:'#fff7ed'},
              ].map(({l,v,c,bg})=>(
                <div key={l} style={{background:bg,borderRadius:10,padding:'10px 12px',textAlign:'center',border:'1px solid rgba(0,0,0,.04)'}}>
                  <p className="font-mono" style={{fontSize:22,fontWeight:700,color:c,lineHeight:1}}>{v??0}</p>
                  <p style={{fontSize:11,color:C.subtle,marginTop:3}}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meta: report type + specialist + language */}
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22,display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Report Type</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:8,padding:'6px 12px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span style={{fontSize:14,fontWeight:700,color:C.greenDk}}>{analysis.report_type}</span>
              </div>
            </div>

            <div>
              <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Recommended Specialist</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:8,padding:'6px 12px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{fontSize:14,fontWeight:700,color:'#0c4a6e'}}>{analysis.specialist || analysis.doctor_referral}</span>
              </div>
            </div>

            <div>
              <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Risk Level (LLM)</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:rs.bg,border:`1px solid ${rs.border}`,borderRadius:8,padding:'6px 12px'}}>
                <span style={{fontSize:14,fontWeight:700,color:rs.col}}>{analysis.risk_level}</span>
              </div>
            </div>

            <div style={{marginTop:'auto'}}>
              <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6}}>Filename</p>
              <p className="font-mono" style={{fontSize:12,color:C.muted,wordBreak:'break-all'}}>{filename}</p>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Summary ── */}
        <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:C.subtle,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Plain-Language Summary</p>
          <p style={{fontSize:15,color:C.text,lineHeight:1.75}}>{analysis.summary}</p>
        </div>

        {/* ── ROW 3: Abnormal findings ── */}
        {analysis.abnormal_findings?.length>0 && (
          <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:14,padding:'16px 20px',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p style={{fontSize:14,fontWeight:700,color:'#c2410c'}}>{analysis.abnormal_findings.length} Abnormal Findings</p>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {analysis.abnormal_findings.map((f,i)=>(
                <span key={i} style={{fontSize:13,fontWeight:600,background:'#fff',color:'#c2410c',border:'1px solid #fed7aa',borderRadius:999,padding:'5px 14px'}}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── ROW 4: Parameters ── */}
        <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:10}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700,color:C.text}}>All Parameters</h3>
              <p style={{fontSize:12,color:C.subtle,marginTop:2}}>{(analysis.parameters||[]).length} total parameters analysed</p>
            </div>
            <div style={{display:'flex',gap:6,background:'#f9fafb',borderRadius:10,padding:4,border:`1px solid ${C.border}`}}>
              {[['all','All'],['abnormal','Abnormal'],['normal','Normal']].map(([v,l])=>(
                <button key={v} onClick={()=>setTab(v)}
                  style={{fontSize:12,fontWeight:600,padding:'5px 14px',borderRadius:7,border:'none',cursor:'pointer',background:tab===v?C.green:'transparent',color:tab===v?'#fff':C.muted,transition:'all .18s'}}>
                  {l} {v==='all'?(analysis.parameters||[]).length:v==='abnormal'?(analysis.parameters||[]).filter(p=>p.status!=='Normal').length:(analysis.parameters||[]).filter(p=>p.status==='Normal').length}
                </button>
              ))}
            </div>
          </div>

          {params.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 0',color:C.subtle}}>No parameters in this category.</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {params.map((p,i)=>{
                const ps = PARAM_STYLE[p.status] || PARAM_STYLE.Normal
                return (
                  <div key={i}
                    style={{background:ps.bg,border:`1.5px solid ${ps.border}`,borderRadius:14,padding:'16px 18px',transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.07)'}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>

                    {/* Header row */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <p style={{fontSize:14,fontWeight:700,color:C.text,flex:1,marginRight:8}}>{p.name}</p>
                      <span style={{fontSize:11,fontWeight:700,color:ps.tag,background:ps.tagBg,padding:'3px 10px',borderRadius:999,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4}}>
                        {ps.icon} {p.status}
                      </span>
                    </div>

                    {/* Value + range */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12,background:'rgba(255,255,255,0.6)',borderRadius:10,padding:'10px 12px'}}>
                      <div>
                        <p style={{fontSize:10,fontWeight:600,color:C.subtle,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Your Value</p>
                        <p className="font-mono" style={{fontSize:15,fontWeight:700,color:p.status==='Normal'?C.green:p.status==='Low'?'#1d4ed8':p.status==='Critical'?'#9f1239':'#b91c1c'}}>{p.value}</p>
                      </div>
                      <div>
                        <p style={{fontSize:10,fontWeight:600,color:C.subtle,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Normal Range</p>
                        <p style={{fontSize:13,color:C.muted,fontWeight:500}}>{p.normal_range}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <p style={{fontSize:12,color:C.muted,lineHeight:1.65}}>{p.explanation}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── CLINICAL RECOMMENDATIONS & LIFESTYLE ── */}
        {((analysis.recommendations?.length > 0) || (analysis.lifestyle_tips?.length > 0)) && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}} className="r-grid-2">
            {analysis.recommendations?.length > 0 && (
              <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:16}}>📋</span>
                  <h4 style={{fontSize:14,fontWeight:700,color:C.text,margin:0}}>Recommended Follow-up</h4>
                </div>
                <ul style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:8}}>
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.lifestyle_tips?.length > 0 && (
              <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:16}}>🥗</span>
                  <h4 style={{fontSize:14,fontWeight:700,color:C.text,margin:0}}>Dietary & Lifestyle Pointers</h4>
                </div>
                <ul style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:8}}>
                  {analysis.lifestyle_tips.map((tip, i) => (
                    <li key={i} style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── QUESTIONS TO DISCUSS WITH DOCTOR ── */}
        {analysis.questions_to_discuss_with_doctor?.length > 0 && (
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <span style={{fontSize:18}}>🩺</span>
              <h3 style={{fontSize:15,fontWeight:700,color:C.text,margin:0}}>Questions to Ask Your Doctor</h3>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {analysis.questions_to_discuss_with_doctor.map((q, i) => (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,background:'#f8fafc',padding:'10px 14px',borderRadius:10,border:`1px solid ${C.border}`}}>
                  <span style={{color:C.green,fontWeight:700,fontSize:13}}>Q{i+1}.</span>
                  <p style={{fontSize:13,color:C.text,lineHeight:1.6,margin:0}}>{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RAG MEDICAL KNOWLEDGE CITATIONS ── */}
        {analysis.citations?.length > 0 && (
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>📚</span>
                <h3 style={{fontSize:15,fontWeight:700,color:C.text,margin:0}}>Grounded Clinical References (RAG)</h3>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:C.greenDk,background:C.greenLt,padding:'4px 10px',borderRadius:999}}>
                Evidence-Based Guidelines
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
              {analysis.citations.map((c, i) => (
                <div key={i} style={{background:'#f9fafb',border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.greenDk}}>{c.biomarker}</span>
                    <span style={{fontSize:10,fontWeight:700,background:'#e0f2fe',color:'#0369a1',padding:'2px 8px',borderRadius:999}}>{c.status}</span>
                  </div>
                  <p style={{fontSize:12,color:C.muted,lineHeight:1.5,marginBottom:8}}>{c.clinical_significance}</p>
                  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,color:C.subtle}}>📖 {c.source}</span>
                    <span style={{fontSize:11,fontWeight:600,color:C.greenDk}}>👨‍⚕️ {c.specialist}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultation Prompt Card */}
        <div style={{
          marginTop: 36,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: 16,
          border: `1.5px solid ${C.borderGn}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: C.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.greenDk, marginBottom: 2 }}>
                Have questions about these test results?
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Ask MediScan AI Chat to clarify your biomarker numbers, explain out-of-range findings, or suggest follow-up questions for your doctor.
              </div>
            </div>
          </div>
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              style={{
                background: C.green, color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 20px', fontWeight: 650, fontSize: 13.5,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.greenMd}
              onMouseLeave={e => e.currentTarget.style.background = C.green}
            >
              Chat with this Report →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


// ─── AUTH MODAL ───────────────────────────────────────────────────────────
function AuthModal({ initialMode, onSuccess, onClose }) {
  const [mode, setMode]       = useState(initialMode || 'login')  // 'login' | 'signup'
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'signup') {
        const data = await register(name.trim(), email.trim(), password)
        onSuccess(data.user)
      } else {
        const data = await login(email.trim(), password)
        onSuccess(data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    // Backdrop
    <div onClick={onClose} style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,
      display:'flex',alignItems:'center',justifyContent:'center',padding:20,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff',borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:440,
        boxShadow:'0 20px 60px rgba(0,0,0,0.18)',position:'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'#f3f4f6',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
          <div style={{width:36,height:36,background:C.green,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <span className="font-display" style={{fontSize:18,color:C.greenDk}}>MediScan <span style={{color:C.green}}>AI</span></span>
        </div>

        <h2 className="font-display" style={{fontSize:24,color:C.text,marginBottom:6}}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{fontSize:14,color:C.muted,marginBottom:24}}>
          {mode === 'login' ? 'Sign in to access your report history.' : 'Join MediScan AI — it\'s free.'}
        </p>

        {/* Mode tabs */}
        <div style={{display:'flex',background:'#f3f4f6',borderRadius:12,padding:4,marginBottom:24}}>
          {['login','signup'].map(m => (
            <button key={m} onClick={()=>{setMode(m);setError('')}}
              style={{flex:1,padding:'9px',border:'none',borderRadius:9,cursor:'pointer',fontSize:13.5,fontWeight:600,
                background:mode===m?'#fff':'transparent',
                color:mode===m?C.greenDk:C.muted,
                boxShadow:mode===m?'0 1px 4px rgba(0,0,0,0.08)':'none',
                transition:'all .18s',
              }}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          {mode === 'signup' && (
            <div>
              <label style={{fontSize:13,fontWeight:600,color:C.muted,display:'block',marginBottom:5}}>Full name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required placeholder="Riya Sharma"
                style={{width:'100%',padding:'10px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,outline:'none',color:C.text,boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
          )}
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.muted,display:'block',marginBottom:5}}>Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="riya@example.com"
              style={{width:'100%',padding:'10px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,outline:'none',color:C.text,boxSizing:'border-box'}}
              onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:C.muted,display:'block',marginBottom:5}}>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required
                placeholder={mode==='signup'?'Min. 6 characters':'Your password'}
                style={{width:'100%',padding:'10px 40px 10px 14px',border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,outline:'none',color:C.text,boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
              <button type="button" onClick={()=>setShowPw(s=>!s)}
                style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:C.muted,fontSize:12}}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#b91c1c'}}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{background:loading?C.greenLt:C.green,color:loading?C.green:'#fff',border:'none',borderRadius:12,padding:'13px',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',transition:'all .2s',marginTop:4}}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in →' : 'Create account →'}
          </button>
        </form>

        <p style={{fontSize:12,color:C.subtle,textAlign:'center',marginTop:18}}>
          By continuing, you agree this is a demonstration project for educational use only.
        </p>
      </div>
    </div>
  )
}

// ─── HISTORY PAGE ────────────────────────────────────────────────────────────
const RISK_COLORS = {
  'All Normal':  {bg:'#dcfce7',col:'#15803d'},
  'Low Risk':    {bg:'#dcfce7',col:'#15803d'},
  'Medium Risk': {bg:'#fef9c3',col:'#a16207'},
  'High Risk':   {bg:'#ffedd5',col:'#c2410c'},
  'Critical Risk':{bg:'#fee2e2',col:'#b91c1c'},
}

function HistoryPage({ onBack, onOpenReport }) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)  // id being deleted
  const [error, setError]       = useState('')

  useEffect(() => {
    getHistory(30)
      .then(data => { setReports(data); setLoading(false) })
      .catch(() => { setError('Could not load history. Make sure the backend is running.'); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await deleteHistoryReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch { setError('Failed to delete report.') }
    finally { setDeleting(null) }
  }

  const handleOpen = async (id) => {
    try {
      const full = await getHistoryReport(id)
      onOpenReport(full)
    } catch { setError('Could not load this report.') }
  }

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) }
    catch { return iso }
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingTop:80,paddingBottom:64}}>
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 24px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32,paddingTop:24}}>
          <button onClick={onBack}
            style={{display:'flex',alignItems:'center',gap:6,background:'#fff',border:`1px solid ${C.border}`,borderRadius:10,padding:'9px 16px',cursor:'pointer',fontSize:13,color:C.muted,fontWeight:500}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div>
            <h2 className="font-display" style={{fontSize:28,color:C.greenDk,letterSpacing:'-0.5px',margin:0}}>My Reports</h2>
            <p style={{fontSize:13,color:C.muted,margin:'4px 0 0'}}>{reports.length} saved report{reports.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'14px 18px',marginBottom:20,fontSize:13,color:'#b91c1c'}}>{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80,gap:12,color:C.muted}}>
            <div style={{width:24,height:24,border:`2px solid ${C.greenLt}`,borderTopColor:C.green,borderRadius:'50%'}} className="spinner"/>
            <span style={{fontSize:14}}>Loading your reports…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && !error && (
          <div style={{textAlign:'center',paddingTop:80}}>
            <div style={{fontSize:56,marginBottom:16}}>📄</div>
            <h3 style={{fontSize:20,color:C.text,marginBottom:8}}>No reports yet</h3>
            <p style={{fontSize:14,color:C.muted,marginBottom:28}}>Upload a medical report to get started. Your analyses will appear here.</p>
            <button onClick={onBack}
              style={{background:C.green,color:'#fff',border:'none',borderRadius:12,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Analyse a Report
            </button>
          </div>
        )}

        {/* Report cards grid */}
        {!loading && reports.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
            {reports.map(r => {
              const rc = RISK_COLORS[r.risk_badge] || RISK_COLORS['Low Risk']
              return (
                <div key={r.id} style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:16,padding:20,display:'flex',flexDirection:'column',gap:12,
                  transition:'box-shadow .2s',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(22,163,74,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
                >
                  {/* Card header */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:700,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        📄 {r.filename}
                      </p>
                      <p style={{fontSize:11,color:C.subtle,margin:'3px 0 0'}}>{formatDate(r.created_at)}</p>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:999,background:rc.bg,color:rc.col,flexShrink:0}}>
                      {r.risk_badge}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,color:C.muted,background:'#f9fafb',padding:'3px 10px',borderRadius:999,border:`1px solid ${C.border}`}}>
                      {r.report_type?.replace(/_/g,' ')}
                    </span>
                    {r.patient_name && (
                      <span style={{fontSize:12,color:C.muted,background:'#f9fafb',padding:'3px 10px',borderRadius:999,border:`1px solid ${C.border}`}}>
                        🧑 {r.patient_name}
                      </span>
                    )}
                    {r.language && (
                      <span style={{fontSize:12,color:C.muted,background:'#f9fafb',padding:'3px 10px',borderRadius:999,border:`1px solid ${C.border}`}}>
                        {r.language === 'hindi' ? 'हिंदी' : 'English'}
                      </span>
                    )}
                  </div>

                  {/* Scores */}
                  <div style={{display:'flex',gap:16}}>
                    <div style={{textAlign:'center'}}>
                      <p style={{fontSize:18,fontWeight:800,color:rc.col,margin:0}}>{r.risk_score ?? '-'}</p>
                      <p style={{fontSize:10,color:C.subtle,margin:'2px 0 0',fontWeight:600}}>RISK</p>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <p style={{fontSize:18,fontWeight:800,color:C.greenDk,margin:0}}>{r.health_score ?? '-'}</p>
                      <p style={{fontSize:10,color:C.subtle,margin:'2px 0 0',fontWeight:600}}>HEALTH</p>
                    </div>
                    {r.summary && (
                      <p style={{fontSize:12,color:C.muted,lineHeight:1.5,margin:0,flex:1}}>
                        {r.summary.slice(0,100)}{r.summary.length > 100 ? '…' : ''}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{display:'flex',gap:8,marginTop:4}}>
                    <button onClick={()=>handleOpen(r.id)}
                      style={{flex:1,background:C.green,color:'#fff',border:'none',borderRadius:10,padding:'9px',fontSize:13,fontWeight:600,cursor:'pointer',transition:'background .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.greenMd}
                      onMouseLeave={e=>e.currentTarget.style.background=C.green}>
                      View Report
                    </button>
                    <button onClick={()=>handleDelete(r.id)} disabled={deleting===r.id}
                      style={{background:'#fee2e2',color:'#b91c1c',border:'none',borderRadius:10,padding:'9px 14px',fontSize:13,cursor:'pointer',fontWeight:600,opacity:deleting===r.id?0.6:1}}>
                      {deleting===r.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  // —— core state
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [filename, setFilename] = useState('')
  const [error,    setError]    = useState(null)
  const [language, setLanguage] = useState('english')

  // —— auth state (persisted in localStorage)
  const [user, setUserState]   = useState(() => getUser())
  const [authModal, setAuthModal] = useState(null)  // null | 'login' | 'signup'

  // —— page state: 'home' | 'results' | 'history'
  const [page, setPage] = useState('home')
  // For reopening a historical report
  const [historyResult, setHistoryResult] = useState(null)

  const handleLogin = useCallback((mode) => setAuthModal(mode), [])
  const handleLogout = useCallback(() => {
    logout()
    setUserState(null)
    setPage('home')
    setResult(null)
  }, [])
  const handleAuthSuccess = useCallback((u) => {
    setUserState(u)
    setUser(u)
    setAuthModal(null)
  }, [])

  const handleFile = async (file) => {
    setLoading(true); setError(null); setFilename(file.name); setResult(null)
    try {
      const data = await analyseReport(file, language)
      if (data.error) setError(data.error)
      else {
        setResult(data)
        setPage('results')
        if (data.analysis) saveReport(file.name, language, data.analysis)
      }
    } catch(err) {
      if (!err.response) {
        setError('Cannot connect to the backend. Make sure the FastAPI server is running at http://127.0.0.1:8000 (run: uvicorn main:app --reload)')
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const reset = () => { setResult(null); setHistoryResult(null); setError(null); setFilename(''); setPage('home') }

  const scrollToUpload = () => {
    setPage('home')
    setTimeout(()=>document.getElementById('upload')?.scrollIntoView({behavior:'smooth'}),80)
  }

  // Open a historical report in the Results view
  const openHistoryReport = (full) => {
    // full has { filename, language, analysis: {...} }
    setHistoryResult(full)
    setFilename(full.filename || 'Saved Report')
    setPage('results')
  }

  // Global AI Chatbot state
  const [chatOpen, setChatOpen] = useState(false)

  const activeAnalysis = page === 'results'
    ? (historyResult?.analysis || result?.analysis || null)
    : (result?.analysis || historyResult?.analysis || null)

  const activeFilename = page === 'results'
    ? (filename || historyResult?.filename || '')
    : (filename || historyResult?.filename || '')

  const navProps = {
    language, setLanguage,
    user,
    onUpload: scrollToUpload,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onHistory: () => setPage('history'),
    onOpenChat: () => setChatOpen(true),
  }

  const chatWidget = (
    <>
      {/* Global Floating AI Chat Button */}
      <button
        className="chat-floating-btn"
        onClick={() => setChatOpen(prev => !prev)}
        title="Chat with MediScan AI"
        aria-label="Open Medical AI Chat"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: 999,
          padding: chatOpen ? '10px 16px' : '12px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          cursor: 'pointer',
          fontWeight: 650,
          fontSize: 14,
          zIndex: 150,
          boxShadow: '0 6px 24px rgba(22,163,74,0.45)',
          fontFamily: 'inherit',
        }}
      >
        {chatOpen ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>Close Chat</span>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              {activeAnalysis && (
                <span style={{
                  position: 'absolute', top: -3, right: -4, width: 8, height: 8,
                  borderRadius: '50%', background: '#facc15', border: '1.5px solid #15803d'
                }} />
              )}
            </div>
            <span>Ask MediScan AI</span>
            {activeAnalysis && (
              <span style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 6,
                padding: '1px 6px',
                fontSize: 11,
                fontWeight: 700
              }}>
                Report Synced
              </span>
            )}
          </>
        )}
      </button>

      {/* Global Slide-over Chat Panel */}
      {chatOpen && (
        <ChatPanel
          analysis={activeAnalysis}
          filename={activeFilename}
          language={language}
          onLanguageChange={setLanguage}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  )

  if (loading) return <LoadingScreen filename={filename}/>

  if (page === 'history') return (
    <>
      <Navbar {...navProps}/>
      <HistoryPage onBack={reset} onOpenReport={openHistoryReport}/>
      {authModal && <AuthModal initialMode={authModal} onSuccess={handleAuthSuccess} onClose={()=>setAuthModal(null)}/>}
      {chatWidget}
    </>
  )

  if (page === 'results') {
    const displayData = historyResult
      ? { analysis: historyResult.analysis }
      : result
    return (
      <>
        <Navbar {...navProps}/>
        <Results
          data={displayData}
          filename={filename}
          onReset={reset}
          language={historyResult?.language || language}
          onOpenChat={() => setChatOpen(true)}
        />
        {authModal && <AuthModal initialMode={authModal} onSuccess={handleAuthSuccess} onClose={()=>setAuthModal(null)}/>}
        {chatWidget}
      </>
    )
  }

  return (
    <div style={{background:C.bg}}>
      <Navbar {...navProps}/>
      <Hero onUpload={scrollToUpload}/>
      <Features/>
      <HowItWorks/>
      <TechStack/>
      <Roadmap/>
      <UploadSection onFileSelect={handleFile} loading={loading} error={error}/>
      <Footer onUpload={scrollToUpload}/>
      {authModal && <AuthModal initialMode={authModal} onSuccess={handleAuthSuccess} onClose={()=>setAuthModal(null)}/>}
      {chatWidget}
    </div>
  )
}