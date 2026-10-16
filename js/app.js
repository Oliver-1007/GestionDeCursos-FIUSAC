
// ===== Pensum (definido en js/pensum.js) =====
for(const k in P.cursos){const c=P.cursos[k];c.nombre=(c.nombre||"").trim()||"Curso "+c.codigo+" (sin nombre)";c.creditos=c.creditos||0}

// ===== Persistencia local =====
const KEY="panel-academico-v1";
const blank=()=>({c:{},ev:[],pr:[],nt:[]});
let S=blank();
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(blank(),JSON.parse(r))}catch(e){}
function mig(){const u=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);S.pr.forEach(p=>{if(!p.id)p.id=u()});S.ev.forEach(e=>{if(!e.id)e.id=u()})}
mig();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}render()}

// ===== Lógica académica =====
const C=P.cursos,codes=Object.keys(C);
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
const tot=codes.reduce((a,k)=>a+C[k].creditos,0),ob=ap.reduce((a,k)=>a+C[k].creditos,0);
const ns=ap.map(k=>S.c[k].n).filter(n=>typeof n==="number");
return{ap,cu,di,bl,tot,ob,pct:tot?ob/tot*100:0,avg:ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:null}}
const IC={APROBADO:"✓",CURSANDO:"▶",DISPONIBLE:"○",BLOQUEADO:"🔒"};
const badge=s=>`<span class="b ${s}">${s}</span>`;
const crow=k=>`<div class="row" onclick="openC='${k}';render()"><span>${IC[st(k)]}</span><span class="sp">${esc(C[k].nombre)} <span class="s">· ${k} · ${C[k].creditos} cr</span></span>${badge(st(k))}</div>`;
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
const TC={"Entrega de proyecto":"#6d8cff","Parcial":"#fbbf24","Examen":"#f87171","Entrega de tareas":"#34d399","Evento libre":"#a78bfa"};
const col=t=>TC[t]||"#8b93a7";
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
function theme(){const r=document.documentElement;r.dataset.theme=r.dataset.theme==="dark"?"light":"dark"}

// ===== Vistas =====
function upcoming(){const t=today();return S.ev.filter(e=>!e.ok&&e.d>=t).sort((a,b)=>a.d.localeCompare(b.d)||byH(a,b))}
const evRow=e=>`<div class="row" style="cursor:default"><span class="sp"><b>${esc(e.t)}</b><br><span class="s">${fd(e.d)}${e.h?" "+e.h:""} · ${e.tipo}${e.k&&C[e.k]?" · "+esc(C[e.k].nombre):""}</span></span></div>`;
const card=(k,v,s)=>`<div class="c"><div class="k">${v}</div><div class="s">${k}${s?" · "+s:""}</div></div>`;

function vDashboard(){const s=stats();
return`<h2>Dashboard</h2><div class="g">${card("Créditos obtenidos",s.ob)}${card("Créditos totales",s.tot)}${card("Avance de carrera",s.pct.toFixed(2)+"%")}${card("Cursos aprobados",s.ap.length)}${card("Cursando",s.cu.length)}${card("Pendientes",codes.length-s.ap.length-s.cu.length)}${card("Disponibles",s.di.length)}${card("Promedio",s.avg==null?"—":s.avg.toFixed(1))}</div>
<div class="c" style="margin-bottom:14px"><div class="bar"><i style="width:${s.pct}%"></i></div></div>
${!s.ap.length?`<div class="c em" style="margin-bottom:14px">Todavía no tienes cursos aprobados.<br>Ve a Pensum y marca tus cursos aprobados para comenzar a calcular tu progreso.</div>`:""}
<div class="g2"><div class="c"><h3>Próximas actividades</h3>${upcoming().slice(0,5).map(evRow).join("")||empty("Sin eventos próximos.")}</div>
<div class="c"><h3>Cursos actuales</h3>${s.cu.map(k=>{const a=acc(k);return`<div class="row" onclick="openC='${k}';render()"><span class="sp">${esc(C[k].nombre)}</span><b>${a.m?Math.round(a.p/a.m*100):"—"}</b></div>`}).join("")||empty("No estás cursando ningún curso.")}</div>
<div class="c"><h3>Cursos que puedo asignarme</h3>${s.di.map(crow).join("")||empty("Ninguno disponible por ahora.")}</div></div>`}

