<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>অনলাইন ফটো এডিটর</title>
<script src="https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}body{margin:0;font-family:'Hind Siliguri',Arial,sans-serif;background:#18181b;color:#eee;height:100vh;overflow:hidden}
button,input,select{font:inherit}.app{height:100vh;display:flex;flex-direction:column}
header{height:58px;background:#27272a;border-bottom:1px solid #3f3f46;display:flex;align-items:center;gap:8px;padding:8px 12px;flex-shrink:0}
.logo{font-size:19px;font-weight:700;margin-right:10px;white-space:nowrap}.spacer{flex:1}
.btn{background:#3f3f46;color:#fff;border:0;border-radius:7px;padding:7px 11px;cursor:pointer}.btn:hover{background:#52525b}.primary{background:#4f46e5}.danger{background:#b91c1c}
.workspace{display:flex;flex:1;min-height:0}.left,.right{width:235px;background:#27272a;border-right:1px solid #3f3f46;overflow:auto;padding:12px}.right{width:275px;border-right:0;border-left:1px solid #3f3f46}
.center{flex:1;min-width:0;display:flex;flex-direction:column;background:#111113}
.tools{display:grid;grid-template-columns:1fr 1fr;gap:7px}.tool{padding:10px 6px}.section{border-bottom:1px solid #3f3f46;padding-bottom:12px;margin-bottom:13px}.section h3{font-size:14px;margin:0 0 9px;color:#d4d4d8}
.stage{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:28px;background:repeating-conic-gradient(#202023 0 25%,#1a1a1d 0 50%) 0/24px 24px}
.canvas-wrap{box-shadow:0 12px 40px #0008;background:#fff}.status{height:32px;border-top:1px solid #3f3f46;padding:5px 12px;color:#a1a1aa;font-size:12px}
label{display:block;font-size:12px;color:#a1a1aa;margin:8px 0 4px}input[type=text],input[type=number],select{width:100%;background:#18181b;color:#fff;border:1px solid #52525b;border-radius:6px;padding:6px}
input[type=color]{width:100%;height:34px;padding:2px;background:#18181b;border:1px solid #52525b;border-radius:6px}
input[type=range]{width:100%}.row{display:flex;gap:7px}.row>*{flex:1}
.layer{display:flex;align-items:center;gap:5px;background:#18181b;border:1px solid #3f3f46;border-radius:6px;padding:6px;margin-bottom:5px;font-size:12px;cursor:pointer}.layer.active{border-color:#6366f1}.layer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.small{font-size:11px;color:#a1a1aa}.empty{color:#71717a;text-align:center;padding:20px}
.modal{position:fixed;inset:0;background:#0009;display:none;align-items:center;justify-content:center;z-index:10}.modal.show{display:flex}.dialog{width:min(420px,92vw);background:#27272a;border:1px solid #52525b;border-radius:12px;padding:18px}.dialog h2{margin-top:0}.toast{position:fixed;right:18px;bottom:45px;background:#27272a;border:1px solid #52525b;padding:9px 14px;border-radius:8px;display:none;z-index:20}
@media(max-width:900px){.left{width:175px}.right{width:220px}}@media(max-width:700px){.left,.right{display:none}header .optional{display:none}}
</style>
</head>
<body>
<div class="app">
<header>
  <div class="logo">🖼️ ফটো এডিটর</div>
  <button class="btn" onclick="document.getElementById('file').click()">📷 ছবি</button>
  <button class="btn" onclick="addText()">T টেক্সট</button>
  <button class="btn" onclick="undo()">↶</button><button class="btn" onclick="redo()">↷</button>
  <button class="btn optional" onclick="clearCanvas()">🗑️ পরিষ্কার</button>
  <div class="spacer"></div>
  <button class="btn" onclick="zoomOut()">−</button><span id="zoomText">65%</span><button class="btn" onclick="zoomIn()">+</button>
  <button class="btn primary" onclick="openExport()">⬇ Export</button>
</header>

<div class="workspace">
<aside class="left">
  <div class="section">
    <h3>টুলস</h3>
    <div class="tools">
      <button class="btn tool" onclick="addText()">✏️ টেক্সট</button>
      <button class="btn tool" onclick="addRect()">▭ আয়তক্ষেত্র</button>
      <button class="btn tool" onclick="addCircle()">● বৃত্ত</button>
      <button class="btn tool" onclick="addTriangle()">△ ত্রিভুজ</button>
      <button class="btn tool" onclick="addLine()">╱ রেখা</button>
      <button class="btn tool" onclick="addBadge()">🔴 ব্যাজ</button>
    </div>
  </div>
  <div class="section">
    <h3>ক্যানভাস</h3>
    <label>Width</label><input id="cw" type="number" value="1920" onchange="resizeCanvas()">
    <label>Height</label><input id="ch" type="number" value="1080" onchange="resizeCanvas()">
    <label>ব্যাকগ্রাউন্ড</label><input id="bg" type="color" value="#ffffff" onchange="changeBg(this.value)">
    <button class="btn" style="width:100%;margin-top:8px" onclick="fitZoom()">Fit</button>
  </div>
  <div class="section">
    <h3>ছবি যোগ করুন</h3>
    <button class="btn primary" style="width:100%" onclick="document.getElementById('file').click()">📁 Upload Image</button>
    <input id="file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
  </div>
</aside>

<main class="center">
  <div class="stage" id="stage"><div class="canvas-wrap"><canvas id="canvas" width="1920" height="1080"></canvas></div></div>
  <div class="status"><span id="status">1920 × 1080 px</span></div>
</main>

<aside class="right">
  <div class="section">
    <h3>নির্বাচিত অবজেক্ট</h3>
    <div id="noSel" class="small">ক্যানভাস থেকে কিছু নির্বাচন করুন</div>
    <div id="props" style="display:none">
      <label>নাম</label><input id="objName" type="text" onchange="renameObj(this.value)">
      <label>Opacity</label><input id="opacity" type="range" min="0" max="1" step=".01" onchange="setProp('opacity',+this.value)">
      <div class="row"><button class="btn" onclick="centerObj()">↔ Center</button><button class="btn" onclick="deleteObj()">🗑️ Delete</button></div>
      <label>Fill</label><input id="fill" type="color" onchange="setFill(this.value)">
      <div id="textProps">
        <label>Font size</label><input id="fontSize" type="number" value="40" onchange="setProp('fontSize',+this.value)">
        <label>Font weight</label><select id="fontWeight" onchange="setProp('fontWeight',this.value)"><option>normal</option><option>bold</option></select>
      </div>
      <div id="imageProps" style="display:none">
        <label>Brightness</label><input id="brightness" type="range" min="-1" max="1" step=".01" value="0" onchange="filterImage()">
        <label>Contrast</label><input id="contrast" type="range" min="-1" max="1" step=".01" value="0" onchange="filterImage()">
        <label>Saturation</label><input id="saturation" type="range" min="-1" max="1" step=".01" value="0" onchange="filterImage()">
        <label>Blur</label><input id="blur" type="range" min="0" max=".5" step=".01" value="0" onchange="filterImage()">
        <div class="row"><button class="btn" onclick="toggleGray()">Grayscale</button><button class="btn" onclick="resetFilters()">Reset</button></div>
      </div>
    </div>
  </div>
  <div class="section"><h3>Layers</h3><div id="layers"></div></div>
</aside>
</div>
</div>

<div class="modal" id="exportModal">
 <div class="dialog">
  <h2>Export ছবি</h2>
  <label>Format</label><select id="format"><option value="png">PNG</option><option value="jpeg">JPG</option></select>
  <label>Quality (JPG)</label><input id="quality" type="range" min=".3" max="1" step=".05" value=".9">
  <div class="row" style="margin-top:15px"><button class="btn" onclick="closeExport()">বাতিল</button><button class="btn primary" onclick="exportImage()">Download</button></div>
 </div>
</div>
<div class="toast" id="toast"></div>

<script>
const canvas = new fabric.Canvas('canvas',{preserveObjectStacking:true,selection:true});
let zoom=0.65, history=[], future=[], restoring=false;

function toast(s){const t=document.getElementById('toast');t.textContent=s;t.style.display='block';clearTimeout(window.tt);window.tt=setTimeout(()=>t.style.display='none',2200)}
function snapshot(){if(restoring)return;history.push(JSON.stringify(canvas.toJSON(['name'])));if(history.length>30)history.shift();future=[]}
function undo(){if(history.length<2)return;future.push(history.pop());restoring=true;canvas.loadFromJSON(history[history.length-1],()=>{restoring=false;canvas.renderAll();updateAll()})}
function redo(){if(!future.length)return;const s=future.pop();history.push(s);restoring=true;canvas.loadFromJSON(s,()=>{restoring=false;canvas.renderAll();updateAll()})}
function updateAll(){updateLayers();updateProps();updateStatus()}
function updateStatus(){document.getElementById('status').textContent=`${canvas.getWidth()} × ${canvas.getHeight()} px | Zoom ${Math.round(zoom*100)}%`}
function fitZoom(){zoom=.65;applyZoom()}
function zoomIn(){zoom=Math.min(zoom*1.2,3);applyZoom()}function zoomOut(){zoom=Math.max(zoom*.8,.1);applyZoom()}
function applyZoom(){canvas.setZoom(zoom);canvas.setWidth(+document.getElementById('cw').value*zoom);canvas.setHeight(+document.getElementById('ch').value*zoom);document.getElementById('zoomText').textContent=Math.round(zoom*100)+'%';canvas.requestRenderAll();updateStatus()}
function resizeCanvas(){const w=Math.max(100,+cw.value),h=Math.max(100,+ch.value);canvas.setDimensions({width:w,height:h});canvas.setBackgroundColor(bg.value,canvas.renderAll.bind(canvas));canvas.setZoom(zoom);applyZoom();snapshot();toast('ক্যানভাস সাইজ পরিবর্তন হয়েছে')}
function changeBg(c){canvas.setBackgroundColor(c,canvas.renderAll.bind(canvas));snapshot()}
function add(obj,name){obj.set({name:name||'অবজেক্ট'});canvas.add(obj);canvas.setActiveObject(obj);canvas.requestRenderAll();snapshot();updateAll()}
function addText(){add(new fabric.IText('এখানে লিখুন',{left:canvas.getWidth()/(2*zoom)-180,top:canvas.getHeight()/(2*zoom)-30,fontFamily:'Hind Siliguri',fontSize:48,fill:'#111827',fontWeight:'bold'}),'টেক্সট')}
function addRect(){add(new fabric.Rect({left:760,top:390,width:400,height:250,fill:'#3b82f6',rx:12,ry:12}),'আয়তক্ষেত্র')}
function addCircle(){add(new fabric.Circle({left:810,top:390,radius:120,fill:'#10b981'}),'বৃত্ত')}
function addTriangle(){add(new fabric.Triangle({left:810,top:390,width:240,height:220,fill:'#f59e0b'}),'ত্রিভুজ')}
function addLine(){add(new fabric.Line([700,540,1200,540],{stroke:'#ef4444',strokeWidth:8}),'রেখা')}
function addBadge(){const r=new fabric.Rect({width:300,height:65,fill:'#dc2626',rx:8,ry:8});const t=new fabric.IText('🔴 ব্রেকিং নিউজ',{left:20,top:12,fontFamily:'Hind Siliguri',fontSize:30,fontWeight:'bold',fill:'#fff'});add(new fabric.Group([r,t],{left:100,top:100}),'ব্রেকিং নিউজ')}
document.getElementById('file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>fabric.Image.fromURL(ev.target.result,img=>{const maxW=canvas.getWidth()/zoom*.75,maxH=canvas.getHeight()/zoom*.75;const sc=Math.min(maxW/(img.width||1),maxH/(img.height||1),1);img.scale(sc);img.set({left:(canvas.getWidth()/zoom-img.getScaledWidth())/2,top:(canvas.getHeight()/zoom-img.getScaledHeight())/2,name:f.name.replace(/\.[^.]+$/,'')});add(img,img.name);toast('ছবি যোগ হয়েছে')});reader.readAsDataURL(f);e.target.value=''});

function selected(){return canvas.getActiveObject()}
function updateProps(){const o=selected(), p=document.getElementById('props');document.getElementById('noSel').style.display=o?'none':'block';p.style.display=o?'block':'none';if(!o)return;objName.value=o.name||'অবজেক্ট';opacity.value=o.opacity??1;fill.value=(typeof o.fill==='string'&&o.fill[0]==='#')?o.fill:'#000000';document.getElementById('textProps').style.display=o.type==='i-text'?'block':'none';document.getElementById('imageProps').style.display=o.type==='image'?'block':'none';if(o.type==='i-text'){fontSize.value=o.fontSize||40;fontWeight.value=o.fontWeight||'normal'}}
function setProp(k,v){const o=selected();if(!o)return;o.set(k,v);o.setCoords();canvas.requestRenderAll();snapshot();updateAll()}
function setFill(v){setProp('fill',v)}
function renameObj(v){const o=selected();if(o){o.name=v;updateLayers();snapshot()}}
function centerObj(){const o=selected();if(o){canvas.centerObject(o);o.setCoords();canvas.requestRenderAll();snapshot()}}
function deleteObj(){const o=selected();if(o){canvas.remove(o);canvas.discardActiveObject();snapshot();updateAll()}}
function clearCanvas(){if(confirm('সব অবজেক্ট মুছে ফেলবেন?')){canvas.clear();canvas.setBackgroundColor(bg.value,canvas.renderAll.bind(canvas));snapshot();updateAll()}}
function filterImage(){const o=selected();if(!o||o.type!=='image')return;o.filters=[new fabric.Image.filters.Brightness({brightness:+brightness.value}),new fabric.Image.filters.Contrast({contrast:+contrast.value}),new fabric.Image.filters.Saturation({saturation:+saturation.value}),new fabric.Image.filters.Blur({blur:+blur.value})];o.applyFilters();canvas.requestRenderAll();snapshot()}
function resetFilters(){const o=selected();if(!o||o.type!=='image')return;o.filters=[];o.applyFilters();brightness.value=0;contrast.value=0;saturation.value=0;blur.value=0;canvas.requestRenderAll();snapshot()}
function toggleGray(){const o=selected();if(!o||o.type!=='image')return;o.filters.push(new fabric.Image.filters.Grayscale());o.applyFilters();canvas.requestRenderAll();snapshot()}
function updateLayers(){const box=document.getElementById('layers');box.innerHTML='';canvas.getObjects().slice().reverse().forEach((o,i)=>{const d=document.createElement('div');d.className='layer'+(o===selected()?' active':'');d.innerHTML=`<span>${o.name||o.type}</span><button class="btn" style="padding:2px 6px" onclick="event.stopPropagation();toggleVisible(${canvas.getObjects().indexOf(o)})">${o.visible?'👁':'🚫'}</button>`;d.onclick=()=>{canvas.setActiveObject(o);canvas.requestRenderAll();updateAll()};box.appendChild(d)})}
function toggleVisible(i){const o=canvas.getObjects()[i];if(o){o.visible=!o.visible;canvas.requestRenderAll();updateAll();snapshot()}}
function openExport(){document.getElementById('exportModal').classList.add('show')}function closeExport(){document.getElementById('exportModal').classList.remove('show')}
function exportImage(){const type=format.value==='jpeg'?'jpeg':'png';const data=canvas.toDataURL({format:type,quality:+quality.value,multiplier:1/zoom});const a=document.createElement('a');a.href=data;a.download='edited-image.'+(type==='jpeg'?'jpg':'png');a.click();closeExport();toast('ছবি ডাউনলোড হয়েছে')}
canvas.on('selection:created',updateAll);canvas.on('selection:updated',updateAll);canvas.on('selection:cleared',updateAll);canvas.on('object:modified',()=>{snapshot();updateAll()});canvas.on('object:added',updateLayers);canvas.on('object:removed',updateLayers);
canvas.setBackgroundColor('#ffffff',canvas.renderAll.bind(canvas));
canvas.setZoom(zoom);canvas.setDimensions({width:1920*zoom,height:1080*zoom});
add(new fabric.Rect({left:160,top:140,width:1600,height:800,fill:'#1e1e2d',rx:24,ry:24}),'ব্যাকগ্রাউন্ড ফ্রেম');
add(new fabric.IText('অনলাইন ফটো এডিটর',{left:250,top:280,fontFamily:'Hind Siliguri',fontSize:82,fontWeight:'bold',fill:'#fff'}),'প্রধান শিরোনাম');
canvas.discardActiveObject();history=[];snapshot();updateAll();applyZoom();
</script>
</body>
</html>
