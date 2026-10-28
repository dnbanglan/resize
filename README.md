
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Online Photoshop Pro v1.0</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<style>
:root{--bg:#111318;--panel:#1b1e25;--line:#30343e;--text:#f1f3f8;--muted:#a3aaba;--accent:#4d8dff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Hind Siliguri",sans-serif}
button,input,select{font:inherit}
button{background:#292e39;color:white;border:1px solid #414754;border-radius:7px;padding:8px 11px;cursor:pointer}
button:hover{background:#39465d}
button.primary{background:var(--accent);border-color:var(--accent)}
input,select{background:#11141a;color:white;border:1px solid #3b414d;border-radius:6px;padding:7px;max-width:100%;min-width:0}
label{font-size:13px;color:#c5ccda}
.topbar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#191c23;border-bottom:1px solid var(--line);flex-wrap:wrap}
.brand{font-size:20px;font-weight:700;margin-right:auto}
.brand span{color:#70a5ff}
.app{display:grid;grid-template-columns:190px minmax(0,1fr) 240px;min-height:calc(100vh - 65px)}
.sidebar{background:var(--panel);padding:13px;border-right:1px solid var(--line);min-width:0}
.right{border-right:0;border-left:1px solid var(--line)}
h3{font-size:16px;margin:5px 0 12px}
.toolgrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.group{border-top:1px solid var(--line);margin-top:15px;padding-top:12px}
.field{display:flex;flex-direction:column;gap:5px;margin:10px 0}
.field input[type=range]{width:100%;padding:0}
.workspace{padding:16px;min-width:0;display:flex;flex-direction:column;gap:12px}
.canvas-head,.status{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;color:var(--muted);font-size:13px}
.canvas-wrap{width:100%;aspect-ratio:16/9;background:#252832;border:1px solid #444a56;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.canvas-wrap .canvas-container{max-width:100%!important;max-height:100%!important}
.canvas-wrap canvas{max-width:100%;height:auto}
.empty{position:absolute;text-align:center;color:#b6bdca;pointer-events:none;padding:16px}
.layer{display:flex;align-items:center;gap:6px;background:#252a34;border-radius:6px;padding:7px;margin:5px 0;font-size:13px}
.layer-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.layer button{padding:3px 6px}
.small{font-size:12px;color:var(--muted)}
.notice{background:#242c3b;padding:10px;border-radius:7px;font-size:13px;line-height:1.5}
dialog{background:#20242d;color:white;border:1px solid #515968;border-radius:12px;width:min(440px,94vw)}
dialog::backdrop{background:#000b}
.dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
#message{font-size:13px;color:#a8c8ff;min-height:20px}
@media(max-width:900px){
 .app{grid-template-columns:150px minmax(0,1fr)}
 .right{grid-column:1/-1;border-left:0;border-top:1px solid var(--line)}
}
@media(max-width:560px){
 .app{display:flex;flex-direction:column}
 .sidebar{border-right:0;border-bottom:1px solid var(--line)}
 .toolgrid{grid-template-columns:repeat(3,minmax(0,1fr))}
 .workspace{padding:8px}
 .topbar{padding:9px}
 .brand{width:100%}
 .canvas-wrap{min-height:160px}
}
</style>
</head>
<body>

<header class="topbar">
  <div class="brand">Online <span>Photoshop Pro</span></div>
  <button onclick="document.getElementById('fileInput').click()">＋ ছবি খুলুন</button>
  <button onclick="undo()">↶ Undo</button>
  <button onclick="redo()">↷ Redo</button>
  <button onclick="fitCanvas()">Fit</button>
  <button class="primary" onclick="openSave()">Save / Export</button>
  <input id="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
</header>

<div class="app">
  <aside class="sidebar">
    <h3>Tools / টুলস</h3>
    <div class="toolgrid">
      <button onclick="selectMode('select')">↖ Select</button>
      <button onclick="addText()">T Text</button>
      <button onclick="addShape('rect')">□ Square</button>
      <button onclick="addShape('circle')">○ Circle</button>
      <button onclick="addShape('round')">▢ Rounded</button>
      <button onclick="startPen()">✒ Pen Path</button>
      <button onclick="addBlur()">◉ Blur Area</button>
      <button onclick="duplicateObject()">⧉ Duplicate</button>
    </div>

    <div class="group">
      <h3>ছবি / Image</h3>
      <button style="width:100%" onclick="document.getElementById('fileInput').click()">Upload Image</button>
      <div class="field"><label>Fit Mode</label>
        <select id="fitMode" onchange="fitSelected()">
          <option value="contain">Fit — অনুপাত বজায়</option>
          <option value="cover">Fill — Canvas পূরণ</option>
        </select>
      </div>
      <div class="field"><label>Brightness</label><input id="brightness" type="range" min="-1" max="1" step=".05" value="0" oninput="applyFilters()"></div>
      <div class="field"><label>Contrast</label><input id="contrast" type="range" min="-1" max="1" step=".05" value="0" oninput="applyFilters()"></div>
      <div class="field"><label>Saturation</label><input id="saturation" type="range" min="-1" max="1" step=".05" value="0" oninput="applyFilters()"></div>
      <div class="field"><label>Opacity</label><input id="opacity" type="range" min="0" max="1" step=".05" value="1" oninput="setOpacity(this.value)"></div>
      <div class="toolgrid">
        <button onclick="rotateSelected(-90)">↶ 90°</button>
        <button onclick="rotateSelected(90)">↷ 90°</button>
        <button onclick="flipSelected('X')">↔ Flip X</button>
        <button onclick="flipSelected('Y')">↕ Flip Y</button>
      </div>
    </div>

    <div class="group">
      <h3>Pen Path</h3>
      <div class="notice">Pen Path চাপুন। Canvas-এ ক্লিক করে পয়েন্ট দিন। পয়েন্টগুলো যুক্ত করে একটি Path তৈরি হবে।</div>
      <div class="toolgrid" style="margin-top:8px">
        <button onclick="undoPenPoint()">Undo Point</button>
        <button onclick="finishPen()">Close Path</button>
      </div>
      <div class="field"><label>Feather (প্রিভিউ)</label><input id="feather" type="range" min="0" max="30" value="0"></div>
    </div>
  </aside>

  <main class="workspace">
    <div class="canvas-head">
      <span>Document: 1920 × 1080 px</span>
      <span id="zoomLabel">Canvas 16:9</span>
    </div>
    <div class="canvas-wrap" id="canvasWrap">
      <div class="empty" id="emptyHint">ছবি এখানে Drag & Drop করুন<br>অথবা “ছবি খুলুন” চাপুন</div>
      <canvas id="editor" width="1920" height="1080"></canvas>
    </div>
    <div class="status">
      <span id="statusText">Ready · 1920 × 1080 px</span>
      <span id="message"></span>
    </div>
  </main>

  <aside class="sidebar right">
    <h3>Properties / বৈশিষ্ট্য</h3>
    <div class="field"><label>Layer Name</label><input id="objectName" placeholder="Layer name" onchange="renameSelected(this.value)"></div>
    <div class="field"><label>Position X</label><input id="posX" type="number" onchange="setPosition()"></div>
    <div class="field"><label>Position Y</label><input id="posY" type="number" onchange="setPosition()"></div>
    <div class="field"><label>Width</label><input id="objWidth" type="number" min="1" onchange="setSize()"></div>
    <div class="field"><label>Height</label><input id="objHeight" type="number" min="1" onchange="setSize()"></div>
    <div class="field"><label>Rotation</label><input id="objAngle" type="number" onchange="setAngle(this.value)"></div>
    <div class="field"><label>Text Content</label><input id="textContent" placeholder="বাংলা বা English" onchange="editText(this.value)"></div>
    <div class="field"><label>Font</label>
      <select id="fontFamily" onchange="setTextStyle('fontFamily',this.value)">
        <option>Hind Siliguri</option><option>Noto Sans Bengali</option><option>Arial</option><option>Georgia</option>
      </select>
    </div>
    <div class="field"><label>Font Size</label><input id="fontSize" type="number" value="60" min="8" max="500" onchange="setTextStyle('fontSize',Number(this.value))"></div>
    <div class="field"><label>Text / Shape Color</label><input id="fillColor" type="color" value="#ffffff" onchange="setColor(this.value)"></div>
    <div class="toolgrid">
      <button onclick="setTextStyle('fontWeight','bold')">Bold</button>
      <button onclick="toggleItalic()">Italic</button>
      <button onclick="setTextStyle('textAlign','left')">Left</button>
      <button onclick="setTextStyle('textAlign','center')">Center</button>
    </div>

    <div class="group">
      <h3>Layers</h3>
      <div class="toolgrid">
        <button onclick="toggleVisible()">Show / Hide</button>
        <button onclick="toggleLock()">Lock / Unlock</button>
        <button onclick="duplicateObject()">Duplicate</button>
        <button onclick="deleteSelected()">Delete</button>
        <button onclick="bringFront()">Bring Front</button>
        <button onclick="sendBack()">Send Back</button>
      </div>
      <div id="layers" style="margin-top:10px"></div>
    </div>
  </aside>
</div>

<dialog id="saveDialog">
  <h3>Save / Export Image</h3>
  <div class="field"><label>File Name</label><input id="filename" value="edited-image"></div>
  <div class="field"><label>Format</label>
    <select id="format" onchange="updateEstimate()">
      <option value="png">PNG</option><option value="jpeg">JPG</option><option value="webp">WebP</option>
    </select>
  </div>
  <div class="field"><label>Quality: <span id="qualityLabel">85%</span></label><input id="quality" type="range" min="10" max="100" value="85" oninput="updateEstimate()"></div>
  <div class="field"><label>Export Width (px)</label><input id="exportWidth" type="number" value="1920" min="1" max="12000" oninput="updateEstimate()"></div>
  <div class="field"><label>Export Height (px)</label><input id="exportHeight" type="number" value="1080" min="1" max="12000" oninput="updateEstimate()"></div>
  <div class="field"><label>JPG Background</label><input id="jpgBackground" type="color" value="#ffffff"></div>
  <div class="notice">আনুমানিক সাইজ: <strong id="estimate">রেন্ডার করার পর হিসাব হবে</strong><br><span class="small">চূড়ান্ত ফাইল সাইজ ছবি, রং, ফরম্যাট ও কোয়ালিটির ওপর নির্ভর করবে।</span></div>
  <div class="dialog-actions">
    <button onclick="document.getElementById('saveDialog').close()">Cancel</button>
    <button class="primary" onclick="exportImage()">Download</button>
  </div>
</dialog>

<script>
const CW=1920, CH=1080;
const canvas=new fabric.Canvas('editor',{
  width:CW,height:CH,backgroundColor:'#ffffff',
  preserveObjectStacking:true,selection:true
});
let history=[],redoStack=[],restoring=false,penMode=false,penPoints=[],penPreview=null;
let names=new WeakMap(),counter=0;
const $=id=>document.getElementById(id);
const say=t=>$('message').textContent=t;

function fitCanvas(){
  const wrap=$('canvasWrap');
  const scale=Math.min(wrap.clientWidth/CW,wrap.clientHeight/CH);
  $('zoomLabel').textContent='Zoom '+Math.round(scale*100)+'%';
  canvas.setDimensions({width:CW,height:CH});
  canvas.setZoom(1);
  canvas.calcOffset();
  canvas.requestRenderAll();
}
window.addEventListener('resize',fitCanvas);

function snapshot(){
  if(restoring)return;
  history.push(JSON.stringify(canvas.toDatalessJSON(['customName','isBlurRegion'])));
  if(history.length>25)history.shift();
  redoStack=[];
}
function restore(json){
  restoring=true;
  canvas.loadFromJSON(json,()=>{
    restoring=false;canvas.renderAll();renderLayers();syncProperties();
  });
}
function undo(){
  if(history.length<2){say('আর Undo করার History নেই');return}
  redoStack.push(history.pop());restore(history[history.length-1]);say('Undo সম্পন্ন');
}
function redo(){
  if(!redoStack.length){say('আর Redo করার History নেই');return}
  const state=redoStack.pop();history.push(state);restore(state);say('Redo সম্পন্ন');
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){
    e.preventDefault();e.shiftKey?redo():undo();
  }else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){
    e.preventDefault();redo();
  }else if(e.key==='Escape'&&penMode){cancelPen()}
});
canvas.on('object:modified',()=>{snapshot();renderLayers();syncProperties()});
canvas.on('object:added',e=>{
  if(e.target&&!e.target.customName)e.target.customName='Layer '+(++counter);
  if(!restoring){renderLayers();snapshot()}
});
canvas.on('object:removed',()=>{if(!restoring){renderLayers();snapshot()}});
canvas.on('selection:created',syncProperties);
canvas.on('selection:updated',syncProperties);
canvas.on('selection:cleared',syncProperties);

function selected(){return canvas.getActiveObject()}
function selectMode(){penMode=false;canvas.selection=true;canvas.defaultCursor='default';say('Select Tool চালু')}
function addText(){
  const t=new fabric.IText('এখানে লিখুন',{
    left:300,top:250,fontFamily:'Hind Siliguri',fontSize:60,
    fill:'#ffffff',stroke:'#222222',strokeWidth:0,
    shadow:'',editable:true
  });
  canvas.add(t);canvas.setActiveObject(t);canvas.requestRenderAll();
}
function addShape(type){
  const common={left:400,top:250,width:300,height:200,fill:'rgba(77,141,255,0.25)',stroke:'#4d8dff',strokeWidth:5};
  let obj;
  if(type==='circle')obj=new fabric.Circle({...common,radius:100,width:200,height:200});
  else if(type==='round')obj=new fabric.Rect({...common,rx:35,ry:35});
  else obj=new fabric.Rect(common);
  canvas.add(obj);canvas.setActiveObject(obj);canvas.requestRenderAll();
}
function addBlur(){
  const r=new fabric.Rect({
    left:350,top:250,width:260,height:180,
    fill:'rgba(100,150,255,0.10)',stroke:'#6aa4ff',
    strokeDashArray:[10,6],strokeWidth:3,
    isBlurRegion:true,customName:'Blur Region'
  });
  canvas.add(r);canvas.setActiveObject(r);say('Blur Region যোগ হয়েছে');
  alert('Blur Region তৈরি হয়েছে। এই প্রাথমিক সংস্করণে এটি নির্বাচনী অঞ্চল হিসেবে চিহ্নিত হয়; প্রকৃত Pixel Blur Export এখনও যুক্ত করা হয়নি।');
}
function duplicateObject(){
  const obj=selected();if(!obj)return say('আগে একটি Layer নির্বাচন করুন');
  obj.clone(clone=>{
    clone.set({left:(obj.left||0)+25,top:(obj.top||0)+25});
    clone.customName=(obj.customName||'Layer')+' Copy';
    canvas.add(clone);canvas.setActiveObject(clone);canvas.requestRenderAll();
  });
}
function deleteSelected(){
  const obj=selected();if(!obj)return;
  canvas.remove(obj);canvas.discardActiveObject();canvas.requestRenderAll();renderLayers();
}
function rotateSelected(deg){const o=selected();if(!o)return;o.rotate((o.angle||0)+deg);o.setCoords();canvas.requestRenderAll();snapshot();syncProperties()}
function flipSelected(axis){const o=selected();if(!o)return;o.set(axis==='X'?'flipX':'flipY',!(axis==='X'?o.flipX:o.flipY));canvas.requestRenderAll();snapshot()}
function setOpacity(v){const o=selected();if(!o)return;o.set('opacity',Number(v));canvas.requestRenderAll()}
function setPosition(){
  const o=selected();if(!o)return;
  o.set({left:Number($('posX').value)||0,top:Number($('posY').value)||0});
  o.setCoords();canvas.requestRenderAll();snapshot()
}
function setSize(){
  const o=selected();if(!o)return;
  const w=Math.max(1,Number($('objWidth').value)||o.width);
  const h=Math.max(1,Number($('objHeight').value)||o.height);
  o.scaleX=w/(o.width||1);o.scaleY=h/(o.height||1);
  o.setCoords();canvas.requestRenderAll();snapshot()
}
function setAngle(v){const o=selected();if(!o)return;o.rotate(Number(v)||0);o.setCoords();canvas.requestRenderAll();snapshot()}
function renameSelected(v){const o=selected();if(o){o.customName=v||'Layer';renderLayers();snapshot()}}
function setColor(v){const o=selected();if(!o)return;o.set('fill',v);canvas.requestRenderAll();snapshot()}
function setTextStyle(k,v){const o=selected();if(!o||!o.isType('i-text','text','textbox'))return;o.set(k,v);canvas.requestRenderAll();snapshot()}
function toggleItalic(){const o=selected();if(!o)return;o.set('fontStyle',o.fontStyle==='italic'?'normal':'italic');canvas.requestRenderAll();snapshot()}
function editText(v){const o=selected();if(o&&o.isType('i-text','text','textbox')){o.set('text',v);canvas.requestRenderAll();snapshot()}}
function toggleVisible(){const o=selected();if(!o)return;o.visible=!o.visible;canvas.requestRenderAll();renderLayers();snapshot()}
function toggleLock(){const o=selected();if(!o)return;o.selectable=!o.selectable;o.evented=!o.evented;renderLayers();snapshot()}
function bringFront(){const o=selected();if(o){canvas.bringToFront(o);canvas.requestRenderAll();renderLayers();snapshot()}}
function sendBack(){const o=selected();if(o){canvas.sendToBack(o);canvas.requestRenderAll();renderLayers();snapshot()}}

function syncProperties(){
  const o=selected();if(!o)return;
  $('objectName').value=o.customName||'';
  $('posX').value=Math.round(o.left||0);$('posY').value=Math.round(o.top||0);
  $('objWidth').value=Math.round((o.width||0)*(o.scaleX||1));
  $('objHeight').value=Math.round((o.height||0)*(o.scaleY||1));
  $('objAngle').value=Math.round(o.angle||0);
  $('opacity').value=o.opacity??1;
  if(o.isType('i-text','text','textbox')){
    $('textContent').value=o.text||'';
    $('fontFamily').value=o.fontFamily||'Hind Siliguri';
    $('fontSize').value=o.fontSize||60;
  }
  if(typeof o.fill==='string'&&o.fill[0]==='#')$('fillColor').value=o.fill;
}
function renderLayers(){
  const box=$('layers');box.innerHTML='';
  [...canvas.getObjects()].reverse().forEach(o=>{
    const row=document.createElement('div');row.className='layer';
    const eye=document.createElement('button');eye.textContent=o.visible?'◉':'○';
    eye.title='Show / Hide';eye.onclick=()=>{o.visible=!o.visible;canvas.requestRenderAll();renderLayers();snapshot()};
    const name=document.createElement('span');name.className='layer-name';name.textContent=o.customName||o.type;
    name.title='Select Layer';name.onclick=()=>{canvas.setActiveObject(o);canvas.requestRenderAll();syncProperties()};
    const del=document.createElement('button');del.textContent='×';del.title='Delete';del.onclick=()=>{canvas.remove(o);canvas.requestRenderAll();renderLayers()};
    row.append(eye,name,del);box.appendChild(row);
  });
}
function applyFilters(){
  const o=selected();if(!o||o.type!=='image'){say('Filter-এর জন্য Image Layer নির্বাচন করুন');return}
  const B=Number($('brightness').value),C=Number($('contrast').value),S=Number($('saturation').value);
  o.filters=[
    new fabric.Image.filters.Brightness({brightness:B}),
    new fabric.Image.filters.Contrast({contrast:C}),
    new fabric.Image.filters.Saturation({saturation:S})
  ];
  o.applyFilters();canvas.requestRenderAll();
}
function fitSelected(){
  const o=selected();if(!o||o.type!=='image')return;
  const mode=$('fitMode').value;
  const sx=CW/o.width,sy=CH/o.height;
  const scale=mode==='cover'?Math.max(sx,sy):Math.min(sx,sy);
  o.set({scaleX:scale,scaleY:scale,left:(CW-o.width*scale)/2,top:(CH-o.height*scale)/2});
  o.setCoords();canvas.requestRenderAll();snapshot()
}
function loadImage(file){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){say('JPG, PNG বা WebP ফাইল নির্বাচন করুন');return}
  if(file.size>20*1024*1024){say('সর্বোচ্চ ফাইল সাইজ 20 MB');return}
  const reader=new FileReader();
  reader.onload=e=>fabric.Image.fromURL(e.target.result,img=>{
    const scale=Math.min(CW/img.width,CH/img.height);
    img.set({left:(CW-img.width*scale)/2,top:(CH-img.height*scale)/2,scaleX:scale,scaleY:scale});
    img.customName=file.name;
    canvas.add(img);canvas.setActiveObject(img);canvas.requestRenderAll();
    $('emptyHint').style.display='none';say('ছবি যুক্ত হয়েছে: '+file.name);renderLayers();
  });
  reader.readAsDataURL(file);
}
$('fileInput').addEventListener('change',e=>[...e.target.files].forEach(loadImage));
const wrap=$('canvasWrap');
wrap.addEventListener('dragover',e=>{e.preventDefault();wrap.style.borderColor='#4d8dff'});
wrap.addEventListener('dragleave',()=>wrap.style.borderColor='#444a56');
wrap.addEventListener('drop',e=>{
  e.preventDefault();wrap.style.borderColor='#444a56';
  [...e.dataTransfer.files].forEach(loadImage);
});

function startPen(){
  penMode=true;penPoints=[];canvas.discardActiveObject();canvas.selection=false;
  canvas.defaultCursor='crosshair';say('Pen: Canvas-এ পয়েন্ট ক্লিক করুন, তারপর Close Path');
}
canvas.on('mouse:down',opt=>{
  if(!penMode)return;
  const p=canvas.getPointer(opt.e);penPoints.push({x:p.x,y:p.y});
  if(penPreview)canvas.remove(penPreview);
  penPreview=new fabric.Polyline(penPoints,{fill:'rgba(77,141,255,0.10)',stroke:'#4d8dff',strokeWidth:3,selectable:false,evented:false});
  canvas.add(penPreview);canvas.requestRenderAll();
});
function undoPenPoint(){
  if(!penMode||!penPoints.length)return;
  penPoints.pop();if(penPreview)canvas.remove(penPreview);
  penPreview=penPoints.length?new fabric.Polyline(penPoints,{fill:'rgba(77,141,255,0.10)',stroke:'#4d8dff',strokeWidth:3,selectable:false,evented:false}):null;
  if(penPreview)canvas.add(penPreview);canvas.requestRenderAll();
}
function finishPen(){
  if(!penMode||penPoints.length<3){say('Path বন্ধ করতে অন্তত 3টি পয়েন্ট দিন');return}
  if(penPreview)canvas.remove(penPreview);
  const poly=new fabric.Polygon(penPoints,{left:0,top:0,fill:'rgba(77,141,255,0.12)',stroke:'#7eb0ff',strokeWidth:3,objectCaching:false});
  poly.customName='Pen Path';
  canvas.add(poly);canvas.setActiveObject(poly);canvas.selection=true;
  penMode=false;penPoints=[];penPreview=null;canvas.defaultCursor='default';
  canvas.requestRenderAll();snapshot();say('Pen Path তৈরি হয়েছে। এটি এখন Path Layer, স্বয়ংক্রিয় cutout নয়।');
}
function cancelPen(){
  penMode=false;penPoints=[];if(penPreview)canvas.remove(penPreview);
  penPreview=null;canvas.selection=true;canvas.defaultCursor='default';canvas.requestRenderAll()
}

function openSave(){
  $('filename').value='edited-image-'+new Date().toISOString().slice(0,10);
  $('exportWidth').value=CW;$('exportHeight').value=CH;
  $('saveDialog').showModal();updateEstimate();
}
function updateEstimate(){
  $('qualityLabel').textContent=$('quality').value+'%';
  $('estimate').textContent='প্রকৃত Render-এর পরে গণনা হবে';
}
function exportImage(){
  const format=$('format').value;
  const w=Number($('exportWidth').value),h=Number($('exportHeight').value);
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000){
    alert('Width ও Height 1–12000 px-এর মধ্যে দিন');return
  }
  if(format==='jpeg'){
    const old=canvas.backgroundColor;canvas.backgroundColor=$('jpgBackground').value;
    canvas.renderAll();
    const url=canvas.toDataURL({format:'jpeg',quality:Number($('quality').value)/100,multiplier:w/CW});
    canvas.backgroundColor=old;canvas.renderAll();
    downloadURL(url,w,h,format);return;
  }
  if(format==='webp'&&!document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')){
    alert('এই ব্রাউজারে WebP Export সমর্থিত নয়');return
  }
  try{
    const url=canvas.toDataURL({format:format==='png'?'png':'webp',quality:Number($('quality').value)/100,multiplier:w/CW});
    downloadURL(url,w,h,format);
  }catch(err){alert('Export ব্যর্থ হয়েছে: '+err.message)}
}
function downloadURL(url,w,h,format){
  const temp=document.createElement('canvas');temp.width=w;temp.height=h;
  const ctx=temp.getContext('2d');const im=new Image();
  im.onload=()=>{
    ctx.drawImage(im,0,0,w,h);
    temp.toBlob(blob=>{
      if(!blob){alert('ফাইল তৈরি করা যায়নি');return}
      let name=$('filename').value.trim()||'edited-image';
      name=name.replace(/\.(png|jpe?g|webp)$/i,'');
      const ext=format==='jpeg'?'jpg':format;
      const link=document.createElement('a');
      const objectURL=URL.createObjectURL(blob);
      link.href=objectURL;link.download=name+'.'+ext;
      document.body.appendChild(link);link.click();link.remove();
      $('estimate').textContent=(blob.size/1024).toFixed(1)+' KB (প্রকৃত সাইজ)';
      say('Export সফল: '+name+'.'+ext);
      setTimeout(()=>URL.revokeObjectURL(objectURL),1500);
      $('saveDialog').close();
    },'image/'+format,Number($('quality').value)/100);
  };
  im.onerror=()=>alert('Export Image তৈরি করা যায়নি');
  im.src=url;
}
canvas.on('mouse:up',()=>{if(penMode)return});
snapshot();fitCanvas();renderLayers();
</script>
</body>
</html>
