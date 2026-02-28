import { useState, useEffect, useRef, useCallback } from "react";
// ============================================================================
// CONSTANTS
// ============================================================================
const STRING_COLORS = ["#FF4D6A","#FF9F43","#FFDA44","#26DE81","#45AAF2","#A55EEA"];
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40];
const TRACK_ICONS = {
  guitar: "🎸", bass: "🎸", drum: "🥁", drums: "🥁", percussion: "🥁",
  vocal: "🎤", vocals: "🎤", voice: "🎤", sing: "🎤",
  piano: "🎹", keyboard: "🎹", keys: "🎹", organ: "🎹", synth: "🎹",
  strings: "🎻", violin: "🎻", cello: "🎻",
  default: "🎵",
};
function getTrackIcon(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, icon] of Object.entries(TRACK_ICONS)) {
    if (key !== "default" && lower.includes(key)) return icon;
  }
  return TRACK_ICONS.default;
}
function getTrackColor(index) {
  const palette = ["#45AAF2","#FF4D6A","#26DE81","#FF9F43","#A55EEA","#FFDA44","#FF6B81","#2ED573","#70A1FF","#FFA502"];
  return palette[index % palette.length];
}
const DEMO_SONGS = [
  {
    id: "smoke-on-water", title: "Demo: Smoke on the Water (Riff)", bpm: 112,
    tracks: [
      {
        name: "Lead Guitar", isDrum: false,
        tuning: ["e","B","G","D","A","E"],
        notes: [
          {s:3,f:0,t:0,d:0.4},{s:4,f:0,t:0,d:0.4},{s:3,f:3,t:0.5,d:0.4},{s:4,f:3,t:0.5,d:0.4},
          {s:3,f:5,t:1.0,d:0.8},{s:4,f:5,t:1.0,d:0.8},{s:3,f:0,t:2.0,d:0.4},{s:4,f:0,t:2.0,d:0.4},
          {s:3,f:3,t:2.5,d:0.4},{s:4,f:3,t:2.5,d:0.4},{s:3,f:6,t:3.0,d:0.3},{s:4,f:6,t:3.0,d:0.3},
          {s:3,f:5,t:3.4,d:0.8},{s:4,f:5,t:3.4,d:0.8},{s:3,f:0,t:4.5,d:0.4},{s:4,f:0,t:4.5,d:0.4},
          {s:3,f:3,t:5.0,d:0.4},{s:4,f:3,t:5.0,d:0.4},{s:3,f:5,t:5.5,d:0.8},{s:4,f:5,t:5.5,d:0.8},
          {s:3,f:3,t:6.5,d:0.4},{s:4,f:3,t:6.5,d:0.4},{s:3,f:0,t:7.0,d:1.0},{s:4,f:0,t:7.0,d:1.0},
        ].map(n => ({ string: n.s, fret: n.f, time: n.t, duration: n.d })),
      },
      {
        name: "Rhythm Guitar", isDrum: false,
        tuning: ["e","B","G","D","A","E"],
        notes: [
          {string:4,fret:2,time:0,duration:0.8},{string:5,fret:0,time:0,duration:0.8},
          {string:4,fret:2,time:1.0,duration:0.8},{string:5,fret:0,time:1.0,duration:0.8},
          {string:4,fret:2,time:2.0,duration:0.8},{string:5,fret:0,time:2.0,duration:0.8},
          {string:4,fret:2,time:3.0,duration:1.5},{string:5,fret:0,time:3.0,duration:1.5},
          {string:4,fret:2,time:4.5,duration:0.8},{string:5,fret:0,time:4.5,duration:0.8},
          {string:4,fret:2,time:5.5,duration:0.8},{string:5,fret:0,time:5.5,duration:0.8},
          {string:4,fret:2,time:6.5,duration:1.5},{string:5,fret:0,time:6.5,duration:1.5},
        ],
      },
      {
        name: "Bass", isDrum: false,
        tuning: ["G","D","A","E","",""],
        notes: [
          {string:3,fret:0,time:0,duration:1.0},{string:3,fret:0,time:1.0,duration:1.0},
          {string:3,fret:0,time:2.0,duration:1.0},{string:3,fret:0,time:3.0,duration:1.5},
          {string:3,fret:0,time:4.5,duration:1.0},{string:3,fret:0,time:5.5,duration:1.0},
          {string:3,fret:0,time:6.5,duration:1.5},
        ],
      },
    ],
  },
  {
    id: "melody-demo", title: "Demo: Simple Melody", bpm: 100,
    tracks: [{
      name: "Guitar", isDrum: false,
      tuning: ["e","B","G","D","A","E"],
      notes: [
        {string:0,fret:0,time:0,duration:0.5},{string:0,fret:2,time:0.5,duration:0.5},
        {string:0,fret:3,time:1.0,duration:0.5},{string:1,fret:0,time:1.5,duration:0.5},
        {string:1,fret:1,time:2.0,duration:0.5},{string:0,fret:0,time:2.5,duration:1.0},
        {string:2,fret:0,time:3.5,duration:0.5},{string:2,fret:2,time:4.0,duration:0.5},
        {string:1,fret:3,time:4.5,duration:0.5},{string:0,fret:2,time:5.0,duration:0.5},
        {string:0,fret:0,time:5.5,duration:1.0},{string:2,fret:0,time:6.5,duration:0.5},
        {string:1,fret:0,time:7.0,duration:0.5},{string:0,fret:3,time:7.5,duration:0.5},
        {string:0,fret:2,time:8.0,duration:0.5},{string:0,fret:0,time:8.5,duration:1.5},
      ],
    }],
  },
];
function getActiveSong(song, trackIdx) {
  if (!song.tracks || song.tracks.length === 0) {
    return { ...song, notes: song.notes || [], tuning: song.tuning || ["e","B","G","D","A","E"] };
  }
  const t = song.tracks[Math.min(trackIdx, song.tracks.length - 1)];
  return { ...song, notes: t.notes || [], tuning: t.tuning || ["e","B","G","D","A","E"] };
}
// ============================================================================
// PDF TAB VIEWER COMPONENT
// ============================================================================
function PDFTabViewer({ pdfDoc, fileName }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (pdfDoc) setTotalPages(pdfDoc.numPages);
  }, [pdfDoc]);
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc || !canvasRef.current) return;
    setRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const container = containerRef.current;
      const containerWidth = container ? container.clientWidth - 48 : 700;
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = containerWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: fitScale * zoom });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.error("Render error:", e);
    }
    setRendering(false);
  }, [pdfDoc, zoom]);
  useEffect(() => {
    if (pdfDoc && currentPage >= 1) renderPage(currentPage);
  }, [pdfDoc, currentPage, zoom, renderPage]);
  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => { if (pdfDoc) renderPage(currentPage); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, currentPage, renderPage]);
  if (!pdfDoc) return null;
  const navBtn = (label, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
      background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
      color: disabled ? "#333" : "#fff", fontSize: 16, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
    }}>{label}</button>
  );
  return (
    <div style={{ padding: "16px 20px" }}>
      {/* Title bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>📄 {fileName}</h2>
          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
            Page {currentPage} of {totalPages} · {Math.round(zoom * 100)}% zoom
          </div>
        </div>
      </div>
      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
        marginBottom: 14, flexWrap: "wrap",
      }}>
        {navBtn("⏮", () => setCurrentPage(1), currentPage <= 1)}
        {navBtn("◀", () => setCurrentPage(p => Math.max(1, p - 1)), currentPage <= 1)}
        <div style={{
          padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13, fontWeight: 600, color: "#fff", minWidth: 80, textAlign: "center",
        }}>
          {currentPage} / {totalPages}
        </div>
        {navBtn("▶", () => setCurrentPage(p => Math.min(totalPages, p + 1)), currentPage >= totalPages)}
        {navBtn("⏭", () => setCurrentPage(totalPages), currentPage >= totalPages)}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
        {/* Zoom controls */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span style={{ fontSize: 10, color: "#666", fontWeight: 600, marginRight: 4 }}>ZOOM</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(z => (
            <button key={z} onClick={() => setZoom(z)} style={{
              padding: "3px 7px", borderRadius: 5, border: "none",
              background: zoom === z ? "rgba(69,170,242,0.25)" : "transparent",
              color: zoom === z ? "#45AAF2" : "#555", cursor: "pointer", fontSize: 11,
              fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
            }}>{z}x</button>
          ))}
        </div>
      </div>
      {/* Page thumbnails */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 14,
          scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => setCurrentPage(pg)} style={{
              minWidth: 44, height: 34, borderRadius: 8, border: currentPage === pg ? "2px solid #45AAF2" : "1px solid rgba(255,255,255,0.08)",
              background: currentPage === pg ? "rgba(69,170,242,0.12)" : "rgba(255,255,255,0.03)",
              color: currentPage === pg ? "#45AAF2" : "#666", cursor: "pointer",
              fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.15s", flexShrink: 0,
            }}>{pg}</button>
          ))}
        </div>
      )}
      {/* Canvas display */}
      <div ref={containerRef} style={{
        borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)",
        background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: 24, minHeight: 400, position: "relative",
      }}>
        {rendering && (
          <div style={{
            position: "absolute", top: 12, right: 12, padding: "6px 12px", borderRadius: 8,
            background: "rgba(0,0,0,0.7)", color: "#45AAF2", fontSize: 11, fontWeight: 600,
            backdropFilter: "blur(4px)", zIndex: 10,
          }}>Rendering...</div>
        )}
        <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%" }} />
      </div>
      {/* Keyboard shortcuts hint */}
      <div style={{
        marginTop: 12, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
      }}>
        {[
          { key: "← →", label: "Navigate pages" },
          { key: "Zoom", label: "Resize tab view" },
        ].map(({ key, label }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "#888",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            }}>{key}</span>
            <span style={{ fontSize: 11, color: "#555" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TabFlow() {
  const [song, setSong] = useState(DEMO_SONGS[0]);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [currentView, setCurrentView] = useState("player");
  const [hitNotes, setHitNotes] = useState(new Set());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [library, setLibrary] = useState([...DEMO_SONGS]);
  const [trackPanelOpen, setTrackPanelOpen] = useState(false);
  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfLibrary, setPdfLibrary] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const active = getActiveSong(song, activeTrackIdx);
  const PPS = 200, HIT_X = 160, STR_SP = 36, TOP_M = 60;
  // Load pdf.js library
  useEffect(() => {
    if (window.pdfjsLib) { setPdfjsLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfjsLoaded(true);
    };
    document.head.appendChild(script);
  }, []);
  // Keyboard navigation for PDF
  useEffect(() => {
    if (currentView !== "pdf-viewer") return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") e.preventDefault();
      if (e.key === "ArrowRight") e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentView]);
  const handlePdfUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please upload a PDF file.");
      return;
    }
    if (!pdfjsLoaded || !window.pdfjsLib) {
      setPdfError("PDF library is still loading. Please try again in a moment.");
      return;
    }
    setPdfLoading(true);
    setPdfError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setPdfFileName(file.name);
      setPdfLibrary(prev => {
        const exists = prev.find(p => p.name === file.name);
        if (exists) return prev;
        return [...prev, { name: file.name, pages: doc.numPages, data: arrayBuffer }];
      });
      setCurrentView("pdf-viewer");
    } catch (e) {
      console.error("PDF load error:", e);
      setPdfError("Failed to load PDF. Make sure it's a valid PDF file.");
    }
    setPdfLoading(false);
  };
  const loadPdfFromLibrary = async (item) => {
    if (!window.pdfjsLib) return;
    try {
      const doc = await window.pdfjsLib.getDocument({ data: item.data }).promise;
      setPdfDoc(doc);
      setPdfFileName(item.name);
      setCurrentView("pdf-viewer");
    } catch (e) {
      setPdfError("Failed to reload PDF.");
    }
  };
  const playNote = useCallback((midi) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current; const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.6);
  }, []);
  const render = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); const W = canvas.width, H = canvas.height;
    const bg = ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#08081a"); bg.addColorStop(1,"#10102a");
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
    const tuning = active.tuning || ["e","B","G","D","A","E"];
    for (let i=0;i<6;i++) {
      const y = TOP_M + i*STR_SP;
      ctx.strokeStyle = STRING_COLORS[i]+"28"; ctx.lineWidth = i<3?1.5:2;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
      ctx.fillStyle = STRING_COLORS[i]+"70"; ctx.font = "bold 11px 'JetBrains Mono',monospace";
      ctx.textAlign = "left"; ctx.fillText(tuning[i]||"",8,y+4);
    }
    const hg = ctx.createLinearGradient(HIT_X,TOP_M-20,HIT_X,TOP_M+5*STR_SP+20);
    hg.addColorStop(0,"rgba(255,255,255,0)");hg.addColorStop(0.3,"rgba(255,255,255,0.85)");
    hg.addColorStop(0.7,"rgba(255,255,255,0.85)");hg.addColorStop(1,"rgba(255,255,255,0)");
    ctx.strokeStyle = hg; ctx.lineWidth = 2.5;
    ctx.beginPath();ctx.moveTo(HIT_X,TOP_M-20);ctx.lineTo(HIT_X,TOP_M+5*STR_SP+20);ctx.stroke();
    ctx.shadowColor = "rgba(255,255,255,0.3)"; ctx.shadowBlur = 15;
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
    ctx.beginPath();ctx.moveTo(HIT_X,TOP_M-20);ctx.lineTo(HIT_X,TOP_M+5*STR_SP+20);ctx.stroke();
    ctx.shadowBlur = 0;
    active.notes.forEach((note,idx) => {
      const nx = HIT_X + (note.time - currentTime)*PPS*speed;
      const ny = TOP_M + note.string*STR_SP;
      const nw = Math.max(note.duration*PPS*speed, 28);
      if (nx+nw<-50||nx>W+50) return;
      const isHit = hitNotes.has(idx);
      const near = Math.abs(nx-HIT_X)<30;
      const past = nx < HIT_X;
      const col = STRING_COLORS[note.string]||"#fff";
      if (nw>33){ctx.fillStyle=isHit?col+"35":past?col+"10":col+"20";ctx.beginPath();ctx.roundRect(nx,ny-12,nw,24,6);ctx.fill();}
      const rad = near?17:15;
      ctx.beginPath();ctx.arc(nx,ny,rad,0,Math.PI*2);
      if(isHit){ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=22;}
      else if(past){ctx.fillStyle="#2a2a3a";ctx.shadowBlur=0;}
      else{ctx.fillStyle=col+"CC";ctx.shadowColor=col;ctx.shadowBlur=near?14:6;}
      ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle=isHit?"#fff":past?"#444":col;ctx.lineWidth=near?2.5:1.5;ctx.stroke();
      ctx.fillStyle=isHit||!past?"#fff":"#666";
      ctx.font=`bold ${near?14:12}px 'JetBrains Mono',monospace`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(note.fret.toString(),nx,ny);
    });
    const total = active.notes.length>0?Math.max(...active.notes.map(n=>n.time+n.duration)):1;
    const prog = Math.min(currentTime/total,1);
    ctx.fillStyle="#111";ctx.fillRect(0,H-5,W,5);
    const pg = ctx.createLinearGradient(0,0,W*prog,0);pg.addColorStop(0,"#FF4D6A");pg.addColorStop(1,"#45AAF2");
    ctx.fillStyle=pg;ctx.fillRect(0,H-5,W*prog,5);
  }, [active, currentTime, speed, hitNotes]);
  useEffect(() => {
    if (!isPlaying) return; let running = true; lastTimeRef.current = performance.now();
    const loop = now => {
      if (!running) return; const dt = (now - lastTimeRef.current)/1000; lastTimeRef.current = now;
      setCurrentTime(prev => {
        const next = prev + dt*speed;
        const total = active.notes.length>0?Math.max(...active.notes.map(n=>n.time+n.duration)):0;
        if (next >= total+2){setIsPlaying(false);return 0;} return next;
      });
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [isPlaying, speed, active]);
  useEffect(() => {
    active.notes.forEach((note,idx) => {
      const nx = HIT_X + (note.time - currentTime)*PPS*speed;
      if (nx<=HIT_X&&nx>HIT_X-18&&!hitNotes.has(idx)){
        setHitNotes(p=>new Set(p).add(idx)); setScore(s=>s+100);
        setStreak(s=>{const ns=s+1;setMaxStreak(m=>Math.max(m,ns));return ns;});
        playNote(note.midi||OPEN_STRING_MIDI[note.string]+note.fret);
      }
    });
  }, [currentTime, active, speed, hitNotes, playNote]);
  useEffect(()=>{render();},[render]);
  useEffect(()=>{
    const resize=()=>{const c=canvasRef.current;if(!c)return;c.width=c.parentElement.clientWidth;c.height=300;render();};
    resize();window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);
  },[render]);
  const resetPlay = () => {setCurrentTime(0);setHitNotes(new Set());setScore(0);setStreak(0);setMaxStreak(0);};
  const handlePlay = () => {if(!isPlaying)resetPlay();setIsPlaying(!isPlaying);};
  const loadSong = s => {setSong(s);setActiveTrackIdx(0);resetPlay();setCurrentView("player");};
  const switchTrack = idx => {
    setActiveTrackIdx(idx);
    setIsPlaying(false);
    resetPlay();
  };
  const accuracy = active.notes.length>0?Math.round((hitNotes.size/active.notes.length)*100):0;
  const hasTracks = song.tracks && song.tracks.length > 1;
  const currentTrack = song.tracks?.[activeTrackIdx];
  const btnStyle = act => ({padding:"8px 16px",borderRadius:8,border:"none",background:act?"rgba(255,255,255,0.12)":"transparent",color:act?"#fff":"#777",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",textTransform:"capitalize",transition:"all 0.2s"});
  const viewTabs = [
    { id: "player", label: "Player" },
    { id: "upload", label: "Upload PDF" },
    { id: "library", label: "Library" },
  ];
  if (pdfDoc) viewTabs.splice(2, 0, { id: "pdf-viewer", label: "📄 Tab Viewer" });
  return (
    <div style={{fontFamily:"'Outfit',sans-serif",background:"linear-gradient(135deg,#08081a 0%,#1a1030 50%,#08081a 100%)",minHeight:"100vh",color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      {/* Header */}
      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.3)",backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#FF4D6A,#45AAF2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🎸</div>
          <div>
            <div style={{fontWeight:700,fontSize:17,letterSpacing:"-0.5px"}}>TabFlow</div>
            <div style={{fontSize:9,color:"#666",letterSpacing:1.5,textTransform:"uppercase"}}>Interactive Tab Player</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
          {viewTabs.map(v => (
            <button key={v.id} onClick={()=>setCurrentView(v.id)} style={btnStyle(currentView===v.id)}>{v.label}</button>
          ))}
        </div>
      </div>
      {/* ===== PLAYER ===== */}
      {currentView === "player" && (
        <div style={{padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:12}}>
            <div>
              <h2 style={{margin:0,fontSize:20,fontWeight:700,letterSpacing:"-0.5px"}}>{song.title}</h2>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4,flexWrap:"wrap"}}>
                {currentTrack && <span style={{fontSize:12,color:"#aaa",fontWeight:500}}>{getTrackIcon(currentTrack.name)} {currentTrack.name}</span>}
                <span style={{fontSize:12,color:"#555"}}>·</span>
                <span style={{fontSize:12,color:"#888"}}>{active.notes.length} notes</span>
                <span style={{fontSize:12,color:"#555"}}>·</span>
                <span style={{fontSize:12,color:"#888"}}>{song.bpm} BPM</span>
              </div>
            </div>
            <div style={{display:"flex",gap:18}}>
              {[{v:score,c:"#FF4D6A",l:"Score"},{v:streak+"x",c:"#FFDA44",l:"Streak"},{v:accuracy+"%",c:"#26DE81",l:"Accuracy"}].map(({v,c,l})=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:700,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                  <div style={{fontSize:9,color:"#666",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Track Selector Bar */}
          {hasTracks && (
            <div style={{marginBottom:12}}>
              <button onClick={()=>setTrackPanelOpen(!trackPanelOpen)} style={{
                width:"100%",padding:"10px 16px",borderRadius:trackPanelOpen?"12px 12px 0 0":12,
                border:"1px solid rgba(255,255,255,0.08)",borderBottom:trackPanelOpen?"1px solid rgba(255,255,255,0.04)":"1px solid rgba(255,255,255,0.08)",
                background:"rgba(255,255,255,0.03)",cursor:"pointer",display:"flex",alignItems:"center",
                justifyContent:"space-between",color:"#fff",fontFamily:"inherit",textAlign:"left",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:10,color:"#666",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>TRACK</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:getTrackColor(activeTrackIdx)}} />
                    <span style={{fontSize:13,fontWeight:600}}>{getTrackIcon(currentTrack?.name)} {currentTrack?.name}</span>
                    <span style={{fontSize:11,color:"#666"}}>{currentTrack?.notes?.length || currentTrack?.noteCount || 0} notes</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:"#555"}}>{song.tracks.length} tracks</span>
                  <span style={{fontSize:14,color:"#555",transition:"transform 0.2s",transform:trackPanelOpen?"rotate(180deg)":"rotate(0)"}}> ▾</span>
                </div>
              </button>
              {trackPanelOpen && (
                <div style={{
                  border:"1px solid rgba(255,255,255,0.08)",borderTop:"none",
                  borderRadius:"0 0 12px 12px",background:"rgba(0,0,0,0.25)",overflow:"hidden",
                }}>
                  {song.tracks.map((trk, idx) => {
                    const isActive = idx === activeTrackIdx;
                    const isEmpty = (trk.notes?.length || trk.noteCount || 0) === 0;
                    const col = getTrackColor(idx);
                    return (
                      <button key={idx} onClick={()=>{if(!isEmpty){switchTrack(idx);setTrackPanelOpen(false);}}} style={{
                        width:"100%",padding:"10px 16px",border:"none",
                        borderLeft:isActive?`3px solid ${col}`:"3px solid transparent",
                        background:isActive?"rgba(255,255,255,0.06)":"transparent",
                        cursor:isEmpty?"not-allowed":"pointer",
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        color:isEmpty?"#444":"#fff",fontFamily:"inherit",textAlign:"left",
                        opacity:isEmpty?0.4:1,transition:"all 0.15s",
                      }}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:18,width:28,textAlign:"center"}}>{getTrackIcon(trk.name)}</span>
                          <div>
                            <div style={{fontSize:13,fontWeight:isActive?700:500}}>{trk.name}</div>
                            <div style={{fontSize:11,color:isEmpty?"#444":"#666",marginTop:1}}>
                              {isEmpty ? "No notes" : `${trk.notes?.length || trk.noteCount} notes`}
                              {trk.isDrum && " · Drums"}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          {trk.tuning && !trk.isDrum && (
                            <span style={{fontSize:10,color:"#555",fontFamily:"'JetBrains Mono',monospace"}}>
                              {trk.tuning.filter(Boolean).slice(0,6).join(" ")}
                            </span>
                          )}
                          {isActive && <div style={{width:6,height:6,borderRadius:"50%",background:col}} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* Canvas */}
          <div style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",background:"#08081a",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
            <canvas ref={canvasRef} style={{display:"block",width:"100%"}} />
          </div>
          {/* Controls */}
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{setIsPlaying(false);resetPlay();}} style={{width:42,height:42,borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>⏮</button>
            <button onClick={handlePlay} style={{
              width:52,height:52,borderRadius:14,border:"none",
              background:isPlaying?"linear-gradient(135deg,#FF4D6A,#FF9F43)":"linear-gradient(135deg,#45AAF2,#26DE81)",
              color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:isPlaying?"0 4px 20px rgba(255,77,106,0.35)":"0 4px 20px rgba(69,170,242,0.35)",transition:"all 0.3s",
            }}>{isPlaying?"⏸":"▶"}</button>
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontSize:10,color:"#666",fontWeight:600}}>SPEED</span>
              {[0.25,0.5,0.75,1.0,1.25,1.5].map(s=>(
                <button key={s} onClick={()=>setSpeed(s)} style={{padding:"3px 8px",borderRadius:5,border:"none",background:speed===s?"rgba(69,170,242,0.25)":"transparent",color:speed===s?"#45AAF2":"#555",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{s}x</button>
              ))}
            </div>
          </div>
          {/* String legend */}
          <div style={{marginTop:12,display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            {(active.tuning||[]).map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:STRING_COLORS[i]}} />
                <span style={{fontSize:11,color:"#666",fontFamily:"'JetBrains Mono',monospace"}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ===== UPLOAD PDF ===== */}
      {currentView === "upload" && (
        <div style={{padding:"20px",maxWidth:680,margin:"0 auto"}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:2}}>Upload PDF Tabs</h2>
          <p style={{color:"#777",fontSize:13,marginBottom:20}}>Upload your sheet music or guitar tab PDFs to view them interactively with page navigation and zoom.</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            <div style={{padding:"6px 12px",borderRadius:8,background:"#FF4D6A12",border:"1px solid #FF4D6A25",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#FF4D6A"}}>.pdf</span>
              <span style={{fontSize:11,color:"#888"}}>PDF Document</span>
            </div>
          </div>
          <div
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);if(e.dataTransfer.files[0])handlePdfUpload(e.dataTransfer.files[0]);}}
            style={{
              border:dragOver?"2px solid #45AAF2":"2px dashed rgba(255,255,255,0.12)",borderRadius:14,
              padding:"48px 24px",textAlign:"center",marginBottom:16,
              background:dragOver?"rgba(69,170,242,0.06)":"rgba(255,255,255,0.02)",
              cursor:"pointer",position:"relative",transition:"all 0.2s",
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={e=>e.target.files[0]&&handlePdfUpload(e.target.files[0])}
              style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}}
            />
            <div style={{fontSize:48,marginBottom:12}}>📄</div>
            <div style={{fontWeight:600,fontSize:16}}>Drop a PDF tab file here</div>
            <div style={{color:"#666",fontSize:13,marginTop:6}}>or click to browse</div>
            <div style={{color:"#555",fontSize:11,marginTop:10,fontFamily:"'JetBrains Mono',monospace"}}>.pdf</div>
          </div>
          {pdfLoading && (
            <div style={{
              padding:"14px 18px",borderRadius:10,marginBottom:16,
              background:"rgba(69,170,242,0.08)",border:"1px solid rgba(69,170,242,0.15)",
              fontSize:13,color:"#45AAF2",display:"flex",alignItems:"center",gap:10,
            }}>
              <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>
              Loading PDF...
            </div>
          )}
          {pdfError && (
            <div style={{
              padding:"14px 18px",borderRadius:10,marginBottom:16,
              background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.15)",
              fontSize:13,color:"#FF4D6A",
            }}>{pdfError}</div>
          )}
          {!pdfjsLoaded && (
            <div style={{
              padding:"14px 18px",borderRadius:10,marginBottom:16,
              background:"rgba(255,218,68,0.08)",border:"1px solid rgba(255,218,68,0.15)",
              fontSize:13,color:"#FFDA44",
            }}>Loading PDF viewer engine...</div>
          )}
          {/* Previously uploaded PDFs */}
          {pdfLibrary.length > 0 && (
            <div style={{marginTop:24}}>
              <div style={{fontSize:11,color:"#666",marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Previously Loaded</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {pdfLibrary.map((item, idx) => (
                  <button key={idx} onClick={() => loadPdfFromLibrary(item)} style={{
                    padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",
                    background:"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"space-between",color:"#fff",
                    fontFamily:"inherit",textAlign:"left",transition:"all 0.2s",
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>📄</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                        <div style={{fontSize:11,color:"#666",marginTop:2}}>{item.pages} pages</div>
                      </div>
                    </div>
                    <div style={{color:"#45AAF2",fontSize:11,fontWeight:600}}>VIEW →</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ===== PDF TAB VIEWER ===== */}
      {currentView === "pdf-viewer" && (
        <PDFTabViewer pdfDoc={pdfDoc} fileName={pdfFileName} />
      )}
      {/* ===== LIBRARY ===== */}
      {currentView === "library" && (
        <div style={{padding:"20px",maxWidth:680,margin:"0 auto"}}>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:2}}>Song Library</h2>
          <p style={{color:"#777",fontSize:13,marginBottom:20}}>{library.length} demo songs · {pdfLibrary.length} PDF tabs loaded</p>
          {/* PDF tabs section */}
          {pdfLibrary.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,color:"#FF4D6A",marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>PDF Tabs</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {pdfLibrary.map((item, idx) => (
                  <button key={`pdf-${idx}`} onClick={() => loadPdfFromLibrary(item)} style={{
                    padding:"14px 18px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",
                    background:"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"space-between",color:"#fff",
                    fontFamily:"inherit",textAlign:"left",transition:"all 0.2s",
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>📄</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{item.name}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3}}>
                          <span style={{color:"#777",fontSize:11}}>{item.pages} pages</span>
                          <span style={{display:"inline-block",padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:"#FF4D6A18",color:"#FF4D6A",fontFamily:"'JetBrains Mono',monospace",border:"1px solid #FF4D6A30"}}>PDF</span>
                        </div>
                      </div>
                    </div>
                    <div style={{color:"#45AAF2",fontSize:11,fontWeight:600}}>VIEW →</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Demo songs section */}
          <div style={{fontSize:11,color:"#45AAF2",marginBottom:10,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Demo Songs</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {library.map((s,idx) => {
              const trackCount = s.tracks?.length || 1;
              const totalNotes = s.tracks ? s.tracks.reduce((a,t)=>a+(t.notes?.length||t.noteCount||0),0) : (s.notes?.length||0);
              return (
                <button key={s.id||idx} onClick={()=>loadSong(s)} style={{
                  padding:"14px 18px",borderRadius:10,
                  border:song.id===s.id?"2px solid #45AAF2":"1px solid rgba(255,255,255,0.06)",
                  background:song.id===s.id?"rgba(69,170,242,0.06)":"rgba(255,255,255,0.02)",
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
                  color:"#fff",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s",
                }}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{s.title}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3,flexWrap:"wrap"}}>
                      <span style={{color:"#777",fontSize:11}}>{totalNotes} notes · {s.bpm} BPM</span>
                      {trackCount > 1 && (
                        <span style={{fontSize:11,color:"#A55EEA",fontWeight:600}}>{trackCount} tracks</span>
                      )}
                      {s.tracks && (
                        <span style={{fontSize:10,color:"#555"}}>
                          {s.tracks.filter(t=>(t.notes?.length||t.noteCount||0)>0).map(t=>getTrackIcon(t.name)).join(" ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{color:"#45AAF2",fontSize:11,fontWeight:600}}>PLAY →</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}