// ----- Pensum: tarjetas con check de aprobado y desplegable -----
let openP=new Set();
function togP(k){openP.has(k)?openP.delete(k):openP.add(k);render()}
function chk(k,v){if(!v)return setE(k,null);
const q=[k],seen=new Set();while(q.length){const x=q.pop();if(seen.has(x))continue;seen.add(x);S.c[x]=S.c[x]||{};S.c[x].e="APROBADO";pre(C[x]).forEach(y=>q.push(y))}save()}
function setNota(k,v){const n=parseFloat(v);S.c[k]=S.c[k]||{};if(isNaN(n))delete S.c[k].n;else S.c[k].n=Math.min(100,Math.max(0,n));save()}
function pcard(k){const c=C[k],s=st(k),o=openP.has(k),cls=s==="APROBADO"?"ok":s==="CURSANDO"?"cu":s==="BLOQUEADO"?"no":"",d=S.c[k]||{};
const pr=pre(c),po=post(c);
const det=o?`<div class="pd"><b>Requisitos previos:</b>${pr.map(x=>`<div class="pi">${S.c[x]?.e==="APROBADO"?"✓":"✗"} [${x}] ${esc(C[x].nombre)}</div>`).join("")||`<div class="pi">Ninguno</div>`}
${po.length?`<b class="pg">Es requisito de:</b>${po.map(x=>`<div class="pi">- [${x}] ${esc(C[x].nombre)}</div>`).join("")}`:""}
${s==="APROBADO"?`<div class="pn"><b class="pg">Nota:</b><input type="number" min="0" max="100" placeholder="0 - 100" value="${d.n??""}" onchange="setNota('${k}',this.value)"></div>`:""}</div>`:"";
return`<div class="c pc"><div class="ph"><input type="checkbox" ${s==="APROBADO"?"checked":""} aria-label="Aprobado: ${esc(c.nombre)}" onchange="chk('${k}',this.checked)"><span class="sp">Código: ${k} | ${c.Obligatorio?"Obligatorio":"Electivo"}</span><span class="cr">${c.creditos}</span></div>
<div class="pb ${cls}"><div class="pt" onclick="togP('${k}')"><span class="sp">${esc(c.nombre)}</span><span>${o?"⌃":"⌄"}</span></div>${det}</div></div>`}

function vPensum(){const sem=[...new Set(codes.map(k=>C[k].semestre))].sort((a,b)=>a-b);
return`<h2>Pensum ${P.pensum_año}</h2><div class="pz">${sem.map(n=>`<div class="pcol"><div class="c psh">Semestre ${n}</div>${codes.filter(k=>C[k].semestre===n).map(pcard).join("")}</div>`).join("")}</div>`}

function vCursos(){const f=["TODOS","CURSANDO","APROBADO","DISPONIBLE","BLOQUEADO"];
const l=codes.filter(k=>fil==="TODOS"||st(k)===fil);
const av=codes.filter(k=>st(k)==="DISPONIBLE"||st(k)==="CURSANDO");
const pick=`<div class="c" style="margin-bottom:14px"><h3>Elegir cursos que estoy cursando</h3><div class="s" style="margin-bottom:6px">Solo aparecen los cursos disponibles (con prerrequisitos aprobados).</div>${av.map(k=>`<label class="row"><input type="checkbox" ${st(k)==="CURSANDO"?"checked":""} onchange="setE('${k}',this.checked?'CURSANDO':null)"><span class="sp">${esc(C[k].nombre)} <span class="s">· ${k} · Semestre ${C[k].semestre} · ${C[k].creditos} cr</span></span></label>`).join("")||empty("No hay cursos disponibles. Aprueba cursos en Pensum.")}</div>`;
return`<h2>Cursos</h2>${pick}<div class="f">${f.map(x=>`<button class="${fil===x?"p":""}" onclick="fil='${x}';render()">${x}</button>`).join("")}</div>
<div class="c">${l.map(crow).join("")||empty("No hay cursos con este estado.")}</div>`}

