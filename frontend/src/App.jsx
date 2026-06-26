import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

// ─── API ────────────────────────────────────────────────────────────────────
const analyseReport = async (file, language = 'english') => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('language', language)
  fd.append('use_vision', 'false')
  const res = await axios.post('http://127.0.0.1:8000/analyse/report', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

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

// ─── NAVBAR ─────────────────────────────────────────────────────────────────
function Navbar({ onUpload, language, setLanguage }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
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
        <div style={{display:'flex',alignItems:'center',gap:10}}>
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
        <div style={{display:'flex',alignItems:'center',gap:36}} className="nav-desktop">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              style={{fontSize:14,color:C.muted,textDecoration:'none',fontWeight:500,transition:'color .2s'}}
              onMouseEnter={e=>e.target.style.color=C.green}
              onMouseLeave={e=>e.target.style.color=C.muted}
            >{l}</a>
          ))}
        </div>

        {/* Right side */}
        <div style={{display:'flex',alignItems:'center',gap:12}} className="nav-desktop">
          <select value={language} onChange={e=>setLanguage(e.target.value)}
            style={{fontSize:13,color:C.muted,border:'none',background:'transparent',cursor:'pointer',outline:'none'}}>
            <option value="english">English</option>
            <option value="hindi">हिंदी</option>
          </select>
          <button onClick={()=>{}} style={{fontSize:14,fontWeight:500,color:C.text,background:'none',border:'none',cursor:'pointer'}}>Log in</button>
          <button onClick={onUpload}
            style={{fontSize:14,fontWeight:600,color:'#fff',background:C.green,border:'none',borderRadius:10,padding:'9px 20px',cursor:'pointer',boxShadow:'0 2px 8px rgba(22,163,74,.25)',transition:'background .2s'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.greenMd}
            onMouseLeave={e=>e.currentTarget.style.background=C.green}
          >Get started</button>
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
          <button onClick={()=>{onUpload();setOpen(false)}}
            style={{background:C.green,color:'#fff',border:'none',borderRadius:10,padding:'11px',fontSize:15,fontWeight:600,cursor:'pointer'}}>
            Get started
          </button>
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

function Results({ data, filename, onReset }) {
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

        {/* ── ROW 5: Disclaimer ── */}
        <div style={{background:C.greenXlt,border:`1px solid ${C.borderGn}`,borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'flex-start',gap:10}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p style={{fontSize:12,color:'#374151',lineHeight:1.65}}>{analysis.disclaimer}</p>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.r-grid-3{grid-template-columns:1fr 1fr!important}}
        @media(max-width:600px){.r-grid-3{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [filename, setFilename] = useState('')
  const [error,    setError]    = useState(null)
  const [language, setLanguage] = useState('english')

  const handleFile = async (file) => {
    setLoading(true); setError(null); setFilename(file.name); setResult(null)
    try {
      const data = await analyseReport(file, language)
      if (data.error) setError(data.error)
      else setResult(data)
    } catch(err) {
      if (!err.response) {
        setError('Cannot connect to the backend. Make sure the FastAPI server is running at http://127.0.0.1:8000 (run: uvicorn main:app --reload)')
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const reset = () => { setResult(null); setError(null); setFilename('') }

  const scrollToUpload = () => {
    setTimeout(()=>document.getElementById('upload')?.scrollIntoView({behavior:'smooth'}),50)
  }

  if (loading) return <LoadingScreen filename={filename}/>
  if (result)  return <>
    <Navbar onUpload={reset} language={language} setLanguage={setLanguage}/>
    <Results data={result} filename={filename} onReset={reset}/>
  </>

  return (
    <div style={{background:C.bg}}>
      <Navbar onUpload={scrollToUpload} language={language} setLanguage={setLanguage}/>
      <Hero onUpload={scrollToUpload}/>
      <Features/>
      <HowItWorks/>
      <TechStack/>
      <Roadmap/>
      <UploadSection onFileSelect={handleFile} loading={loading} error={error}/>
      <Footer onUpload={scrollToUpload}/>
    </div>
  )
}