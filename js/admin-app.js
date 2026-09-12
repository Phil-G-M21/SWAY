/* ═══════════════════════════════════════════════════════════
   SWAY — Unified Admin App
   One dashboard: Orders, Inventory, Finance, Products,
   Add Series, Site Images. Loaded after admin login (guard).
═══════════════════════════════════════════════════════════ */
const PRODUCT_BUCKET = 'product-images';
const SITE_BUCKET = 'store-images';
let PRODUCTS = [];
let ORDERS = [];
const fileStore = {};

function toast(m){ const t=document.getElementById('toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sb-overlay').classList.toggle('open'); }
async function adminSignOut(){ await sway_db.auth.signOut(); location.reload(); }

function adminNav(name, btn){
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');
  if(window.innerWidth<=860) toggleSidebar();
  // load the section's data
  if(name==='orders') renderOrders();
  if(name==='inventory') renderInventory();
  if(name==='finance') renderFinance();
  if(name==='products') renderProducts();
  if(name==='addseries') renderAddSeries();
  if(name==='siteimages') renderSiteImages();
}

async function loadProducts(){
  const { data } = await sway_db.from('products').select('*').order('id');
  PRODUCTS = data || [];
}
async function loadOrders(){
  const { data } = await sway_db.from('orders').select('*').order('created_at',{ascending:false});
  ORDERS = data || [];
}

/* ══ ORDERS ══════════════════════════════════════════════ */
async function renderOrders(){
  const el = document.getElementById('sec-orders');
  el.innerHTML = `<div class="page-head">Orders</div><div class="page-sub">Confirm payments, mark shipped and delivered.</div>
    <div class="toolbar">
      <button class="btn btn-ghost" onclick="renderOrders()">Refresh</button>
      <select id="ord-filter" class="btn btn-ghost" onchange="renderOrders()" style="cursor:pointer">
        <option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option>
      </select>
    </div><div id="orders-body">Loading...</div>`;
  await loadOrders();
  const filter = (document.getElementById('ord-filter')||{}).value || 'all';
  const list = filter==='all' ? ORDERS : ORDERS.filter(o=>(o.status||'pending')===filter);
  const body = document.getElementById('orders-body');
  if(!list.length){ body.innerHTML='<p style="color:#777;padding:20px 0">No orders'+(filter!=='all'?' ('+filter+')':'')+'.</p>'; return; }
  body.innerHTML = list.map(o=>{
    const items=(o.items||[]).map(i=>`${i.qty}x ${i.name} (${i.color||''} ${i.size||''})`).join(', ');
    const st=o.status||'pending';
    return `<div class="admin-order">
      <div class="ao-head"><div><span class="ao-ref">${o.order_ref||('#'+o.id)}</span><span class="ao-status ao-${st}">${st}</span></div><span class="ao-total">GHS ${o.total}</span></div>
      <div class="ao-ref-line"><b>Reference:</b> ${o.username||'—'} · <b>Paid from:</b> ${o.ship_phone||'—'}</div>
      <div class="ao-items">${items}</div>
      <div class="ao-ship"><b>Ship to:</b> ${o.ship_name||''} — ${o.ship_address||''}</div>
      <div class="ao-date">${new Date(o.created_at).toLocaleString()}</div>
      <div class="ao-actions">
        ${st==='pending'?`<button class="ao-btn ao-confirm" onclick="ordStatus(${o.id},'paid')">Confirm Payment</button>`:''}
        ${st==='paid'?`<button class="ao-btn ao-ship-btn" onclick="ordShip(${o.id})">Mark Shipped</button>`:''}
        ${st==='shipped'?`<button class="ao-btn ao-deliver" onclick="ordStatus(${o.id},'delivered')">Mark Delivered</button>`:''}
        ${(st!=='delivered'&&st!=='cancelled')?`<button class="ao-btn ao-cancel" onclick="ordStatus(${o.id},'cancelled')">Cancel</button>`:''}
      </div></div>`;
  }).join('');
}
async function ordStatus(id,status){ const {error}=await sway_db.from('orders').update({status}).eq('id',id); if(error){toast('Failed: '+error.message);return;} toast('Marked '+status); renderOrders(); }
async function ordShip(id){ const t=prompt('Tracking note (optional, shown to customer):',''); const u={status:'shipped'}; if(t)u.tracking=t; const {error}=await sway_db.from('orders').update(u).eq('id',id); if(error){toast('Failed: '+error.message);return;} toast('Marked shipped'); renderOrders(); }