function vCalendario(){const start=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),cells=[];
for(let i=0;i<start;i++)cells.push(0);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(0);const T=today();
return`<h2>Calendario</h2><div class="f" style="align-items:center"><button aria-label="Mes anterior" onclick="navM(-1)">‹</button><button aria-label="Mes siguiente" onclick="navM(1)">›</button><button onclick="goT()">Hoy</button><b style="font-size:18px;margin-left:6px">${MES[calM]} ${calY}</b></div>
<div class="c" style="padding:0;overflow:hidden"><div class="cal">${DOW.map(d=>`<div class="dw">${d}</div>`).join("")}${cells.map(d=>{if(!d)return`<div class="dc o"></div>`;const k=iso(calY,calM,d),l=S.ev.filter(e=>e.d===k).sort(byH);
return`<div class="dc" onclick="openD='${k}';openC=null;render()"><span class="dn ${k===T?"td":""}">${d}</span>${l.slice(0,3).map(e=>`<div class="ch" style="--c:${col(e.tipo)};${e.ok?"opacity:.5;text-decoration:line-through":""}">${e.h?e.h+" ":""}${esc(e.t)}</div>`).join("")}${l.length>3?`<div class="s">+${l.length-3} más</div>`:""}</div>`}).join("")}</div></div>
<div class="f" style="margin-top:12px">${TIPOS.map(t=>`<span class="s"><span class="dot" style="background:${col(t)}"></span> ${t}</span>`).join("")}</div><div class="s">Toca un día para agregar un evento.</div>`}

function dayModal(){if(!openD)return"";const[y,m,d]=openD.split("-"),l=S.ev.filter(e=>e.d===openD).sort(byH);
return`<div class="m" onclick="if(event.target===this){openD=null;render()}"><div role="dialog" aria-label="Eventos del día"><div style="display:flex;gap:8px"><h2 class="sp" style="margin:0;font-size:20px">${+d} de ${MES[m-1]} de ${y}</h2><button aria-label="Cerrar" onclick="openD=null;render()">✕</button></div>
<div style="margin:12px 0">${l.map(e=>`<div class="row" style="cursor:default"><input type="checkbox" ${e.ok?"checked":""} aria-label="Completado" onchange="S.ev.find(x=>x.id==='${e.id}').ok=this.checked;save()"><span class="dot" style="background:${col(e.tipo)}"></span><span class="sp" style="${e.ok?"opacity:.5;text-decoration:line-through":""}"><b>${esc(e.t)}</b><br><span class="s">${e.h?e.h+" · ":""}${esc(e.tipo)}${e.k&&C[e.k]?" · "+esc(C[e.k].nombre):""}${e.pid?" · proyecto":""}</span></span><button class="d" aria-label="Eliminar evento" onclick="delE('${e.id}')">✕</button></div>`).join("")||empty("Sin eventos este día.")}</div>
<h3>Nuevo evento</h3><div class="f"><input id="evt" placeholder="Título"><input id="evh" type="time" aria-label="Hora"></div>
<div class="f"><select id="evy" onchange="tp()">${TIPOS.map(t=>`<option>${t}</option>`).join("")}</select><select id="evk"><option value="">Sin curso</option>${codes.filter(k=>st(k)==="CURSANDO").map(k=>`<option value="${k}">${esc(C[k].nombre)}</option>`).join("")}</select></div>
<div class="f" id="evpw"><select id="evp"><option value="new">➕ Crear proyecto nuevo</option>${S.pr.map(p=>`<option value="${p.id}">${esc(p.n)}${p.d?" (entrega "+fd(p.d)+")":""}</option>`).join("")}</select></div>
<button class="p" onclick="addEvD()">Agregar evento</button></div></div>`}

