// ===== Pensum (definido en js/pensum.js) =====
for(const k in P.cursos){const c=P.cursos[k];c.nombre=(c.nombre||"").trim()||"Curso "+c.codigo+" (sin nombre)";c.creditos=c.creditos||0}

// ===== Persistencia local =====
const KEY="panel-academico-v1";
const VIEW_KEY="panel-academico-view-v1",THEME_KEY="panel-academico-theme-v1";
function getPreference(key){try{return localStorage.getItem(key)}catch(e){return null}}
function setPreference(key,value){try{localStorage.setItem(key,value)}catch(e){}}
const savedTheme=getPreference(THEME_KEY);
if(savedTheme==="light"||savedTheme==="dark")document.documentElement.dataset.theme=savedTheme;
const blank=()=>({c:{},ev:[],pr:[],nt:[],ho:[]});
let S=blank();
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(blank(),JSON.parse(r))}catch(e){}
function mig(){const u=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);S.pr.forEach(p=>{if(!p.id)p.id=u()});S.ev.forEach(e=>{if(!e.id)e.id=u()})}
mig();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}render()}

// ===== Lógica académica =====
const C=P.cursos,codes=Object.keys(C),META_CREDITOS=300;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fd=d=>d?d.split("-").reverse().join("/"):"";
const pre=c=>(c.prerequisitos||[]).filter(x=>x&&C[x]);
const post=c=>[...new Set([...(c.postrequisitos||[]).filter(x=>x&&C[x]),...codes.filter(k=>pre(C[k]).includes(c.codigo))])];
const unk=c=>(c.prerequisitos||[]).filter(x=>x&&!C[x]);
const falt=k=>pre(C[k]).filter(x=>S.c[x]?.e!=="APROBADO");
const st=k=>S.c[k]?.e||(falt(k).length?"BLOQUEADO":"DISPONIBLE");
const acc=k=>{const e=S.c[k]?.ev||[];return{p:e.reduce((a,x)=>a+x.p,0),m:e.reduce((a,x)=>a+x.m,0)}};
function stats(){const by=s=>codes.filter(k=>st(k)===s);const ap=by("APROBADO"),cu=by("CURSANDO"),di=by("DISPONIBLE"),bl=by("BLOQUEADO");
const ob=ap.reduce((a,k)=>a+C[k].creditos,0);
const ns=ap.map(k=>S.c[k].n).filter(n=>typeof n==="number");
return{ap,cu,di,bl,meta:META_CREDITOS,restantes:Math.max(0,META_CREDITOS-ob),ob,pct:Math.min(100,ob/META_CREDITOS*100),avg:ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:null}}
// ===== Iconos (trazo fino, 1.75px) =====
const ico=(d,z=16)=>`<svg class="ic" width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I={
dash:ico('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',18),
book:ico('<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',18),
cap:ico('<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',18),
cal:ico('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',18),
clock:ico('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',18),
folder:ico('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',18),
note:ico('<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>',18),
cfg:ico('<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',18),
x:ico('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
pen:ico('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>'),
l:ico('<path d="m15 18-6-6 6-6"/>'),
r:ico('<path d="m9 18 6-6-6-6"/>'),
up:ico('<path d="m18 15-6-6-6 6"/>'),
dn:ico('<path d="m6 9 6 6 6-6"/>'),
ok:ico('<path d="M20 6 9 17l-5-5"/>',14),
no:ico('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',14),
chev:ico('<path d="m9 18 6-6-6-6"/>',14)};
const IC={
APROBADO:ico('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
CURSANDO:ico('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
DISPONIBLE:ico('<circle cx="12" cy="12" r="10"/>'),
BLOQUEADO:ico('<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>')};
const badge=s=>`<span class="b ${s}">${s}</span>`;
const crow=k=>`<div class="row" onclick="openC='${k}';render()"><span class="si">${IC[st(k)]}</span><span class="sp">${esc(C[k].nombre)} <span class="s">· ${k} · ${C[k].creditos} cr</span></span>${badge(st(k))}</div>`;
const empty=t=>`<div class="em">${t}</div>`;

// ===== Acciones =====
let view="dashboard",openC=null,openD=null,fil="TODOS",editN=-1,menuOpen=false,calY=new Date().getFullYear(),calM=new Date().getMonth();
function toggleMenu(){menuOpen=!menuOpen;render()}
function closeMenu(){if(menuOpen){menuOpen=false;render()}}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
function setE(k,e){S.c[k]=S.c[k]||{};if(e)S.c[k].e=e;else delete S.c[k].e;if(e!=="APROBADO"){delete S.c[k].n;delete S.c[k].sa}save()}
function saveApr(k){const n=parseFloat($("nf").value);S.c[k]=Object.assign(S.c[k]||{},{e:"APROBADO"});
if(!isNaN(n))S.c[k].n=n;else delete S.c[k].n;S.c[k].sa=$("sa").value;save()}
function addEv(k){const n=$("en").value.trim(),p=parseFloat($("ep").value),m=parseFloat($("em").value);
if(!n||isNaN(p)||isNaN(m)||m<=0)return alert("Completa nombre, puntos obtenidos y puntos máximos (mayor que 0).");
(S.c[k].ev=S.c[k].ev||[]).push({n,p,m});save()}
function delEv(k,i){S.c[k].ev.splice(i,1);save()}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const TIPOS=["Entrega de proyecto","Parcial","Examen","Entrega de tareas","Evento libre"];
const TC={"Examen":"var(--e1)","Parcial":"var(--e2)","Entrega de proyecto":"var(--e3)","Entrega de tareas":"var(--e4)","Evento libre":"var(--e5)"};
const col=t=>TC[t]||"var(--mu)";
const MES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],DOW=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const iso=(y,m,d)=>y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
const today=()=>{const n=new Date();return iso(n.getFullYear(),n.getMonth(),n.getDate())};
const byH=(a,b)=>(a.h||"").localeCompare(b.h||"");
function navM(n){const d=new Date(calY,calM+n,1);calY=d.getFullYear();calM=d.getMonth();render()}
function goT(){const n=new Date();calY=n.getFullYear();calM=n.getMonth();render()}
function syncP(p){const e=S.ev.find(x=>x.pid===p.id);
if(p.d){if(e){e.d=p.d;e.t=p.n;e.k=p.k||""}else S.ev.push({id:uid(),t:p.n,d:p.d,h:"",tipo:"Entrega de proyecto",k:p.k||"",ok:false,pid:p.id})}
else if(e)S.ev=S.ev.filter(x=>x!==e)}
function addEvD(){const t=$("evt").value.trim(),tipo=$("evy").value;if(!t)return alert("Escribe un título para el evento.");
const o={id:uid(),t,d:openD,h:$("evh").value,tipo,k:$("evk").value,ok:false};
if(tipo==="Entrega de proyecto"){const sel=$("evp").value;let p;
if(sel==="new"){p={id:uid(),n:t,k:o.k,d:openD,t:[]};S.pr.push(p)}else{p=S.pr.find(x=>x.id===sel);p.d=openD;o.t=p.n}
S.ev=S.ev.filter(e=>e.pid!==p.id);o.pid=p.id;if(!o.k)o.k=p.k||""}
S.ev.push(o);save()}
function delE(id){const e=S.ev.find(x=>x.id===id);if(!e)return;S.ev=S.ev.filter(x=>x!==e);
if(e.pid){const p=S.pr.find(x=>x.id===e.pid);if(p)p.d=""}save()}
function tp(){$("evpw").style.display=$("evy").value==="Entrega de proyecto"?"flex":"none"}
function addPr(){const n=$("pn").value.trim();if(!n)return alert("Escribe el nombre del proyecto.");
const p={id:uid(),n,k:$("pc").value,d:$("pd").value,t:[]};S.pr.push(p);syncP(p);save()}
function setPd(id,v){const p=S.pr.find(x=>x.id===id);p.d=v;syncP(p);save()}
function delP(id){if(confirm("¿Eliminar proyecto y su evento del calendario?")){S.pr=S.pr.filter(p=>p.id!==id);S.ev=S.ev.filter(e=>e.pid!==id);save()}}
function addT(i){const v=$("t"+i).value.trim();if(v){S.pr[i].t.push({x:v,ok:false});save()}}
function saveNote(){const t=$("nt").value.trim();if(!t)return alert("La nota necesita un título.");
const now=new Date().toISOString().slice(0,10),o={t,c:$("nc").value,b:$("nb").value};
if(editN>=0)Object.assign(S.nt[editN],o,{m:now});else S.nt.unshift(Object.assign(o,{f:now,m:now}));editN=-1;save()}
function exp(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download="mis-datos-universidad.json";a.click()}
function imp(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);
if(!o||typeof o.c!=="object"||!Array.isArray(o.ev)||!Array.isArray(o.pr)||!Array.isArray(o.nt))throw 0;
if(confirm("Esto reemplazará tus datos actuales. ¿Continuar?")){S=o;mig();save()}}catch(e){alert("El archivo no es un respaldo válido.")}};r.readAsText(f)}
function reset(){if(confirm("¿Borrar TODOS tus datos personales de este navegador? No se puede deshacer.")){S=blank();save()}}
function theme(){const r=document.documentElement;r.dataset.theme=r.dataset.theme==="dark"?"light":"dark";setPreference(THEME_KEY,r.dataset.theme)}

// ===== Horario semanal =====
const DIAS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const H0=6,H1=22,ROWH=52;
const timeToHour=t=>{const[hh,mm]=t.split(":").map(Number);return hh+mm/60};
const timeToY=t=>(timeToHour(t)-H0)*ROWH;
let toastMsg=null,toastT=null;
function toast(m){toastMsg=m;render();clearTimeout(toastT);toastT=setTimeout(()=>{toastMsg=null;render()},3500)}
let detOpen=new Set(),hoSel={},hoSelK=null;
function togDet(k){detOpen.has(k)?detOpen.delete(k):detOpen.add(k);render()}
function saveDet(k){S.c[k]=S.c[k]||{};S.c[k].detalles=$("det_"+k).value;save()}
function detPanel(k){const d=S.c[k]||{};
return`<div class="c hoPanel"><h3>Detalles de ${esc(C[k].nombre)}</h3>
<textarea id="det_${k}" placeholder="Notas, horario, profesor, salón, etc.">${esc(d.detalles||"")}</textarea>
<div class="f" style="margin-top:10px"><button class="p" onclick="saveDet('${k}')">Guardar</button></div></div>`}
function togDay(k,i){const s=hoSel[k]||(hoSel[k]=new Set());s.has(i)?s.delete(i):s.add(i);render()}
function addHorario(){const k=$("hoCur").value;if(!k)return alert("Selecciona un curso.");
const tipo=$("hoTip").value,hi=$("hoHi").value,hf=$("hoHf").value;
if(!hi||!hf)return alert("Completa la hora de inicio y la hora de fin.");
if(hi>=hf)return alert("La hora de fin debe ser mayor que la hora de inicio.");
const dias=[...(hoSel[k]||[])];
if(!dias.length)return alert("Selecciona al menos un día de la semana.");
const conf=S.ho.filter(x=>x.dias.some(d=>dias.includes(d))&&x.hi<hf&&hi<x.hf);
S.ho.push({id:uid(),k,tipo,dias,hi,hf});hoSel[k]=new Set();save();
if(conf.length){const dd=[...new Set(conf.flatMap(x=>x.dias.filter(d=>dias.includes(d))))].map(d=>DIAS[d]);
toast(`Se traslapa ${dd.join(", ")} ${hi}-${hf} con ${conf.map(x=>esc(C[x.k]?.nombre||"?")).join(", ")}`)}}
function delHorario(id){S.ho=S.ho.filter(x=>x.id!==id);save()}
function layoutDay(evs){const sorted=[...evs].sort((a,b)=>a.hi.localeCompare(b.hi));
let laneEnds=[],cluster=[],clusterEnd=null;const out=[];
const flush=()=>{if(!cluster.length)return;const lanes=Math.max(...cluster.map(c=>c.lane))+1;cluster.forEach(c=>out.push({ev:c.ev,lane:c.lane,lanes}));cluster=[];laneEnds=[];clusterEnd=null};
for(const ev of sorted){if(clusterEnd!==null&&ev.hi>=clusterEnd)flush();
let lane=laneEnds.findIndex(e=>e<=ev.hi);
if(lane===-1){lane=laneEnds.length;laneEnds.push(ev.hf)}else laneEnds[lane]=ev.hf;
cluster.push({ev,lane});clusterEnd=clusterEnd===null||ev.hf>clusterEnd?ev.hf:clusterEnd}
flush();return out}
function downloadHorario(){
const scale=2,gutter=72,dayWidth=220,headerH=44,gridH=(H1-H0)*ROWH;
const canvas=document.createElement("canvas");
canvas.width=(gutter+dayWidth*DIAS.length)*scale;canvas.height=(headerH+gridH)*scale;
const ctx=canvas.getContext("2d");
if(!ctx){alert("No se pudo generar la imagen del horario en este navegador.");return}
ctx.scale(scale,scale);
const grid=document.querySelector(".hoGrid"),style=getComputedStyle(grid);
const bg=style.getPropertyValue("--card").trim()||getComputedStyle(document.documentElement).getPropertyValue("--card").trim();
const fg=style.getPropertyValue("--tx").trim()||getComputedStyle(document.documentElement).getPropertyValue("--tx").trim();
const muted=style.getPropertyValue("--mu").trim()||getComputedStyle(document.documentElement).getPropertyValue("--mu").trim();
const border=style.getPropertyValue("--bd").trim()||getComputedStyle(document.documentElement).getPropertyValue("--bd").trim();
const accent=style.getPropertyValue("--ac").trim()||getComputedStyle(document.documentElement).getPropertyValue("--ac").trim();
const lab=style.getPropertyValue("--lab").trim()||getComputedStyle(document.documentElement).getPropertyValue("--lab").trim();
ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width/scale,canvas.height/scale);
ctx.font="500 13px Geist, Inter, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
DIAS.forEach((day,i)=>{const x=gutter+i*dayWidth;ctx.fillStyle=muted;ctx.fillText(day,x+dayWidth/2,headerH/2);ctx.strokeStyle=border;ctx.beginPath();ctx.moveTo(x,headerH);ctx.lineTo(x,headerH+gridH);ctx.stroke()});
ctx.textAlign="right";ctx.font="11px 'Geist Mono', monospace";
for(let i=0;i<H1-H0;i++){const y=headerH+i*ROWH;ctx.fillStyle=muted;ctx.fillText(`${String(H0+i).padStart(2,"0")}:00`,gutter-8,y+12);ctx.strokeStyle=border;ctx.beginPath();ctx.moveTo(gutter,y);ctx.lineTo(gutter+dayWidth*DIAS.length,y);ctx.stroke()}
ctx.strokeStyle=border;ctx.beginPath();ctx.moveTo(gutter,headerH+gridH);ctx.lineTo(gutter+dayWidth*DIAS.length,headerH+gridH);ctx.stroke();
DIAS.forEach((_,di)=>layoutDay(S.ho.filter(x=>x.dias.includes(di))).forEach(({ev,lane,lanes})=>{
const x=gutter+di*dayWidth+lane*dayWidth/lanes+2,y=headerH+timeToY(ev.hi);
const w=dayWidth/lanes-4,h=Math.max(timeToY(ev.hf)-timeToY(ev.hi),22);
ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);ctx.fillStyle=ev.tipo==="Laboratorio"?lab:accent;ctx.fillRect(x,y,4,h);
ctx.strokeStyle=ev.tipo==="Laboratorio"?lab:accent;ctx.setLineDash(ev.tipo==="Laboratorio"?[5,3]:[]);
ctx.strokeRect(x+2,y+1,w-2,h-2);ctx.setLineDash([]);
ctx.save();ctx.beginPath();ctx.rect(x+8,y+2,Math.max(0,w-12),Math.max(0,h-4));ctx.clip();
ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=fg;ctx.font="600 12px Geist, Inter, sans-serif";
const name=C[ev.k]?.nombre||"?";const lines=[];let line="";
for(const word of name.split(/\s+/)){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>w-16&&line){lines.push(line);line=word}else line=next}
if(line)lines.push(line);const maxLines=Math.max(1,Math.floor((h-6)/15)),shown=lines.slice(0,maxLines);
const center=y+h/2;shown.forEach((text,i)=>ctx.fillText(text,x+w/2,center+(i-(shown.length-1)/2)*15,w-16));
ctx.restore()
}));
canvas.toBlob(blob=>{
if(!blob){alert("No se pudo generar el archivo PNG del horario.");return}
const url=URL.createObjectURL(blob),link=document.createElement("a");
link.href=url;link.download="mi-horario.png";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
},"image/png")
}

// ===== Vistas =====
function upcoming(){const t=today();return S.ev.filter(e=>!e.ok&&e.d>=t).sort((a,b)=>a.d.localeCompare(b.d)||byH(a,b))}
const evRow=e=>`<div class="row" style="cursor:default"><span class="sp"><b>${esc(e.t)}</b><br><span class="s">${fd(e.d)}${e.h?" "+e.h:""} · ${e.tipo}${e.k&&C[e.k]?" · "+esc(C[e.k].nombre):""}</span></span></div>`;
const card=(k,v)=>`<div class="c"><div class="lb">${k}</div><div class="k">${v}</div></div>`;

function vDashboard(){const s=stats(),sem=[...new Set(codes.map(k=>C[k].semestre))].sort((a,b)=>a-b);
const row=(a,b,c)=>`<div style="margin-bottom:12px"><div class="s" style="display:flex;justify-content:space-between"><span>${a}</span><span>${b}</span></div><div class="bar"><i style="width:${c}%"></i></div></div>`;
return`<h2>Dashboard</h2><div class="g">${card("Créditos obtenidos",s.ob)}${card("Créditos restantes",s.restantes)}${card("Créditos totales",s.meta)}${card("Avance de carrera",s.pct.toFixed(2)+"%")}${card("Cursos aprobados",s.ap.length)}${card("Cursando",s.cu.length)}${card("Pendientes",codes.length-s.ap.length-s.cu.length)}${card("Disponibles",s.di.length)}${card("Bloqueados",s.bl.length)}${card("Promedio",s.avg==null?"—":s.avg.toFixed(1))}</div>
<div class="c" style="margin-bottom:14px"><div class="bar"><i style="width:${s.pct}%"></i></div></div>
${!s.ap.length?`<div class="c em" style="margin-bottom:14px">Todavía no tienes cursos aprobados.<br>Ve a Pensum y marca tus cursos aprobados para comenzar a calcular tu progreso.</div>`:""}
<div class="g2"><div class="c"><h3>Próximas actividades</h3>${upcoming().slice(0,5).map(evRow).join("")||empty("Sin eventos próximos.")}</div>
<div class="c"><h3>Cursos actuales</h3>${s.cu.map(k=>{const a=acc(k);return`<div class="row" onclick="openC='${k}';render()"><span class="sp">${esc(C[k].nombre)}</span><b>${a.m?Math.round(a.p/a.m*100):"—"}</b></div>`}).join("")||empty("No estás cursando ningún curso.")}</div>
<div class="c"><h3>Cursos que puedo asignarme</h3>${s.di.map(crow).join("")||empty("Ninguno disponible por ahora.")}</div>
<div class="c"><h3>Aprobados por semestre</h3>${sem.map(n=>{const l=codes.filter(k=>C[k].semestre===n),a=l.filter(k=>st(k)==="APROBADO").length;return row("Semestre "+n,a+" / "+l.length,a/l.length*100)}).join("")}</div></div>`}

// ----- Pensum: tarjetas con check de aprobado y desplegable -----
let openP=new Set();
function togP(k){openP.has(k)?openP.delete(k):openP.add(k);render()}
function chk(k,v){if(!v)return setE(k,null);
const q=[k],seen=new Set();while(q.length){const x=q.pop();if(seen.has(x))continue;seen.add(x);S.c[x]=S.c[x]||{};S.c[x].e="APROBADO";pre(C[x]).forEach(y=>q.push(y))}save()}
function setNota(k,v){const n=parseFloat(v);S.c[k]=S.c[k]||{};if(isNaN(n))delete S.c[k].n;else S.c[k].n=Math.min(100,Math.max(0,n));save()}
function pcard(k){const c=C[k],s=st(k),o=openP.has(k),cls=s==="APROBADO"?"ok":s==="CURSANDO"?"cu":s==="BLOQUEADO"?"no":"",d=S.c[k]||{};
const pr=pre(c),po=post(c);
const det=o?`<div class="pd"><b>Requisitos previos:</b>${pr.map(x=>`<div class="pi">${S.c[x]?.e==="APROBADO"?I.ok:I.no} [${x}] ${esc(C[x].nombre)}</div>`).join("")||`<div class="pi">Ninguno</div>`}
${po.length?`<b class="pg">Es requisito de:</b>${po.map(x=>`<div class="pi">- [${x}] ${esc(C[x].nombre)}</div>`).join("")}`:""}
${s==="APROBADO"?`<div class="pn"><b class="pg">Nota:</b><input type="number" min="0" max="100" placeholder="0 - 100" value="${d.n??""}" onchange="setNota('${k}',this.value)"></div>`:""}</div>`:"";
return`<div class="c pc"><div class="ph"><input type="checkbox" ${s==="APROBADO"?"checked":""} aria-label="Aprobado: ${esc(c.nombre)}" onchange="chk('${k}',this.checked)"><span class="sp">Código: ${k} | ${c.Obligatorio?"Obligatorio":"Electivo"}</span><span class="cr">${c.creditos}</span></div>
<div class="pb ${cls}"><div class="pt" onclick="togP('${k}')"><span class="sp">${esc(c.nombre)}</span><span>${o?I.up:I.dn}</span></div>${det}</div></div>`}

function vPensum(){const sem=[...new Set(codes.map(k=>C[k].semestre))].sort((a,b)=>a-b);
return`<h2>Pensum ${P.pensum_año}</h2><div class="pz">${sem.map(n=>`<div class="pcol"><div class="c psh">Semestre ${n}</div>${codes.filter(k=>C[k].semestre===n).map(pcard).join("")}</div>`).join("")}</div>`}

function vCursos(){const f=["TODOS","CURSANDO","APROBADO","DISPONIBLE","BLOQUEADO"];
const l=codes.filter(k=>fil==="TODOS"||st(k)===fil);
const av=codes.filter(k=>st(k)==="DISPONIBLE"||st(k)==="CURSANDO");
const pick=`<div class="c" style="margin-bottom:14px"><h3>Elegir cursos que estoy cursando</h3><div class="s" style="margin-bottom:6px">Solo aparecen los cursos disponibles (con prerrequisitos aprobados). Al marcar un curso como cursando puedes agregarle detalles a la derecha.</div>${av.map(k=>{const cu=st(k)==="CURSANDO",op=detOpen.has(k);
return`<div class="row" style="flex-direction:column;align-items:stretch;gap:0;cursor:default"><div style="display:flex;align-items:center;gap:10px"><label style="display:flex;align-items:center;gap:10px;flex:1;cursor:pointer"><input type="checkbox" ${cu?"checked":""} onchange="setE('${k}',this.checked?'CURSANDO':null)"><span class="sp">${esc(C[k].nombre)} <span class="s">· ${k} · Semestre ${C[k].semestre} · ${C[k].creditos} cr</span></span></label>${cu?`<button onclick="togDet('${k}')">${op?"Ocultar detalles":"+ Detalles"}</button>`:""}</div>${cu&&op?detPanel(k):""}</div>`}).join("")||empty("No hay cursos disponibles. Aprueba cursos en Pensum.")}</div>`;
return`<h2>Cursos</h2>${pick}<div class="f">${f.map(x=>`<button class="${fil===x?"p":""}" onclick="fil='${x}';render()">${x[0]+x.slice(1).toLowerCase()}</button>`).join("")}</div>
<div class="c">${l.map(crow).join("")||empty("No hay cursos con este estado.")}</div>`}

function vCalendario(){const start=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),cells=[];
for(let i=0;i<start;i++)cells.push(0);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(0);const T=today();
return`<h2>Calendario</h2><div class="f" style="align-items:center"><button aria-label="Mes anterior" onclick="navM(-1)">${I.l}</button><button aria-label="Mes siguiente" onclick="navM(1)">${I.r}</button><button onclick="goT()">Hoy</button><b style="font-size:18px;margin-left:6px">${MES[calM]} ${calY}</b></div>
<div class="c" style="padding:0;overflow:hidden"><div class="cal">${DOW.map(d=>`<div class="dw">${d}</div>`).join("")}${cells.map(d=>{if(!d)return`<div class="dc o"></div>`;const k=iso(calY,calM,d),l=S.ev.filter(e=>e.d===k).sort(byH);
return`<div class="dc" onclick="openD='${k}';openC=null;render()"><span class="dn ${k===T?"td":""}">${d}</span>${l.slice(0,3).map(e=>`<div class="ch" style="--c:${col(e.tipo)};${e.ok?"opacity:.5;text-decoration:line-through":""}">${e.h?e.h+" ":""}${esc(e.t)}</div>`).join("")}${l.length>3?`<div class="s">+${l.length-3} más</div>`:""}</div>`}).join("")}</div></div>
<div class="f" style="margin-top:12px">${TIPOS.map(t=>`<span class="s"><span class="dot" style="background:${col(t)}"></span> ${t}</span>`).join("")}</div><div class="s">Toca un día para agregar un evento.</div>`}

function vHorario(){const av=codes.filter(k=>st(k)==="CURSANDO");
if(!hoSelK||!av.includes(hoSelK))hoSelK=av[0]||null;
const sel=hoSelK,mine=sel?S.ho.filter(x=>x.k===sel):[],daySel=sel?hoSel[sel]||(hoSel[sel]=new Set()):new Set();
const form=av.length?`<div class="c hoPanel" style="margin-bottom:14px"><h3>Agregar horario</h3>
${mine.length?`<div style="margin-bottom:10px">${mine.map(x=>`<div class="row" style="cursor:default"><span class="dot" style="background:${x.tipo==="Laboratorio"?"var(--lab)":"var(--ac)"}"></span><span class="sp">${x.tipo} · ${x.dias.map(d=>DIAS[d].slice(0,3)).join("/")} · ${x.hi}-${x.hf}</span><button class="d" aria-label="Eliminar horario" onclick="delHorario('${x.id}')">${I.x}</button></div>`).join("")}</div>`:""}
<div class="f"><select id="hoCur" aria-label="Curso" onchange="hoSelK=this.value;render()">${av.map(k=>`<option value="${k}" ${k===sel?"selected":""}>${esc(C[k].nombre)}</option>`).join("")}</select>
<select id="hoTip" aria-label="Tipo"><option>Magistral</option><option>Laboratorio</option></select></div>
<div class="f"><input id="hoHi" type="time" aria-label="Hora de inicio"><input id="hoHf" type="time" aria-label="Hora de fin"></div>
<div class="dayPicker">${DIAS.map((d,i)=>`<button type="button" class="dayPill ${daySel.has(i)?"on":""}" onclick="togDay('${sel}',${i})">${d.slice(0,2)}</button>`).join("")}</div>
<button class="p" style="margin-top:10px" onclick="addHorario()">Agregar horario</button></div>`
:`<div class="c em" style="margin-bottom:14px">Marca algún curso como "Cursando" en la pestaña Cursos para poder agregarle horario.</div>`;
const cols=DIAS.map((d,di)=>{const laid=layoutDay(S.ho.filter(x=>x.dias.includes(di)));
return`<div class="hoCol" style="height:calc(var(--ho-row-height) * ${H1-H0});background-size:100% var(--ho-row-height)">${laid.map(({ev:x,lane,lanes})=>`<div class="hoEv ${x.tipo==="Laboratorio"?"hoLab":"hoMag"}" style="top:calc(var(--ho-row-height) * ${timeToHour(x.hi)-H0});height:max(calc(var(--ho-row-height) * ${timeToHour(x.hf)-timeToHour(x.hi)}),12px);left:calc(${lane*100/lanes}% + 2px);width:calc(${100/lanes}% - 4px)" title="${esc(C[x.k]?.nombre||"")} · ${x.tipo} · ${x.hi}-${x.hf}" onclick="openC='${x.k}';render()"><b>${esc(C[x.k]?.nombre||"?")}</b></div>`).join("")}</div>`}).join("");
const grid=`<div class="c x"><div class="hoGrid">
<div class="hoHead"></div>${DIAS.map(d=>`<div class="hoHead">${d}</div>`).join("")}
<div class="hoHours">${Array.from({length:H1-H0},(_,i)=>H0+i).map(h=>`<div class="hoHr">${String(h).padStart(2,"0")}:00</div>`).join("")}</div>
${cols}
</div></div>`;
return`<h2>Horario</h2>${form}<div class="f" style="margin-bottom:12px">${[["Magistral","var(--ac)"],["Laboratorio","var(--lab)"]].map(([t,c])=>`<span class="s"><span class="dot" style="background:${c}"></span> ${t}</span>`).join("")}</div>
${S.ho.length?`${grid}<button class="p hoDownload" onclick="downloadHorario()">Descargar horario .PNG</button>`:empty("Aún no agregas horario.")}`}

function dayModal(){if(!openD)return"";const[y,m,d]=openD.split("-"),l=S.ev.filter(e=>e.d===openD).sort(byH);
return`<div class="m" onclick="if(event.target===this){openD=null;render()}"><div role="dialog" aria-label="Eventos del día"><div style="display:flex;gap:8px"><h2 class="sp" style="margin:0;font-size:20px">${+d} de ${MES[m-1]} de ${y}</h2><button aria-label="Cerrar" onclick="openD=null;render()">${I.x}</button></div>
<div style="margin:12px 0">${l.map(e=>`<div class="row" style="cursor:default"><input type="checkbox" ${e.ok?"checked":""} aria-label="Completado" onchange="S.ev.find(x=>x.id==='${e.id}').ok=this.checked;save()"><span class="dot" style="background:${col(e.tipo)}"></span><span class="sp" style="${e.ok?"opacity:.5;text-decoration:line-through":""}"><b>${esc(e.t)}</b><br><span class="s">${e.h?e.h+" · ":""}${esc(e.tipo)}${e.k&&C[e.k]?" · "+esc(C[e.k].nombre):""}${e.pid?" · proyecto":""}</span></span><button class="d" aria-label="Eliminar evento" onclick="delE('${e.id}')">${I.x}</button></div>`).join("")||empty("Sin eventos este día.")}</div>
<h3>Nuevo evento</h3><div class="f"><input id="evt" placeholder="Título"><input id="evh" type="time" aria-label="Hora"></div>
<div class="f"><select id="evy" onchange="tp()">${TIPOS.map(t=>`<option>${t}</option>`).join("")}</select><select id="evk"><option value="">Sin curso</option>${codes.filter(k=>st(k)==="CURSANDO").map(k=>`<option value="${k}">${esc(C[k].nombre)}</option>`).join("")}</select></div>
<div class="f" id="evpw"><select id="evp"><option value="new">Crear proyecto nuevo</option>${S.pr.map(p=>`<option value="${p.id}">${esc(p.n)}${p.d?" (entrega "+fd(p.d)+")":""}</option>`).join("")}</select></div>
<button class="p" onclick="addEvD()">Agregar evento</button></div></div>`}

function vProyectos(){return`<h2>Proyectos</h2><div class="c f" style="margin-bottom:8px"><input id="pn" placeholder="Nombre del proyecto"><select id="pc"><option value="">Sin curso</option>${codes.filter(k=>st(k)==="CURSANDO").map(k=>`<option value="${k}">${esc(C[k].nombre)}</option>`).join("")}</select><input id="pd" type="date" aria-label="Fecha de entrega"><button class="p" onclick="addPr()">Crear proyecto</button></div>
<div class="s" style="margin-bottom:14px">La fecha de entrega se sincroniza con el calendario: cambiarla aquí o allá actualiza ambos.</div>
<div class="g2">${S.pr.map((p,i)=>{const n=p.t.filter(t=>t.ok).length,pc=p.t.length?Math.round(n/p.t.length*100):0;const es=!p.t.length||!n?"Pendiente":pc===100?"Completado":"En progreso";
return`<div class="c"><div style="display:flex;gap:8px"><b class="sp">${esc(p.n)}</b><button class="d" aria-label="Eliminar proyecto" onclick="delP('${p.id}')">${I.x}</button></div>
<div class="s">${p.k&&C[p.k]?esc(C[p.k].nombre)+" · ":""}${es}</div><div class="f" style="margin:8px 0 0;align-items:center"><span class="s">Entrega</span><input type="date" value="${p.d||""}" aria-label="Fecha de entrega" onchange="setPd('${p.id}',this.value)"></div>
<div class="bar" style="margin:10px 0"><i style="width:${pc}%"></i></div><div class="s" style="margin-bottom:6px">${pc}%</div>
${p.t.map((t,j)=>`<div class="row" style="cursor:default"><input type="checkbox" ${t.ok?"checked":""} onchange="S.pr[${i}].t[${j}].ok=this.checked;save()"><span class="sp" style="${t.ok?"opacity:.5":""}">${esc(t.x)}</span><button class="d" aria-label="Quitar tarea" onclick="S.pr[${i}].t.splice(${j},1);save()">${I.x}</button></div>`).join("")}
<div class="f" style="margin:10px 0 0"><input id="t${i}" placeholder="Nueva tarea"><button onclick="addT(${i})">Agregar</button></div></div>`}).join("")||`<div class="c em">Sin proyectos todavía. Crea el primero arriba o desde un día del calendario.</div>`}</div>`}

function vNotas(){const n=S.nt[editN]||{t:"",c:"Universidad",b:""};const cats=["Universidad","Programación","Ideas","Pendientes","Personal","Otro"];
return`<h2>Notas</h2><div class="c" style="margin-bottom:14px"><div class="f"><input id="nt" placeholder="Título" value="${esc(n.t)}"><select id="nc">${cats.map(c=>`<option ${c===n.c?"selected":""}>${c}</option>`).join("")}</select></div>
<textarea id="nb" placeholder="Contenido">${esc(n.b)}</textarea><div class="f" style="margin:10px 0 0"><button class="p" onclick="saveNote()">${editN>=0?"Guardar cambios":"Agregar nota"}</button>${editN>=0?`<button onclick="editN=-1;render()">Cancelar</button>`:""}</div></div>
<div class="g2">${S.nt.map((x,i)=>`<div class="c"><div style="display:flex;gap:8px"><b class="sp">${esc(x.t)}</b><button aria-label="Editar nota" onclick="editN=${i};render();scrollTo(0,0)">${I.pen}</button><button class="d" aria-label="Eliminar nota" onclick="if(confirm('¿Eliminar nota?')){S.nt.splice(${i},1);save()}">${I.x}</button></div><div class="s">${x.c} · modificada ${fd(x.m)}</div><p style="white-space:pre-wrap;margin:8px 0 0">${esc(x.b)}</p></div>`).join("")||`<div class="c em">Aún no tienes notas.</div>`}</div>`}

function vConfig(){return`<h2>Configuración</h2><div class="g2"><div class="c"><h3>Carrera</h3><p style="margin:0">${esc(P.carrera)}<br><span class="s">Pensum ${P.pensum_año} · ${codes.length} cursos</span></p></div>
<div class="c"><h3>Respaldo</h3><div class="f"><button class="p" onclick="exp()">Exportar mis datos</button><label><button onclick="$('fi').click()">Importar mis datos</button></label><input id="fi" type="file" accept="application/json" hidden onchange="imp(this)"></div><div class="s">Tus datos viven solo en este navegador. Exporta un respaldo de vez en cuando.</div></div>
<div class="c"><h3>Apariencia</h3><button onclick="theme()">Cambiar tema claro/oscuro</button></div>
<div class="c"><h3>Zona de riesgo</h3><button class="d" onclick="reset()">Restablecer datos personales</button></div></div>`}

function modal(){if(!openC||!C[openC])return"";const k=openC,c=C[k],s=st(k),d=S.c[k]||{},a=acc(k);
return`<div class="m" onclick="if(event.target===this){openC=null;render()}"><div role="dialog" aria-label="${esc(c.nombre)}"><div style="display:flex;gap:8px"><h2 class="sp" style="margin:0">${esc(c.nombre)}</h2><button aria-label="Cerrar" onclick="openC=null;render()">${I.x}</button></div>
<p class="s">Código ${k} · ${c.creditos?c.creditos+" créditos":"créditos sin definir"} · Semestre ${c.semestre} · ${c.Obligatorio?"Obligatorio":"Electivo"}</p><p>${badge(s)}${s==="APROBADO"&&d.n!=null?` Nota final: <b>${d.n}</b>`:""}${s==="CURSANDO"&&a.m?` Nota actual: <b>${Math.round(a.p/a.m*100)}</b> (${a.p}/${a.m})`:""}</p>
<div class="f">${s==="BLOQUEADO"?`<span class="s">Falta aprobar: ${falt(k).map(x=>esc(C[x].nombre)).join(", ")}</span>`:`<button onclick="saveApr('${k}')" class="${s==="APROBADO"?"p":""}">Aprobado</button>${s!=="APROBADO"?`<button class="${s==="CURSANDO"?"p":""}" onclick="setE('${k}','CURSANDO')">Cursando</button>`:""}`}${S.c[k]?.e?`<button onclick="setE('${k}',null)">Quitar estado</button>`:""}</div>
${s==="APROBADO"||s==="DISPONIBLE"?`<div class="f"><input id="nf" type="number" min="0" max="100" placeholder="Nota final" value="${d.n??""}"><input id="sa" placeholder="Semestre/año aprobado" value="${esc(d.sa||"")}"></div>`:""}
<h3>Prerrequisitos</h3>${pre(c).map(x=>`<div>${S.c[x]?.e==="APROBADO"?I.ok:I.no} ${esc(C[x].nombre)}</div>`).join("")||`<div class="s">Ninguno</div>`}
${unk(c).length?`<div class="s" style="margin-top:6px">Prerrequisitos no definidos en el pensum (se ignoran): ${unk(c).join(", ")}</div>`:""}<h3 style="margin-top:12px">Postrequisitos</h3>${post(c).map(x=>`<div>→ ${esc(C[x].nombre)}</div>`).join("")||`<div class="s">Ninguno</div>`}
${s==="CURSANDO"?`<h3 style="margin-top:12px">Actividades</h3>${(d.ev||[]).map((e,i)=>`<div class="row" style="cursor:default"><span class="sp">${esc(e.n)}</span><span>${e.p} / ${e.m}</span><button class="d" aria-label="Quitar actividad" onclick="delEv('${k}',${i})">${I.x}</button></div>`).join("")||`<div class="s">Sin actividades.</div>`}
<div class="s" style="margin:6px 0">Total acumulado: <b>${a.p} / ${a.m}</b></div><div class="f"><input id="en" placeholder="Actividad"><input id="ep" type="number" placeholder="Obtenidos"><input id="em" type="number" placeholder="Máximo"><button class="p" onclick="addEv('${k}')">Agregar</button></div>`:""}</div></div>`}


// (Los estilos de Pensum, Horario y Toast están en css/styles.css)

// ===== Render =====
const NAV=[["dashboard",I.dash,"Dashboard",vDashboard],["pensum",I.book,"Pensum",vPensum],["cursos",I.cap,"Cursos",vCursos],["calendario",I.cal,"Calendario",vCalendario],["horario",I.clock,"Horario",vHorario],["proyectos",I.folder,"Proyectos",vProyectos],["notas",I.note,"Notas",vNotas],["config",I.cfg,"Configuración",vConfig]];
const savedView=getPreference(VIEW_KEY);
if(NAV.some(n=>n[0]===savedView))view=savedView;
function render(){const y=scrollY,x=scrollX,pz=document.querySelector(".pz"),pl=pz?pz.scrollLeft:0,m0=document.querySelector("main"),mt=m0?m0.scrollTop:0,v=NAV.find(n=>n[0]===view)||NAV[0];
$("app").innerHTML=`<header class="appbar"><button class="menu-toggle" aria-label="Abrir menú" aria-controls="primary-nav" aria-expanded="${menuOpen}" onclick="toggleMenu()"><span></span><span></span><span></span></button><div class="crumb"><span>Panel Académico</span>${I.chev}<b>${v[2]}</b></div></header>${menuOpen?`<button class="nav-backdrop" aria-label="Cerrar menú" onclick="closeMenu()"></button>`:""}<nav id="primary-nav" class="${menuOpen?"open":""}" aria-label="Principal"><h1><span class="logo">${ico('<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',16)}</span>Panel Académico</h1>${NAV.map(n=>`<a class="${n[0]===view?"on":""}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</a>`).join("")}</nav><main class="${view==="pensum"?"wide":""}">${v[3]()}</main>${modal()}${dayModal()}${toastMsg?`<div class="toast">${esc(toastMsg)}</div>`:""}`;
const pz2=document.querySelector(".pz");if(pz2&&pl)pz2.scrollLeft=pl;const m1=document.querySelector("main");if(m1&&mt)m1.scrollTop=mt;
scrollTo({top:y,left:x,behavior:"instant"})}
function go(v){view=v;setPreference(VIEW_KEY,view);openC=null;openD=null;editN=-1;menuOpen=false;render();scrollTo(0,0)}
render();