/* ══ INVENTORY ═══════════════════════════════════════════ */
async function renderInventory(){
  const el=document.getElementById('sec-inventory');
  await loadProducts();
  const LOW=3;
  const lowCount=PRODUCTS.filter(p=>(p.stock??0)<=LOW).length;
  const totalStock=PRODUCTS.reduce((s,p)=>s+(p.stock??0),0);
  el.innerHTML=`<div class="page-head">Inventory</div><div class="page-sub">Stock per variant. Low-stock warnings at ${LOW} or fewer.</div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-num">${PRODUCTS.length}</div><div class="stat-label">Variants</div></div>
      <div class="stat-card"><div class="stat-num">${totalStock}</div><div class="stat-label">Total Units</div></div>
      <div class="stat-card"><div class="stat-num" style="color:${lowCount?'#c0392b':'#1a7f4b'}">${lowCount}</div><div class="stat-label">Low Stock</div></div>
    </div>
    <div id="inv-body"></div>`;
  const body=document.getElementById('inv-body');
  body.innerHTML=PRODUCTS.map(p=>{
    const stock=p.stock??0; const low=stock<=LOW;
    return `<div class="inv-row ${low?'inv-low':''}">
      <div class="inv-info"><span class="inv-name">${p.name} — ${p.color}</span><span class="inv-meta">${p.gender} · ${p.series}</span></div>
      ${low?`<span class="inv-warn">Low</span>`:''}
      <div class="inv-edit"><label>Stock</label><input type="number" id="inv-${p.id}" value="${stock}"><button class="inv-save" onclick="saveStock(${p.id})">Save</button></div>
    </div>`;
  }).join('');
}
async function saveStock(id){ const v=parseInt(document.getElementById('inv-'+id).value)||0; const {error}=await sway_db.from('products').update({stock:v}).eq('id',id); if(error){toast('Failed');return;} toast('Stock updated'); renderInventory(); }

/* ══ FINANCE ═════════════════════════════════════════════ */
async function renderFinance(){
  const el=document.getElementById('sec-finance');
  await loadOrders();
  // Only paid/shipped/delivered count as revenue
  const earned=ORDERS.filter(o=>['paid','shipped','delivered'].includes(o.status));
  const revenue=earned.reduce((s,o)=>s+Number(o.total||0),0);
  const pending=ORDERS.filter(o=>o.status==='pending').length;
  const byStatus=['pending','paid','shipped','delivered','cancelled'].map(s=>({s,n:ORDERS.filter(o=>o.status===s).length}));
  // best sellers
  const tally={};
  earned.forEach(o=>(o.items||[]).forEach(i=>{ const k=i.name+' '+(i.color||''); tally[k]=(tally[k]||0)+(i.qty||0); }));
  const best=Object.entries(tally).sort((a,b)=>b[1]-a[1]).slice(0,8);
  // revenue over time (by day, last 14)
  const days={};
  earned.forEach(o=>{ const d=new Date(o.created_at).toLocaleDateString(); days[d]=(days[d]||0)+Number(o.total||0); });
  const dayEntries=Object.entries(days).slice(-14);
  const maxDay=Math.max(1,...dayEntries.map(d=>d[1]));

  el.innerHTML=`<div class="page-head">Finance</div><div class="page-sub">Revenue counts confirmed orders (paid, shipped, delivered).</div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-num">GHS ${revenue.toLocaleString()}</div><div class="stat-label">Revenue</div></div>
      <div class="stat-card"><div class="stat-num">${earned.length}</div><div class="stat-label">Confirmed Orders</div></div>
      <div class="stat-card"><div class="stat-num" style="color:#e0a800">${pending}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card"><div class="stat-num">GHS ${earned.length?Math.round(revenue/earned.length):0}</div><div class="stat-label">Avg Order</div></div>
    </div>
    <div class="fin-grid">
      <div class="fin-card"><h3>Revenue (last ${dayEntries.length} days)</h3>
        <div class="bars">${dayEntries.map(([d,v])=>`<div class="bar-col"><div class="bar" style="height:${Math.round(v/maxDay*100)}%" title="GHS ${v}"></div><span class="bar-lbl">${d.slice(0,5)}</span></div>`).join('')||'<p style="color:#999">No sales yet</p>'}</div>
      </div>
      <div class="fin-card"><h3>Best Sellers</h3>
        ${best.length?best.map(([n,q])=>`<div class="best-row"><span>${n}</span><span class="best-q">${q} sold</span></div>`).join(''):'<p style="color:#999">No sales yet</p>'}
      </div>
      <div class="fin-card"><h3>Orders by Status</h3>
        ${byStatus.map(x=>`<div class="best-row"><span style="text-transform:capitalize">${x.s}</span><span class="best-q">${x.n}</span></div>`).join('')}
      </div>
    </div>`;
}