function vProyectos(){return`<h2>Proyectos</h2><div class="c f" style="margin-bottom:8px"><input id="pn" placeholder="Nombre del proyecto"><select id="pc"><option value="">Sin curso</option>${codes.filter(k=>st(k)==="CURSANDO").map(k=>`<option value="${k}">${esc(C[k].nombre)}</option>`).join("")}</select><input id="pd" type="date" aria-label="Fecha de entrega"><button class="p" onclick="addPr()">Crear proyecto</button></div>
<div class="s" style="margin-bottom:14px">La fecha de entrega se sincroniza con el calendario: cambiarla aquí o allá actualiza ambos.</div>
<div class="g2">${S.pr.map((p,i)=>{const n=p.t.filter(t=>t.ok).length,pc=p.t.length?Math.round(n/p.t.length*100):0;const es=!p.t.length||!n?"Pendiente":pc===100?"Completado":"En progreso";
return`<div class="c"><div style="display:flex;gap:8px"><b class="sp">${esc(p.n)}</b><button class="d" aria-label="Eliminar proyecto" onclick="delP('${p.id}')">✕</button></div>
<div class="s">${p.k&&C[p.k]?esc(C[p.k].nombre)+" · ":""}${es}</div><div class="f" style="margin:8px 0 0;align-items:center"><span class="s">Entrega</span><input type="date" value="${p.d||""}" aria-label="Fecha de entrega" onchange="setPd('${p.id}',this.value)"></div>
<div class="bar" style="margin:10px 0"><i style="width:${pc}%"></i></div><div class="s" style="margin-bottom:6px">${pc}%</div>
${p.t.map((t,j)=>`<div class="row" style="cursor:default"><input type="checkbox" ${t.ok?"checked":""} onchange="S.pr[${i}].t[${j}].ok=this.checked;save()"><span class="sp" style="${t.ok?"opacity:.5":""}">${esc(t.x)}</span><button class="d" aria-label="Quitar tarea" onclick="S.pr[${i}].t.splice(${j},1);save()">✕</button></div>`).join("")}
<div class="f" style="margin:10px 0 0"><input id="t${i}" placeholder="Nueva tarea"><button onclick="addT(${i})">Agregar</button></div></div>`}).join("")||`<div class="c em">Sin proyectos todavía. Crea el primero arriba o desde un día del calendario.</div>`}</div>`}

function vNotas(){const n=S.nt[editN]||{t:"",c:"Universidad",b:""};const cats=["Universidad","Programación","Ideas","Pendientes","Personal","Otro"];
return`<h2>Notas</h2><div class="c" style="margin-bottom:14px"><div class="f"><input id="nt" placeholder="Título" value="${esc(n.t)}"><select id="nc">${cats.map(c=>`<option ${c===n.c?"selected":""}>${c}</option>`).join("")}</select></div>
<textarea id="nb" placeholder="Contenido">${esc(n.b)}</textarea><div class="f" style="margin:10px 0 0"><button class="p" onclick="saveNote()">${editN>=0?"Guardar cambios":"Agregar nota"}</button>${editN>=0?`<button onclick="editN=-1;render()">Cancelar</button>`:""}</div></div>
<div class="g2">${S.nt.map((x,i)=>`<div class="c"><div style="display:flex;gap:8px"><b class="sp">${esc(x.t)}</b><button aria-label="Editar nota" onclick="editN=${i};render();scrollTo(0,0)">✎</button><button class="d" aria-label="Eliminar nota" onclick="if(confirm('¿Eliminar nota?')){S.nt.splice(${i},1);save()}">✕</button></div><div class="s">${x.c} · modificada ${fd(x.m)}</div><p style="white-space:pre-wrap;margin:8px 0 0">${esc(x.b)}</p></div>`).join("")||`<div class="c em">Aún no tienes notas.</div>`}</div>`}

function vEstadisticas(){const s=stats(),sem=[...new Set(codes.map(k=>C[k].semestre))].sort((a,b)=>a-b);
const row=(a,b,c)=>`<div style="margin-bottom:12px"><div class="s" style="display:flex;justify-content:space-between"><span>${a}</span><span>${b}</span></div><div class="bar"><i style="width:${c}%"></i></div></div>`;
return`<h2>Estadísticas</h2><div class="g">${card("Créditos obtenidos",s.ob)}${card("Créditos restantes",s.tot-s.ob)}${card("Completado",s.pct.toFixed(2)+"%")}${card("Aprobados",s.ap.length)}${card("Cursando",s.cu.length)}${card("Disponibles",s.di.length)}${card("Bloqueados",s.bl.length)}${card("Promedio",s.avg==null?"—":s.avg.toFixed(2))}</div>
<div class="g2"><div class="c"><h3>Progreso de la carrera</h3>${row("Créditos",s.ob+" / "+s.tot,s.pct)}</div>
<div class="c"><h3>Aprobados por semestre</h3>${sem.map(n=>{const l=codes.filter(k=>C[k].semestre===n),a=l.filter(k=>st(k)==="APROBADO").length;return row("Semestre "+n,a+" / "+l.length,a/l.length*100)}).join("")}</div></div>`}

