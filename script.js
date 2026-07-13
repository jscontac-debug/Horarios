const DAYS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"],K="planificadorTurnosMVP1";let S,G=null;
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)],uid=()=>Math.random().toString(36).slice(2);
function defaults(){return{store:{name:"Tienda ejemplo",agreement:"Perfil personalizado",start:"2026-09-01",end:"2026-09-30",preferred:6,rest:12,rotationType:"weekly",rotationMode:"flexible",opening:[
{day:"Lunes",start:"08:00",end:"21:00",desired:3,critical:2,open:true},{day:"Martes",start:"08:00",end:"21:00",desired:3,critical:2,open:true},{day:"Miércoles",start:"08:00",end:"21:00",desired:3,critical:2,open:true},{day:"Jueves",start:"08:00",end:"21:00",desired:3,critical:2,open:true},{day:"Viernes",start:"08:00",end:"21:00",desired:3,critical:2,open:true},{day:"Sábado",start:"08:00",end:"15:00",desired:3,critical:2,open:true},{day:"Domingo",start:"09:00",end:"14:30",desired:4,critical:3,open:true}]},
employees:"ABCDEFG".split("").map(n=>({name:n,hours:36,sunday:true,opening:true,closing:true,pref:"Rotativo"})).concat([{name:"H",hours:40,sunday:true,opening:true,closing:true,pref:"Rotativo"}]),absences:[],coverages:[],fixed:[],recurringConditions:[{id:uid(),days:[1,2,3,4,5],from:"20:00",to:"21:00",desired:3,critical:3}]}}
function load(){
 try{S=JSON.parse(localStorage.getItem(K))||defaults()}catch{S=defaults()}
 S.store.opening.forEach(r=>{if(r.desired==null)r.desired=r.min??3;if(r.critical==null)r.critical=Math.max(1,r.desired-1)});
 S.coverages=(S.coverages||[]).map(c=>({...c,desired:c.desired??c.people??4,critical:c.critical??Math.max(1,(c.people??4)-1)}));
 S.fixed=(S.fixed||[]).map(f=>({...f,type:f.type||"Obligatoria",repeat:f.repeat||(f.weekly?"Semanal":"Puntual")}));S.recurringConditions=S.recurringConditions||[];
 render();
}
function save(){localStorage.setItem(K,JSON.stringify(S))}
function tab(id){$$("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));$$(".panel").forEach(p=>p.classList.toggle("active",p.id===id));if(id==="generate")summary()}
$$("nav button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function render(){renderConfig();renderEmployees();renderAbs();renderCov();renderFixed();renderRecurringConditions();summary();if(G)renderResult()}
function renderConfig(){
 storeName.value=S.store.name;
 agreement.value=S.store.agreement;
 startDate.value=S.store.start;
 endDate.value=S.store.end;
 preferred.value=S.store.preferred;
 restHours.value=S.store.rest;
 rotationType.value=S.store.rotationType||"weekly";
 rotationMode.value=S.store.rotationMode||"flexible";

 $("#opening tbody").innerHTML=S.store.opening.map((r,i)=>`<tr>
   <td>${r.day}</td>
   <td><input type="time" data-o="${i}" data-k="start" value="${r.start||""}"></td>
   <td>
     <div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap">
       <input type="time" data-o="${i}" data-k="end" value="${r.end||""}">
       <button type="button" class="secondary clear-hours" data-clear-o="${i}">Sin horario</button>
     </div>
   </td>
   <td><input type="number" min="0" data-o="${i}" data-k="desired" value="${r.desired??r.min??3}"></td>
   <td><input type="number" min="0" data-o="${i}" data-k="critical" value="${r.critical??Math.max(1,(r.min??3)-1)}"></td>
 </tr>`).join("");

 $$("[data-clear-o]").forEach(b=>b.onclick=()=>{
   const i=+b.dataset.clearO;
   const start=document.querySelector(`[data-o="${i}"][data-k="start"]`);
   const end=document.querySelector(`[data-o="${i}"][data-k="end"]`);
   start.value="";
   end.value="";
   S.store.opening[i].start="";
   S.store.opening[i].end="";
   S.store.opening[i].open=false;
 });
}
saveConfig.onclick=()=>{
 S.store.name=storeName.value||"Tienda";
 S.store.agreement=agreement.value;
 S.store.start=startDate.value;
 S.store.end=endDate.value;
 S.store.preferred=+preferred.value||6;
 S.store.rest=+restHours.value||12;
 S.store.rotationType=rotationType.value;
 S.store.rotationMode=rotationMode.value;

 $$("[data-o][data-k]").forEach(x=>{
   const row=S.store.opening[+x.dataset.o];
   row[x.dataset.k]=["desired","critical","min"].includes(x.dataset.k)?+x.value:x.value;
 });

 S.store.opening.forEach(r=>{
   r.open=Boolean(r.start&&r.end);
 });

 save();
 msg("Configuración guardada","ok");
}
function renderEmployees(){$("#employeesTable tbody").innerHTML=S.employees.map((e,i)=>`<tr><td><input data-e=${i} data-k=name value="${e.name}"></td><td><input type=number data-e=${i} data-k=hours value=${e.hours}></td><td><input type=checkbox data-e=${i} data-k=sunday ${e.sunday?"checked":""}></td><td><input type=checkbox data-e=${i} data-k=opening ${e.opening?"checked":""}></td><td><input type=checkbox data-e=${i} data-k=closing ${e.closing?"checked":""}></td><td><select data-e=${i} data-k=pref>${["Rotativo","Mañana","Tarde","Indiferente"].map(x=>`<option ${x===e.pref?"selected":""}>${x}</option>`)}</select></td><td><button class=delete data-de=${i}>Eliminar</button></td></tr>`).join("");$$("[data-de]").forEach(b=>b.onclick=()=>{S.employees.splice(+b.dataset.de,1);renderEmployees()})}
addEmployee.onclick=()=>{S.employees.push({name:"Nueva",hours:40,sunday:true,opening:true,closing:true,pref:"Rotativo"});renderEmployees()}
saveEmployees.onclick=()=>{$$("#employeesTable [data-e]").forEach(x=>{let e=S.employees[+x.dataset.e];e[x.dataset.k]=x.type==="checkbox"?x.checked:(x.dataset.k==="hours"?+x.value:x.value)});save();msg("Empleados guardados","ok")}
function opts(v){return S.employees.map(e=>`<option ${e.name===v?"selected":""}>${e.name}</option>`).join("")}
function renderAbs(){$("#absences tbody").innerHTML=S.absences.map((a,i)=>`<tr><td><select data-a=${i} data-k=employee>${opts(a.employee)}</select></td><td><input type=date data-a=${i} data-k=from value=${a.from}></td><td><input type=date data-a=${i} data-k=to value=${a.to}></td><td><select data-a=${i} data-k=type>${["Vacaciones","Baja","Permiso","No disponible"].map(x=>`<option ${x===a.type?"selected":""}>${x}</option>`)}</select></td><td><button class=delete data-da=${i}>Eliminar</button></td></tr>`).join("");$$("[data-da]").forEach(b=>b.onclick=()=>{S.absences.splice(+b.dataset.da,1);renderAbs()})}
addAbsence.onclick=()=>{S.absences.push({id:uid(),employee:S.employees[0]?.name||"",from:S.store.start,to:S.store.start,type:"Vacaciones"});renderAbs()}
function renderCov(){$("#coverages tbody").innerHTML=S.coverages.map((c,i)=>`<tr><td><input type=date data-c=${i} data-k=date value=${c.date}></td><td><input type=time data-c=${i} data-k=from value=${c.from}></td><td><input type=time data-c=${i} data-k=to value=${c.to}></td><td><input type=number data-c=${i} data-k=desired value=${c.desired}></td><td><input type=number data-c=${i} data-k=critical value=${c.critical}></td><td><button class=delete data-dc=${i}>Eliminar</button></td></tr>`).join("");$$("[data-dc]").forEach(b=>b.onclick=()=>{S.coverages.splice(+b.dataset.dc,1);renderCov()})}
addCoverage.onclick=()=>{S.coverages.push({id:uid(),date:S.store.start,from:"08:00",to:"15:00",desired:4,critical:2});renderCov()}
function renderFixed(){$("#fixed tbody").innerHTML=S.fixed.map((f,i)=>`<tr><td><select data-f=${i} data-k=employee>${opts(f.employee)}</select></td><td><input type=date data-f=${i} data-k=date value=${f.date}></td><td><input type=time data-f=${i} data-k=start value=${f.start}></td><td><input type=time data-f=${i} data-k=end value=${f.end}></td><td><select data-f=${i} data-k=type><option ${f.type==="Obligatoria"?"selected":""}>Obligatoria</option><option ${f.type==="Preferente"?"selected":""}>Preferente</option></select></td><td><select data-f=${i} data-k=repeat>${["Puntual","Semanal","Quincenal","Mensual"].map(x=>`<option ${f.repeat===x?"selected":""}>${x}</option>`).join("")}</select></td><td><button class=delete data-df=${i}>Eliminar</button></td></tr>`).join("");$$("[data-df]").forEach(b=>b.onclick=()=>{S.fixed.splice(+b.dataset.df,1);renderFixed()})}
addFixed.onclick=()=>{S.fixed.push({id:uid(),employee:S.employees[0]?.name||"",date:S.store.start,start:"08:00",end:"14:00",type:"Obligatoria",repeat:"Puntual"});renderFixed()}

function renderRecurringConditions(){
 const labels=["L","M","X","J","V","S","D"];
 recurringConditions.querySelector("tbody").innerHTML=(S.recurringConditions||[]).map((c,i)=>`<tr>
 <td><div class="days-picker">${labels.map((lab,idx)=>`<label><input type="checkbox" data-r="${i}" data-day="${idx+1}" ${c.days.includes(idx+1)?"checked":""}>${lab}</label>`).join("")}</div></td>
 <td><input type="time" data-r="${i}" data-k="from" value="${c.from}"></td>
 <td><input type="time" data-r="${i}" data-k="to" value="${c.to}"></td>
 <td><input type="number" min="0" data-r="${i}" data-k="desired" value="${c.desired}"></td>
 <td><input type="number" min="0" data-r="${i}" data-k="critical" value="${c.critical}"></td>
 <td><button class="delete" data-dr="${i}">Eliminar</button></td></tr>`).join("");
 $$("[data-dr]").forEach(b=>b.onclick=()=>{S.recurringConditions.splice(+b.dataset.dr,1);renderRecurringConditions()});
}
addRecurringCondition.onclick=()=>{S.recurringConditions.push({id:uid(),days:[1,2,3,4,5],from:"20:00",to:"21:00",desired:3,critical:3});renderRecurringConditions()};
saveRules.onclick=()=>{
 [["a","absences"],["c","coverages"],["f","fixed"]].forEach(([p,k])=>$$(`[data-${p}]`).forEach(x=>S[k][+x.dataset[p]][x.dataset.k]=x.type==="checkbox"?x.checked:(["people","desired","critical"].includes(x.dataset.k)?+x.value:x.value)));
 (S.recurringConditions||[]).forEach((c,i)=>{c.days=$$(`[data-r="${i}"][data-day]`).filter(x=>x.checked).map(x=>+x.dataset.day)});
 $$(`[data-r][data-k]`).forEach(x=>{const c=S.recurringConditions[+x.dataset.r];c[x.dataset.k]=["desired","critical"].includes(x.dataset.k)?+x.value:x.value});
 save();msg("Condiciones guardadas","ok");
}
function dates(a,b){let r=[],d=new Date(a+"T00:00"),e=new Date(b+"T00:00");for(;d<=e;d.setDate(d.getDate()+1))r.push(new Date(d));return r}function iso(d){
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}function min(t){let[a,b]=t.split(":").map(Number);return a*60+b}function tm(m){return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}function hrs(a,b){return(min(b)-min(a))/60}function wk(d){let x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));x.setUTCDate(x.getUTCDate()+4-(x.getUTCDay()||7));let y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return `${x.getUTCFullYear()}-${Math.ceil((((x-y)/864e5)+1)/7)}`}function rule(d){return S.store.opening[(d.getDay()+6)%7]}function absent(e,d){return S.absences.some(a=>a.employee===e&&d>=a.from&&d<=a.to)}function fixedFor(e,d){
 let ds=iso(d);
 return S.fixed.find(f=>{
   if(f.employee!==e)return false;
   const fd=new Date(f.date+"T00:00");
   if(f.repeat==="Puntual")return f.date===ds;
   if(f.repeat==="Semanal")return fd.getDay()===d.getDay()&&ds>=f.date;
   if(f.repeat==="Quincenal"){
     const diff=Math.floor((d-fd)/86400000);
     return diff>=0&&diff%14===0;
   }
   if(f.repeat==="Mensual")return fd.getDate()===d.getDate()&&ds>=f.date;
   return f.date===ds;
 });
}
function needLevel(d,m,level){
 const r=rule(d);let n=level==="critical"?(r.critical??Math.max(1,r.desired-1)):(r.desired??r.min??3);
 S.coverages.filter(c=>c.date===iso(d)).forEach(c=>{if(m>=min(c.from)&&m<min(c.to))n=Math.max(n,level==="critical"?c.critical:c.desired)});
 const weekday=d.getDay()===0?7:d.getDay();
 (S.recurringConditions||[]).forEach(c=>{if(c.days.includes(weekday)&&m>=min(c.from)&&m<min(c.to))n=Math.max(n,level==="critical"?c.critical:c.desired)});
 return n;
}

function rotationPeriodKey(d){
 const t=S.store.rotationType||"weekly";
 if(t==="daily")return iso(d);
 if(t==="weekly")return wk(d);
 if(t==="biweekly"){let a=wk(d).split("-");return a[0]+"-Q"+Math.ceil((+a[1])/2)}
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function preferredBand(emp,d){
 if((S.store.rotationType||"weekly")==="daily")return null;
 const seed=[...emp].reduce((a,c)=>a+c.charCodeAt(0),0)+(rotationPeriodKey(d).match(/\d+/g)||["0"]).reduce((a,n)=>a+(+n),0);
 return seed%2===0?"morning":"afternoon";
}
function rotationPenalty(emp,d,sh,r){
 const band=preferredBand(emp.name,d);if(!band)return 0;
 const middle=(min(r.start)+min(r.end))/2,shiftMiddle=(min(sh.start)+min(sh.end))/2;
 const ok=band==="morning"?shiftMiddle<=middle:shiftMiddle>=middle;
 return ok?0:((S.store.rotationMode||"flexible")==="strict"?10000:30);
}
function candidates(r,slot){
 let st=min(r.start),en=min(r.end),du=Math.round(S.store.preferred*60),o=[];
 let add=(a,b)=>{
   if(a>=st&&b<=en&&b>a&&slot>=a&&slot<b){
     o.push({start:tm(a),end:tm(b),hours:(b-a)/60});
   }
 };
 if(en-st<=du){
   add(st,en);
 }else{
   add(st,st+du);
   add(en-du,en);
   let a=Math.min(Math.max(slot,st),en-du);
   add(a,a+du);
   let centered=Math.max(st,Math.min(slot-Math.floor(du/2),en-du));
   add(centered,centered+du);
 }
 return o.filter((x,i,a)=>a.findIndex(y=>y.start===x.start&&y.end===x.end)===i);
}
function generate(){
 saveConfig.click();saveEmployees.click();saveRules.click();
 let ds=dates(S.store.start,S.store.end),A={},W={},C={},warnings=[];
 S.employees.forEach(e=>C[e.name]={open:0,close:0,sunday:0});
 let key=(d,e)=>iso(d)+"|"+e;
 let add=(d,e,s,r)=>{
   A[key(d,e)]=s;let w=wk(d);W[e]??={};W[e][w]=(W[e][w]||0)+s.hours;
   if(s.start===r.start)C[e].open++;if(s.end===r.end)C[e].close++;if(d.getDay()===0)C[e].sunday++;
 };
 function chooseAndAdd(d,r,slots,act,targetLevel){
   let guard=0;
   while(slots.some(x=>act[x]<needLevel(d,x,targetLevel))&&guard++<150){
     let slot=slots.find(x=>act[x]<needLevel(d,x,targetLevel)),best=null;
     for(let e of S.employees){
       if(A[key(d,e.name)]||absent(e.name,iso(d))||(d.getDay()===0&&!e.sunday))continue;
       for(let sh of candidates(r,slot)){
         if(sh.start===r.start&&!e.opening)continue;if(sh.end===r.end&&!e.closing)continue;
         let h=W[e.name]?.[wk(d)]||0;
         let score=h*10+Math.max(0,h+sh.hours-e.hours)*100+
           C[e.name].open*(sh.start===r.start?4:0)+C[e.name].close*(sh.end===r.end?4:0)+
           C[e.name].sunday*(d.getDay()===0?15:0)+rotationPenalty(e,d,sh,r);
         const preferred=fixedFor(e.name,d);
         if(preferred&&preferred.type==="Preferente"&&sh.start===preferred.start&&sh.end===preferred.end)score-=100;
         if(!best||score<best.score)best={e,sh,score};
       }
     }
     if(!best){warnings.push(`${iso(d)} ${tm(slot)}: no se puede alcanzar la cobertura ${targetLevel==="critical"?"mínima crítica":"deseada"}`);break}
     add(d,best.e.name,best.sh,r);
     slots.forEach(x=>{if(x>=min(best.sh.start)&&x<min(best.sh.end))act[x]++});
   }
 }
 for(let d of ds){
   let r=rule(d);if(!r.open)continue;
   let slots=[];for(let m=min(r.start);m<min(r.end);m+=30)slots.push(m);
   let act=Object.fromEntries(slots.map(x=>[x,0]));
   // Primero: asignaciones obligatorias.
   for(let e of S.employees){
     let f=fixedFor(e.name,d);if(!f||f.type!=="Obligatoria")continue;
     if(absent(e.name,iso(d))){warnings.push(`${iso(d)}: ${e.name} tiene asignación obligatoria y ausencia`);continue}
     let sh={start:f.start,end:f.end,hours:hrs(f.start,f.end),fixed:true};
     add(d,e.name,sh,r);slots.forEach(x=>{if(x>=min(sh.start)&&x<min(sh.end))act[x]++});
   }
   // Segunda pasada global: mínimo crítico en toda la jornada.
   chooseAndAdd(d,r,slots,act,"critical");
   // Tercera pasada: completar la cobertura deseada.
   chooseAndAdd(d,r,slots,act,"desired");
 }
 G={dates:ds,A,W,C,warnings};renderResult();tab("result");
}
function validate(){
 let errors=[],warnings=[...(G?.warnings||[])];if(!G)return{errors:["No hay cuadrante"],warnings};
 for(let d of G.dates){
   let r=rule(d);if(!r.open)continue;
   for(let m=min(r.start);m<min(r.end);m+=30){
     let c=S.employees.filter(e=>{let sh=G.A[iso(d)+"|"+e.name];return sh&&m>=min(sh.start)&&m<min(sh.end)}).length;
     let critical=needLevel(d,m,"critical"),desired=needLevel(d,m,"desired");
     if(c<critical)errors.push(`${iso(d)} ${tm(m)}: ${c}/${critical} mínimo crítico`);
     else if(c<desired)warnings.push(`${iso(d)} ${tm(m)}: ${c}/${desired} cobertura deseada`);
   }
 }
 for(let e of S.employees)Object.entries(G.W[e.name]||{}).forEach(([w,h])=>{if(Math.abs(h-e.hours)>.01)warnings.push(`${e.name}, semana ${w}: ${h.toFixed(1)} h / ${e.hours} h`)});
 return{errors,warnings};
}
function renderResult(){let h=`<thead><tr><th>Persona</th>${G.dates.map(d=>`<th class=${d.getDay()===0?"sunday":""}>${d.getDate()}<br>${DAYS[(d.getDay()+6)%7].slice(0,2)}</th>`).join("")}<th>Total</th></tr></thead>`,b=S.employees.map(e=>{let t=0,c=G.dates.map(d=>{let s=G.A[iso(d)+"|"+e.name];if(s)t+=s.hours;return`<td class="${s?"":"free"} ${d.getDay()===0?"sunday":""}">${s?s.start+"-"+s.end:"LIBRE"}</td>`}).join("");return`<tr><th>${e.name}</th>${c}<th>${t.toFixed(1)}</th></tr>`}).join("");schedule.innerHTML=h+"<tbody>"+b+"</tbody>";renderWeekly();renderValidation();setupWeekSelector();renderWeeklyGraphic()}
function renderWeekly(){let ws=[...new Set(G.dates.map(wk))];weekly.innerHTML=`<thead><tr><th>Persona</th><th>Contrato</th>${ws.map(x=>`<th>${x}</th>`).join("")}<th>Dom</th><th>Apert.</th><th>Cierres</th></tr></thead><tbody>`+S.employees.map(e=>`<tr><th>${e.name}</th><td>${e.hours}</td>${ws.map(x=>{let h=G.W[e.name]?.[x]||0;return`<td class=${Math.abs(h-e.hours)<.01?"valid":"invalid"}>${h.toFixed(1)}</td>`}).join("")}<td>${G.C[e.name].sunday}</td><td>${G.C[e.name].open}</td><td>${G.C[e.name].close}</td></tr>`).join("")+"</tbody>"}
function renderValidation(){let v=validate(),x="";if(!v.errors.length&&!v.warnings.length)x='<div class="msg ok">Cuadrante válido según las reglas configuradas.</div>';if(v.errors.length)x+=`<div class="msg error"><b>Errores:</b><br>${v.errors.slice(0,15).join("<br>")}</div>`;if(v.warnings.length)x+=`<div class="msg warn"><b>Avisos:</b><br>${v.warnings.slice(0,20).join("<br>")}</div>`;validation.innerHTML=x}

let currentWeekIndex=0;
function getWeekGroups(){
 if(!G)return[];
 const map=new Map();
 G.dates.forEach(d=>{const k=wk(d);if(!map.has(k))map.set(k,[]);map.get(k).push(d)});
 return [...map.entries()].map(([key,dates])=>({key,dates}));
}
function setupWeekSelector(){
 const groups=getWeekGroups();if(!groups.length)return;
 weekSelect.innerHTML=groups.map((g,i)=>`<option value="${i}">${g.key}</option>`).join("");
 currentWeekIndex=Math.min(currentWeekIndex,groups.length-1);weekSelect.value=currentWeekIndex;
 weekSelect.onchange=()=>{currentWeekIndex=+weekSelect.value;renderWeeklyGraphic()};
}
function renderWeeklyGraphic(){
 if(!G)return;const groups=getWeekGroups();if(!groups.length)return;
 currentWeekIndex=Math.max(0,Math.min(currentWeekIndex,groups.length-1));
 const g=groups[currentWeekIndex];weekSelect.value=currentWeekIndex;
 weekTitle.textContent=`Semana ${g.key.split("-")[1]} · ${iso(g.dates[0])} a ${iso(g.dates[g.dates.length-1])}`;
 weeklyGraphic.innerHTML=g.dates.map(renderDayGraphic).join("");
}
function renderDayGraphic(d){
 const r=rule(d);if(!r.open)return `<div class="week-day-block"><div class="week-day-header"><span>${DAYS[(d.getDay()+6)%7]}</span><span>${iso(d)} · Cerrado</span></div></div>`;
 const slots=[];for(let m=min(r.start);m<min(r.end);m+=30)slots.push(m);
 const rows=S.employees.map(e=>{
  const sh=G.A[iso(d)+"|"+e.name],isAbs=absent(e.name,iso(d));
  return `<tr><th class="employee-col">${e.name}</th>${slots.map(m=>{
   let cls="off",txt="";
   if(isAbs){cls="absent";txt="A"}
   else if(sh&&m>=min(sh.start)&&m<min(sh.end)){cls="working"+(fixedFor(e.name,d)?" fixed":"");txt="1"}
   return `<td class="${cls}">${txt}</td>`;
  }).join("")}<td class="total-col">${sh?sh.hours.toFixed(2):"0,00"}</td></tr>`;
 }).join("");
 const assigned=slots.map(m=>S.employees.filter(e=>{const sh=G.A[iso(d)+"|"+e.name];return sh&&m>=min(sh.start)&&m<min(sh.end)}).length);
 const required=slots.map(m=>needLevel(d,m,"desired"));const critical=slots.map(m=>needLevel(d,m,"critical"));
 const totalAssigned=`<tr><th class="employee-col">TOTAL ASIGNADO</th>${assigned.map((n,i)=>`<td class="${n<critical[i]?"cover-error":n<required[i]?"cover-warn":"cover-ok"}">${n}</td>`).join("")}<td class="total-col">${(assigned.reduce((a,b)=>a+b,0)/2).toFixed(2)}</td></tr>`;
 const totalRequired=`<tr><th class="employee-col">COBERTURA DESEADA</th>${required.map(n=>`<td>${n}</td>`).join("")}<td class="total-col">—</td></tr>`;
 const totalHours=S.employees.reduce((a,e)=>a+(G.A[iso(d)+"|"+e.name]?.hours||0),0);
 const deficits=assigned.filter((n,i)=>n<critical[i]).length;
 return `<div class="week-day-block"><div class="week-day-header"><span>${DAYS[(d.getDay()+6)%7]}</span><span>${iso(d)}</span></div>
 <div class="week-grid-wrap"><table class="week-grid"><thead><tr><th class="employee-col">Empleado/a</th>${slots.map(m=>`<th class="slot-head">${tm(m)}<br>${tm(m+30)}</th>`).join("")}<th class="total-col">Horas</th></tr></thead><tbody>${rows}${totalAssigned}${totalRequired}<tr><th class="employee-col">MÍNIMO CRÍTICO</th>${critical.map(n=>`<td>${n}</td>`).join("")}<td class="total-col">—</td></tr></tbody></table></div>
 <div class="week-summary"><div>Horas asignadas<strong>${totalHours.toFixed(2)}</strong></div><div>Máximo simultáneo<strong>${Math.max(...assigned)}</strong></div><div>Mínimo simultáneo<strong>${Math.min(...assigned)}</strong></div><div>Franjas con déficit<strong>${deficits}</strong></div></div></div>`;
}
monthlyViewBtn.onclick=()=>{monthlyView.classList.remove("hidden");weeklyView.classList.add("hidden");monthlyViewBtn.classList.add("active");weeklyViewBtn.classList.remove("active")};
weeklyViewBtn.onclick=()=>{weeklyView.classList.remove("hidden");monthlyView.classList.add("hidden");weeklyViewBtn.classList.add("active");monthlyViewBtn.classList.remove("active");renderWeeklyGraphic()};
prevWeekBtn.onclick=()=>{currentWeekIndex=Math.max(0,currentWeekIndex-1);renderWeeklyGraphic()};
nextWeekBtn.onclick=()=>{currentWeekIndex=Math.min(getWeekGroups().length-1,currentWeekIndex+1);renderWeeklyGraphic()};
function summary(){let n=dates(S.store.start,S.store.end).length;summary.innerHTML=[["Periodo",n+" días"],["Empleados",S.employees.length],["Ausencias",S.absences.length],["Condiciones",S.recurringConditions.length]].map(x=>`<div>${x[0]}<strong>${x[1]}</strong></div>`).join("")}
function exportCSV(){if(!G)return;let r=[["Persona",...G.dates.map(iso),"Total"]];S.employees.forEach(e=>{let t=0,a=[e.name];G.dates.forEach(d=>{let s=G.A[iso(d)+"|"+e.name];a.push(s?s.start+"-"+s.end:"LIBRE");if(s)t+=s.hours});a.push(t.toFixed(1));r.push(a)});let csv="\uFEFF"+r.map(x=>x.map(y=>`"${String(y).replaceAll('"','""')}"`).join(";")).join("\n"),a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="cuadrante.csv";a.click()}
function msg(t,c){messages.innerHTML=`<div class="msg ${c}">${t}</div>`}
generateBtn.onclick=generate;validateBtn.onclick=renderValidation;exportBtn.onclick=exportCSV;printBtn.onclick=()=>print();reset.onclick=()=>{if(confirm("¿Restablecer el ejemplo?")){S=defaults();G=null;save();render();tab("config")}};load();
let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;installBtn.classList.remove("hidden")});
installBtn.onclick=async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installBtn.classList.add("hidden")};