/* boot after admin verified */
function onAdminReady(){ renderOrders(); }

/* ══ PRODUCTS ════════════════════════════════════════════ */
async function renderProducts(){
  const el=document.getElementById('sec-products');
  el.innerHTML=`<div class="page-head">Products</div><div class="page-sub">Photos, price, stock, description. Delete or remove image.</div>
    <div class="toolbar"><button class="btn btn-ghost" onclick="renderProducts()">Refresh</button></div>
    <div id="prod-body">Loading...</div>`;
  await loadProducts();
  const groups={}; PRODUCTS.forEach(p=>{(groups[p.design]=groups[p.design]||[]).push(p);});
  document.getElementById('prod-body').innerHTML=Object.entries(groups).map(([design,items])=>{
    const rows=items.map(v=>{
      const hasImg=v.img&&v.img.startsWith('http');
      return `<div class="prow ${hasImg?'done':''}">
        <div class="prow-top">
          <div class="prow-info"><div class="prow-name">${v.name} — ${v.color}</div><div class="prow-meta">${v.gender} · ${v.series}</div>${hasImg?'<div class="prow-has">Has photos</div>':''}</div>
          <div class="pdrops">${[0,1,2].map(i=>`<div class="pdrop" id="pd-${v.id}-${i}" onclick="document.getElementById('pf-${v.id}-${i}').click()"><div class="pd-plus">+</div><div class="pd-lbl">${['Front','Back','Model'][i]}</div><input type="file" id="pf-${v.id}-${i}" accept="image/*" hidden onchange="pPick(${v.id},${i},this)"></div>`).join('')}</div>
        </div>
        <div class="prow-edit">
          <div class="pef"><label>Price</label><input type="number" id="pp-${v.id}" value="${v.price}"></div>
          <div class="pef"><label>Stock</label><input type="number" id="ps-${v.id}" value="${v.stock??10}"></div>
          <div class="pef pef-desc"><label>Description</label><textarea id="pdsc-${v.id}" rows="2">${(v.description||'').replace(/</g,'&lt;')}</textarea></div>
          <button class="prow-details" onclick="pSaveDetails(${v.id})">Save Details</button>
        </div>
        <div class="prow-actions">
          <button class="prow-save" onclick="pSavePhotos(${v.id})">Save Photos</button>
          <button class="prow-imgdel" onclick="pRemoveImg(${v.id})">Remove Image</button>
          <button class="prow-del" onclick="pDelete(${v.id})">Delete Product</button>
        </div>
      </div>`;
    }).join('');
    return `<div class="pgroup"><div class="pgroup-head"><span class="pgroup-title">${items[0].name} (${items[0].series}) <span class="pgroup-count">${items.length}</span></span><button class="pgroup-del" onclick="pDeleteDesign('${design}')">Delete entire design</button></div>${rows}</div>`;
  }).join('');
}
function pPick(id,idx,input){ const f=input.files[0]; if(!f)return; if(!fileStore[id])fileStore[id]=[null,null,null]; fileStore[id][idx]=f; const r=new FileReader(); r.onload=e=>{const d=document.getElementById(`pd-${id}-${idx}`);d.classList.add('filled');let img=d.querySelector('img');if(!img){img=document.createElement('img');d.insertBefore(img,d.firstChild);}img.src=e.target.result;}; r.readAsDataURL(f); }
async function pSavePhotos(id){
  const files=fileStore[id]; if(!files||!files.some(Boolean)){toast('Add at least the front photo');return;}
  const v=PRODUCTS.find(x=>x.id===id);
  let base=`${v.design}-${v.gender}-${(v.shirt||'white').toLowerCase()}`; if(v.spark)base+='-'+v.spark.toLowerCase();
  const sfx=['','-2','-3']; const urls=[];
  try{
    for(let i=0;i<3;i++){ if(!files[i]){urls.push(null);continue;} const fn=base+sfx[i]+'.jpg'; const {error:ue}=await sway_db.storage.from(PRODUCT_BUCKET).upload(fn,files[i],{upsert:true,contentType:files[i].type||'image/jpeg'}); if(ue)throw new Error(ue.message); const {data:pub}=sway_db.storage.from(PRODUCT_BUCKET).getPublicUrl(fn); urls.push(pub.publicUrl+'?t='+Date.now()); }
    const mainImg=urls[0]||v.img; const {error}=await sway_db.from('products').update({img:mainImg,imgs:urls.filter(Boolean)}).eq('id',id); if(error)throw new Error(error.message);
    toast('Photos saved'); renderProducts();
  }catch(e){toast('Failed: '+e.message);}
}
async function pSaveDetails(id){ const price=parseInt(document.getElementById('pp-'+id).value)||0; const stock=parseInt(document.getElementById('ps-'+id).value)||0; const description=document.getElementById('pdsc-'+id).value.trim(); const {error}=await sway_db.from('products').update({price,stock,description}).eq('id',id); if(error){toast('Failed');return;} toast('Details saved'); renderProducts(); }
async function pRemoveImg(id){ const v=PRODUCTS.find(x=>x.id===id); if(!confirm(`Remove photos for "${v.name} — ${v.color}"? Product stays, goes back to placeholder.`))return; let base=`${v.design}-${v.gender}-${(v.shirt||'white').toLowerCase()}`; if(v.spark)base+='-'+v.spark.toLowerCase(); try{await sway_db.storage.from(PRODUCT_BUCKET).remove([base+'.jpg',base+'-2.jpg',base+'-3.jpg']);}catch(e){} const {error}=await sway_db.from('products').update({img:'',imgs:[]}).eq('id',id); if(error){toast('Failed');return;} toast('Photos removed'); renderProducts(); }
async function pDelete(id){ const v=PRODUCTS.find(x=>x.id===id); if(!confirm(`DELETE "${v.name} — ${v.color}" entirely? Only for products added by mistake. Use Remove Image to just change a photo.`))return; let base=`${v.design}-${v.gender}-${(v.shirt||'white').toLowerCase()}`; if(v.spark)base+='-'+v.spark.toLowerCase(); try{await sway_db.storage.from(PRODUCT_BUCKET).remove([base+'.jpg',base+'-2.jpg',base+'-3.jpg']);}catch(e){} const {error}=await sway_db.from('products').delete().eq('id',id); if(error){toast('Failed');return;} toast('Deleted'); renderProducts(); }
async function pDeleteDesign(design){ const items=PRODUCTS.filter(v=>v.design===design); if(!items.length)return; if(!confirm(`Delete entire "${items[0].name}" design? ALL ${items.length} variants and photos. Cannot be undone.`))return; const files=[]; items.forEach(v=>{let base=`${v.design}-${v.gender}-${(v.shirt||'white').toLowerCase()}`;if(v.spark)base+='-'+v.spark.toLowerCase();files.push(base+'.jpg',base+'-2.jpg',base+'-3.jpg');}); try{await sway_db.storage.from(PRODUCT_BUCKET).remove(files);}catch(e){} const {error}=await sway_db.from('products').delete().eq('design',design); if(error){toast('Failed');return;} toast('Design deleted'); renderProducts(); }