function vConfig(){return`<h2>Configuración</h2><div class="g2"><div class="c"><h3>Carrera</h3><p style="margin:0">${esc(P.carrera)}<br><span class="s">Pensum ${P.pensum_año} · ${codes.length} cursos</span></p></div>
<div class="c"><h3>Respaldo</h3><div class="f"><button class="p" onclick="exp()">Exportar mis datos</button><label><button onclick="$('fi').click()">Importar mis datos</button></label><input id="fi" type="file" accept="application/json" hidden onchange="imp(this)"></div><div class="s">Tus datos viven solo en este navegador. Exporta un respaldo de vez en cuando.</div></div>
<div class="c"><h3>Apariencia</h3><button onclick="theme()">Cambiar tema claro/oscuro</button></div>
<div class="c"><h3>Zona de riesgo</h3><button class="d" onclick="reset()">Restablecer datos personales</button></div></div>`}

function modal(){if(!openC||!C[openC])return"";const k=openC,c=C[k],s=st(k),d=S.c[k]||{},a=acc(k);
return`<div class="m" onclick="if(event.target===this){openC=null;render()}"><div role="dialog" aria-label="${esc(c.nombre)}"><div style="display:flex;gap:8px"><h2 class="sp" style="margin:0">${esc(c.nombre)}</h2><button aria-label="Cerrar" onclick="openC=null;render()">✕</button></div>
<p class="s">Código ${k} · ${c.creditos?c.creditos+" créditos":"créditos sin definir"} · Semestre ${c.semestre} · ${c.Obligatorio?"Obligatorio":"Electivo"}</p><p>${badge(s)}${s==="APROBADO"&&d.n!=null?` Nota final: <b>${d.n}</b>`:""}${s==="CURSANDO"&&a.m?` Nota actual: <b>${Math.round(a.p/a.m*100)}</b> (${a.p}/${a.m})`:""}</p>
<div class="f">${s==="BLOQUEADO"?`<span class="s">Falta aprobar: ${falt(k).map(x=>esc(C[x].nombre)).join(", ")}</span>`:`<button onclick="saveApr('${k}')" class="${s==="APROBADO"?"p":""}">Aprobado</button>${s!=="APROBADO"?`<button class="${s==="CURSANDO"?"p":""}" onclick="setE('${k}','CURSANDO')">Cursando</button>`:""}`}${S.c[k]?.e?`<button onclick="setE('${k}',null)">Quitar estado</button>`:""}</div>
${s==="APROBADO"||s==="DISPONIBLE"?`<div class="f"><input id="nf" type="number" min="0" max="100" placeholder="Nota final" value="${d.n??""}"><input id="sa" placeholder="Semestre/año aprobado" value="${esc(d.sa||"")}"></div>`:""}
<h3>Prerrequisitos</h3>${pre(c).map(x=>`<div>${S.c[x]?.e==="APROBADO"?"✓":"✗"} ${esc(C[x].nombre)}</div>`).join("")||`<div class="s">Ninguno</div>`}
${unk(c).length?`<div class="s" style="margin-top:6px">⚠ Prerrequisitos no definidos en el pensum (se ignoran): ${unk(c).join(", ")}</div>`:""}<h3 style="margin-top:12px">Postrequisitos</h3>${post(c).map(x=>`<div>→ ${esc(C[x].nombre)}</div>`).join("")||`<div class="s">Ninguno</div>`}
${s==="CURSANDO"?`<h3 style="margin-top:12px">Actividades</h3>${(d.ev||[]).map((e,i)=>`<div class="row" style="cursor:default"><span class="sp">${esc(e.n)}</span><span>${e.p} / ${e.m}</span><button class="d" aria-label="Quitar actividad" onclick="delEv('${k}',${i})">✕</button></div>`).join("")||`<div class="s">Sin actividades.</div>`}
<div class="s" style="margin:6px 0">Total acumulado: <b>${a.p} / ${a.m}</b></div><div class="f"><input id="en" placeholder="Actividad"><input id="ep" type="number" placeholder="Obtenidos"><input id="em" type="number" placeholder="Máximo"><button class="p" onclick="addEv('${k}')">Agregar</button></div>`:""}</div></div>`}