/* ══ ADD SERIES ══════════════════════════════════════════ */
let seriesColors=[];
function renderAddSeries(){
  const el=document.getElementById('sec-addseries');
  el.innerHTML=`<div class="page-head">Add a Series</div><div class="page-sub">Create a design and its colors. All variants get made automatically.</div>
    <div class="as-card">
      <div class="pef"><label>Series / Design Name</label><input id="as-name" placeholder="e.g. Phoenix" oninput="asSlug()"></div>
      <div class="pef"><label>Design slug</label><input id="as-slug" placeholder="phoenix"></div>
      <div class="pef"><label>Subtitle</label><input id="as-sub" value="Graphic Tee"></div>
      <div class="pef"><label>Base Price (GHS)</label><input id="as-price" type="number" value="100"></div>
      <div class="pef pef-desc"><label>Description</label><textarea id="as-desc" rows="2"></textarea></div>
      <div class="pef"><label>Stock per variant</label><input id="as-stock" type="number" value="10"></div>
      <div class="pef"><label>Genders</label><div class="as-chips"><span class="as-chip on" id="asg-women" onclick="this.classList.toggle('on');asPreview()">Women</span><span class="as-chip on" id="asg-men" onclick="this.classList.toggle('on');asPreview()">Men</span></div></div>
      <div class="pef" style="grid-column:1/-1"><label>Colors</label>
        <div class="as-colorlist" id="as-colorlist"></div>
        <div class="as-addcolor">
          <select id="as-shirt"><option>White</option><option>Black</option></select>
          <select id="as-spark"><option value="">Plain (no graphic color)</option><option>Orange</option><option>Blue</option><option>Pink</option><option>Green</option><option>Red</option><option>Purple</option></select>
          <button class="btn btn-add" onclick="asAddColor()">+ Add Color</button>
        </div>
      </div>
      <div class="as-preview" id="as-preview" style="grid-column:1/-1"></div>
      <button class="btn btn-add" style="grid-column:1/-1;padding:15px" onclick="asCreate()">Create Series &amp; Variants</button>
    </div>`;
  seriesColors=[]; asRenderColors(); asPreview();
}
function asSlug(){ const s=document.getElementById('as-slug'); if(!s.dataset.touched) s.value=document.getElementById('as-name').value.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); asPreview(); }
const _SPARKHEX={Orange:'#ff6b2b',Blue:'#3b8fff',Pink:'#e84a8a',Green:'#2ecc71',Red:'#e74c3c',Purple:'#9b59b6'};
const _SHIRTHEX={White:'#f2f2f2',Black:'#0a0a0a'};
function asAddColor(){ const shirt=document.getElementById('as-shirt').value; const spark=document.getElementById('as-spark').value; const label=spark?`${shirt} / ${spark}`:shirt; const hex=spark?_SPARKHEX[spark]:_SHIRTHEX[shirt]; if(seriesColors.some(c=>c.label===label)){toast('Already added');return;} seriesColors.push({shirt,spark,label,hex}); asRenderColors(); asPreview(); }
function asRmColor(i){ seriesColors.splice(i,1); asRenderColors(); asPreview(); }
function asRenderColors(){ document.getElementById('as-colorlist').innerHTML=seriesColors.map((c,i)=>`<div class="as-coloritem"><span class="as-dot" style="background:${c.hex}"></span>${c.label}<span class="as-rm" onclick="asRmColor(${i})">Remove</span></div>`).join('')||'<span style="font-size:12px;color:#999">No colors yet.</span>'; }
function asGenders(){ const g=[]; if(document.getElementById('asg-women').classList.contains('on'))g.push('women'); if(document.getElementById('asg-men').classList.contains('on'))g.push('men'); return g; }
function asPreview(){ const g=asGenders(); const total=g.length*seriesColors.length; const name=(document.getElementById('as-name')||{}).value?.trim()||'Series'; const el=document.getElementById('as-preview'); if(el)el.textContent=total?`Will create ${total} variant(s): ${name} in ${seriesColors.map(c=>c.label).join(', ')} for ${g.join(' & ')}.`:''; }
async function asCreate(){
  const name=document.getElementById('as-name').value.trim(); const slug=document.getElementById('as-slug').value.trim(); const g=asGenders();
  if(!name||!slug){toast('Name and slug required');return;} if(!g.length){toast('Pick a gender');return;} if(!seriesColors.length){toast('Add a color');return;}
  const sub=document.getElementById('as-sub').value.trim()||'Graphic Tee'; const price=parseInt(document.getElementById('as-price').value)||100; const stock=parseInt(document.getElementById('as-stock').value)||10; const desc=document.getElementById('as-desc').value.trim();
  try{
    await loadProducts(); const dupCheck=PRODUCTS.filter(p=>p.design===slug);
    const {data:maxRows}=await sway_db.from('products').select('id').order('id',{ascending:false}).limit(1); let nextId=(maxRows&&maxRows.length?maxRows[0].id:0)+1;
    const rows=[];
    g.forEach(gender=>seriesColors.forEach(c=>{ if(dupCheck.some(d=>d.gender===gender&&d.color===c.label))return; rows.push({id:nextId++,gender,series:slug,design:slug,name,subtitle:sub,shirt:c.shirt,spark:c.spark||null,color:c.label,color_hex:c.hex,price,is_new:true,is_best:false,img:'',imgs:[],description:desc,stock}); }));
    if(!rows.length){toast('Those variants already exist');return;}
    const {error}=await sway_db.from('products').insert(rows); if(error)throw new Error(error.message);
    toast(`Created ${rows.length} variants`); adminNav('products',document.querySelectorAll('.sb-item')[3]);
  }catch(e){toast('Failed: '+e.message);}
}