// ===== Estilos del pensum (se suman a tu CSS actual) =====
(()=>{const st=document.createElement("style");st.textContent=`
.pz{display:flex;gap:18px;overflow-x:auto;align-items:flex-start;padding-bottom:18px;scroll-behavior:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
.pcol{flex:0 0 296px;min-width:296px;scroll-snap-align:start}
.psh{text-align:left;font-weight:800;font-size:15px;padding:8px 6px 12px;margin-bottom:12px;background:transparent;border:0;border-bottom:2px solid var(--bd);border-radius:0}
.pc{padding:10px;margin:0 0 12px;border-radius:var(--radius-sm)}
.ph{display:flex;align-items:center;gap:10px;font-size:12.5px;font-weight:600;color:var(--mu);margin-bottom:8px;font-family:var(--mono)}
.ph input{width:19px;height:19px;cursor:pointer;margin:0}
.ph input:disabled{cursor:not-allowed;opacity:.5}
.cr{background:var(--card-2);color:var(--tx);border:1px solid var(--bd);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:var(--mono);font-size:12px;flex:none}
.pb{border:1px solid var(--bd);border-left:3px solid var(--bd);border-radius:10px;padding:11px 13px;background:var(--card)}
.pb.ok{background:var(--ok-soft);border-color:var(--ok-soft);border-left-color:var(--ok)}
.pb.no{background:var(--rd-soft);border-color:var(--rd-soft);border-left-color:var(--rd)}
.pt{display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:14.5px;line-height:1.3}
.pt span:last-child{color:var(--mu);font-size:12px;flex:none}
.pd{margin-top:10px;padding-top:10px;border-top:1px solid var(--bd);font-size:13px;color:var(--mu)}
.pd>b:first-child{display:block;margin-bottom:6px;font-weight:700;color:var(--tx);font-size:11px;letter-spacing:.02em}
.pd .pi{padding:4px 0 4px 10px;border-left:2px solid var(--bd)}
.pd .pg{display:block;margin-top:10px;font-weight:700;color:var(--tx);font-size:11px;letter-spacing:.02em}
.pn{margin-top:10px}.pn input{display:block;width:100%;max-width:180px;margin-top:4px;padding:7px 9px;box-sizing:border-box;font-family:var(--mono)}
main.wide{max-width:none!important;width:auto!important}
@media(max-width:600px){.pcol{flex:0 0 82vw;min-width:260px}}
`;document.head.appendChild(st)})();

// ===== Render =====
const NAV=[["dashboard","🏠","Dashboard",vDashboard],["pensum","📚","Pensum",vPensum],["cursos","🎓","Cursos",vCursos],["calendario","📅","Calendario",vCalendario],["proyectos","🛠","Proyectos",vProyectos],["notas","📝","Notas",vNotas],["estadisticas","📊","Estadísticas",vEstadisticas],["config","⚙️","Configuración",vConfig]];
function render(){const y=scrollY,x=scrollX,pz=document.querySelector(".pz"),pl=pz?pz.scrollLeft:0,m0=document.querySelector("main"),mt=m0?m0.scrollTop:0,v=NAV.find(n=>n[0]===view)||NAV[0];
$("app").innerHTML=`<header class="appbar"><button class="menu-toggle" aria-label="${menuOpen?"Cerrar":"Abrir"} menú" aria-controls="primary-nav" aria-expanded="${menuOpen}" onclick="toggleMenu()"><span></span><span></span><span></span></button><strong>Panel Académico</strong></header>${menuOpen?`<button class="nav-backdrop" aria-label="Cerrar menú" onclick="closeMenu()"></button>`:""}<nav id="primary-nav" class="${menuOpen?"open":""}" aria-label="Principal" ${menuOpen?"":"inert aria-hidden=\"true\""}><h1>🎓 Panel Académico</h1>${NAV.map(n=>`<a class="${n[0]===view?"on":""}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</a>`).join("")}</nav><main class="${view==="pensum"?"wide":""}">${v[3]()}</main>${modal()}${dayModal()}`;
const pz2=document.querySelector(".pz");if(pz2&&pl)pz2.scrollLeft=pl;const m1=document.querySelector("main");if(m1&&mt)m1.scrollTop=mt;
scrollTo({top:y,left:x,behavior:"instant"})}
function go(v){view=v;openC=null;openD=null;editN=-1;menuOpen=false;render();scrollTo(0,0)}
render();