/* ══ SITE IMAGES ═════════════════════════════════════════ */
const SITE_SECTIONS=[
  {t:'Hero / Shop Panels — Men (1600x1000)',p:false,f:['wide1.jpg','wide2.jpg','wide3.jpg','wide4.jpg','wide5.jpg']},
  {t:'Hero / Shop Panels — Women (1600x1000)',p:false,f:['fwide1.jpg','fwide2.jpg','fwide3.jpg','fwide4.jpg','fwide5.jpg']},
  {t:'Model Shots — Men (1000x1400)',p:true,f:['model1.jpg','model2.jpg','model3.jpg','model4.jpg','model5.jpg']},
  {t:'Model Shots — Women (1000x1400)',p:true,f:['fmodel1.jpg','fmodel2.jpg','fmodel3.jpg','fmodel4.jpg','fmodel5.jpg']},
  {t:'Series Backgrounds (1200x800)',p:false,f:['series-spark.jpg','series-timechaos.jpg','series-marionette.jpg']},
  {t:'About Banner (1600x1000)',p:false,f:['about-hero.jpg']},
];
async function renderSiteImages(){
  const el=document.getElementById('sec-siteimages');
  el.innerHTML=`<div class="page-head">Site Images</div><div class="page-sub">Hero, model, series, about. Drop into a box, uploads automatically.</div><div id="si-body">Loading...</div>`;
  let existing=new Set();
  try{ const {data}=await sway_db.storage.from(SITE_BUCKET).list('',{limit:200}); existing=new Set((data||[]).map(f=>f.name)); }catch(e){}
  document.getElementById('si-body').innerHTML=SITE_SECTIONS.map(sec=>`
    <div class="si-sec"><h3>${sec.t}</h3><div class="si-slots">
      ${sec.f.map(fn=>`<div class="si-slot ${sec.p?'portrait':''}"><div class="si-drop ${existing.has(fn)?'filled':''}" id="sid-${fn}" onclick="document.getElementById('sif-${fn}').click()">${existing.has(fn)?`<img src="${SUPABASE_URL}/storage/v1/object/public/${SITE_BUCKET}/${fn}?t=${Date.now()}">`:'<div class="pd-plus">+</div>'}<input type="file" id="sif-${fn}" accept="image/*" hidden onchange="siUpload('${fn}',this)"></div><div class="si-fname">${fn}</div>${existing.has(fn)?`<div class="si-has">Uploaded <span class="si-rm" onclick="siRemove('${fn}')">Remove</span></div>`:''}</div>`).join('')}
    </div></div>`).join('');
}
async function siUpload(fn,input){ const f=input.files[0]; if(!f)return; toast('Uploading '+fn+'...'); try{ const {error}=await sway_db.storage.from(SITE_BUCKET).upload(fn,f,{upsert:true,contentType:f.type||'image/jpeg'}); if(error)throw new Error(error.message); toast(fn+' uploaded'); renderSiteImages(); }catch(e){toast('Failed: '+e.message);} }
async function siRemove(fn){ if(!confirm('Remove '+fn+'?'))return; try{ const {error}=await sway_db.storage.from(SITE_BUCKET).remove([fn]); if(error)throw new Error(error.message); toast('Removed'); renderSiteImages(); }catch(e){toast('Failed: '+e.message);} }
