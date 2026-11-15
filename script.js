document.addEventListener('DOMContentLoaded',function(){

var revealItems=document.querySelectorAll('.reveal');
var revealObserver=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('in-view');
revealObserver.unobserve(entry.target);
}
});
},{threshold:0.12});

revealItems.forEach(function(item){
revealObserver.observe(item);
});

if(typeof THREE!=='undefined'){initMinecraftModel();}

});

function initMinecraftModel(){
var container=document.getElementById('mc-model-container');
if(!container) return;

function getDimensions(){
return {
width: container.clientWidth || 260,
height: container.clientHeight || 320
};
}

var dims=getDimensions();
var scene=new THREE.Scene();

var camera=new THREE.PerspectiveCamera(28, dims.width/dims.height, 0.1, 1000);
var renderer=new THREE.WebGLRenderer({alpha:true, antialias:true});
renderer.setSize(dims.width, dims.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

var ambientLight=new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

var dirLight=new THREE.DirectionalLight(0xffffff, 0.35);
dirLight.position.set(-10, 20, 25);
scene.add(dirLight);

var geoData={
"format_version": "1.12.0",
"minecraft:geometry": [
{
"description": {
"identifier": "geometry.unknown",
"texture_width": 64,
"texture_height": 64,
"visible_bounds_width": 3,
"visible_bounds_height": 3.5,
"visible_bounds_offset": [0, 1.25, 0]
},
"bones": [
{"name": "Waist", "pivot": [0, 12, 0]},
{"name": "Head", "parent": "Waist", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 24, -4], "size": [8, 8, 8], "uv": [0, 0]}, {"origin": [-4, 24, -4], "size": [8, 8, 8], "inflate": 0.5, "uv": [32, 0]}]},
{"name": "Body", "parent": "Waist", "pivot": [0, 24, 0], "cubes": [{"origin": [-4, 12, -2], "size": [8, 12, 4], "uv": [16, 16]}, {"origin": [-4, 12, -2], "size": [8, 12, 4], "inflate": 0.25, "uv": [16, 32]}]},
{"name": "RightArm", "parent": "Waist", "pivot": [-5, 22, 0], "cubes": [{"origin": [-7, 12, -2], "size": [3, 12, 4], "uv": [40, 16]}, {"origin": [-7, 12, -2], "size": [3, 12, 4], "inflate": 0.25, "uv": [40, 32]}]},
{"name": "LeftArm", "parent": "Waist", "pivot": [5, 22, 0], "cubes": [{"origin": [4, 12, -2], "size": [3, 12, 4], "uv": [32, 48]}, {"origin": [4, 12, -2], "size": [3, 12, 4], "inflate": 0.25, "uv": [48, 48]}]},
{"name": "RightLeg", "pivot": [-1.9, 12, 0], "cubes": [{"origin": [-3.9, 0, -2], "size": [4, 12, 4], "uv": [0, 16]}, {"origin": [-3.9, 0, -2], "size": [4, 12, 4], "inflate": 0.25, "uv": [0, 32]}]},
{"name": "LeftLeg", "pivot": [1.9, 12, 0], "cubes": [{"origin": [-0.1, 0, -2], "size": [4, 12, 4], "uv": [16, 48]}, {"origin": [-0.1, 0, -2], "size": [4, 12, 4], "inflate": 0.25, "uv": [0, 48]}]}
]
}
]
};

var textureLoader=new THREE.TextureLoader();
textureLoader.load('assets/s1.png', function(texture){
texture.magFilter=THREE.NearestFilter;
texture.minFilter=THREE.NearestFilter;

var material=new THREE.MeshLambertMaterial({
map: texture,
transparent: true,
alphaTest: 0.1
});

var bonesMap={};
var modelGroup=new THREE.Group();

var geomInfo=geoData["minecraft:geometry"][0];
var texW=geomInfo.description.texture_width;
var texH=geomInfo.description.texture_height;

geomInfo.bones.forEach(function(b){
var boneGroup=new THREE.Group();
boneGroup.position.set(b.pivot ? b.pivot[0] : 0, b.pivot ? b.pivot[1] : 0, b.pivot ? b.pivot[2] : 0);

if(b.cubes){
b.cubes.forEach(function(c){
var dx=c.size[0], dy=c.size[1], dz=c.size[2];
if(dx===0||dy===0||dz===0) return;
var inf=c.inflate||0;
var cubeGeo=new THREE.BoxGeometry(dx+inf*2, dy+inf*2, dz+inf*2);

var u=c.uv[0], v=c.uv[1];
var uvs=cubeGeo.attributes.uv;

function setUV(faceIdx, x1, y1, x2, y2){
var u1=x1/texW, v1=1-(y2/texH);
var u2=x2/texW, v2=1-(y1/texH);
var idx=faceIdx*4;
uvs.setXY(idx, u1, v2);
uvs.setXY(idx+1, u2, v2);
uvs.setXY(idx+2, u1, v1);
uvs.setXY(idx+3, u2, v1);
}

setUV(0, u+dz+dx, v+dz, u+dz+dx+dz, v+dz+dy);
setUV(1, u, v+dz, u+dz, v+dz+dy);
setUV(2, u+dz, v, u+dz+dx, v+dz);
setUV(3, u+dz+dx, v, u+dz+dx+dx, v+dz);
setUV(4, u+dz, v+dz, u+dz+dx, v+dz+dy);
setUV(5, u+dz+dx+dz, v+dz, u+dz+dx+dz+dx, v+dz+dy);

uvs.needsUpdate=true;

var mesh=new THREE.Mesh(cubeGeo, material);
var ox=c.origin[0]+dx/2-(b.pivot ? b.pivot[0] : 0);
var oy=c.origin[1]+dy/2-(b.pivot ? b.pivot[1] : 0);
var oz=c.origin[2]+dz/2-(b.pivot ? b.pivot[2] : 0);
mesh.position.set(ox, oy, oz);
boneGroup.add(mesh);
});
}

bonesMap[b.name]=boneGroup;
});

geomInfo.bones.forEach(function(b){
if(b.parent && bonesMap[b.parent]){
var pPivot=geomInfo.bones.find(x=>x.name===b.parent).pivot;
bonesMap[b.name].position.x-=pPivot[0];
bonesMap[b.name].position.y-=pPivot[1];
bonesMap[b.name].position.z-=pPivot[2];
bonesMap[b.parent].add(bonesMap[b.name]);
}else{
modelGroup.add(bonesMap[b.name]);
}
});

if(bonesMap['Waist']){
bonesMap['Waist'].rotation.y=THREE.MathUtils.degToRad(-15);
}
if(bonesMap['Head']){
bonesMap['Head'].rotation.y=THREE.MathUtils.degToRad(8);
}
if(bonesMap['LeftArm']){
bonesMap['LeftArm'].rotation.z=THREE.MathUtils.degToRad(-18);
bonesMap['LeftArm'].rotation.x=THREE.MathUtils.degToRad(12);
bonesMap['LeftArm'].rotation.y=THREE.MathUtils.degToRad(10);
}

var bbox=new THREE.Box3().setFromObject(modelGroup);
var center=bbox.getCenter(new THREE.Vector3());
var size=bbox.getSize(new THREE.Vector3());

modelGroup.position.x=-center.x;
modelGroup.position.y=-center.y;
modelGroup.position.z=-center.z;

scene.add(modelGroup);

function adjustCamera(){
var currentDims=getDimensions();
camera.aspect=currentDims.width/currentDims.height;

var maxDim=Math.max(size.x, size.y, size.z);
var fov=camera.fov*(Math.PI/180);
var cameraZ=Math.abs(maxDim/(2*Math.tan(fov/2)))*1.22;

camera.position.set(0, 0, cameraZ);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
renderer.setSize(currentDims.width, currentDims.height);
}

adjustCamera();

window.addEventListener('resize', adjustCamera);

var clock=new THREE.Clock();

function easeInOutQuad(t){
return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
}

var waveDuration=3;
var transOutDuration=0.6;
var restDuration=2.5;
var transInDuration=0.6;
var cycleLength=waveDuration+transOutDuration+restDuration+transInDuration;
var waveCenter=-130;
var waveAmp=20;
var waveFreq=8;

function animate(){
requestAnimationFrame(animate);

var elapsedTime=clock.getElapsedTime();
var cycleTime=elapsedTime % cycleLength;

if(bonesMap['RightArm']){
var angleDeg=0;

if(cycleTime < waveDuration){
angleDeg=waveCenter + Math.sin(cycleTime * waveFreq) * waveAmp;
}else if(cycleTime < waveDuration + transOutDuration){
var t=(cycleTime - waveDuration) / transOutDuration;
var te=easeInOutQuad(t);
var startAngle=waveCenter + Math.sin(waveDuration * waveFreq) * waveAmp;
angleDeg=startAngle * (1 - te);
}else if(cycleTime < waveDuration + transOutDuration + restDuration){
var restTime=cycleTime - waveDuration - transOutDuration;
angleDeg=Math.sin(restTime * 1.5) * 2;
}else{
var t2=(cycleTime - waveDuration - transOutDuration - restDuration) / transInDuration;
var te2=easeInOutQuad(t2);
angleDeg=waveCenter * te2;
}

bonesMap['RightArm'].rotation.x=THREE.MathUtils.degToRad(angleDeg);
bonesMap['RightArm'].rotation.y=THREE.MathUtils.degToRad(0);
bonesMap['RightArm'].rotation.z=THREE.MathUtils.degToRad(0);
}

renderer.render(scene, camera);
}
animate();
});
}

function openRequestModal(planName, planPrice, type){
document.getElementById('modalPlanName').innerText = planName;
document.getElementById('modalPlanPrice').innerText = planPrice;
document.getElementById('hiddenPlanName').value = planName;
document.getElementById('hiddenPlanPrice').value = planPrice;
var base = type === 'Web' ? 'Nueva Solicitud Web' : 'Nueva Solicitud';
document.getElementById('emailSubject').value = base + ': ' + planName + ' - GlacierArt';
document.getElementById('formError').classList.remove('active');
document.getElementById('requestModal').classList.add('active');
}

function closeModal(modalId){
document.getElementById(modalId).classList.remove('active');
}

function handleFormSubmit(event){
event.preventDefault();
var form = event.target;
var formData = new FormData(form);
var submitBtn = document.getElementById('submitBtn');
var errorText = document.getElementById('formError');

errorText.classList.remove('active');
submitBtn.disabled = true;
submitBtn.innerText = 'Enviando...';

fetch(form.action, {
method: 'POST',
body: formData,
headers: {'Accept': 'application/json'}
}).then(function(response){
if(!response.ok){ throw new Error('Respuesta no valida del servidor: ' + response.status); }
return response.json();
}).then(function(){
submitBtn.disabled = false;
submitBtn.innerText = 'Enviar Solicitud';
closeModal('requestModal');
form.reset();
document.getElementById('successModal').classList.add('active');
}).catch(function(error){
console.error('Error al enviar el formulario:', error);
submitBtn.disabled = false;
submitBtn.innerText = 'Enviar Solicitud';
errorText.classList.add('active');
});
}


/* ---------- page router (hash based) ---------- */
(function(){
var TITLES={inicio:'GlacierArt',team:'Team Groups · GlacierArt',servicios:'Servicios · GlacierArt',tecnologias:'Tecnologías · GlacierArt','planes-web':'Planes Web · GlacierArt','planes-mc':'Planes Minecraft · GlacierArt',contacto:'Contacto · GlacierArt'};
function route(){
var id=(location.hash||'#inicio').slice(1);
if(!TITLES[id]) id='inicio';
document.querySelectorAll('.view').forEach(function(v){v.classList.toggle('active',v.getAttribute('data-view')===id);});
document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.getAttribute('data-view')===id);});
document.title=TITLES[id];
window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
route();
})();

/* ---------- mobile menu + language picker ---------- */
(function(){
var LANGS=[["af","Afrikaans"],["sq","Albanian"],["am","Amharic"],["ar","Arabic"],["hy","Armenian"],["as","Assamese"],["ay","Aymara"],["az","Azerbaijani"],["bm","Bambara"],["eu","Basque"],["be","Belarusian"],["bn","Bengali"],["bho","Bhojpuri"],["bs","Bosnian"],["bg","Bulgarian"],["ca","Catalan"],["ceb","Cebuano"],["ny","Chichewa"],["zh-CN","Chinese (Simplified)"],["zh-TW","Chinese (Traditional)"],["co","Corsican"],["hr","Croatian"],["cs","Czech"],["da","Danish"],["dv","Dhivehi"],["doi","Dogri"],["nl","Dutch"],["en","English"],["eo","Esperanto"],["et","Estonian"],["ee","Ewe"],["tl","Filipino"],["fi","Finnish"],["fr","French"],["fy","Frisian"],["gl","Galician"],["ka","Georgian"],["de","German"],["el","Greek"],["gn","Guarani"],["gu","Gujarati"],["ht","Haitian Creole"],["ha","Hausa"],["haw","Hawaiian"],["iw","Hebrew"],["hi","Hindi"],["hmn","Hmong"],["hu","Hungarian"],["is","Icelandic"],["ig","Igbo"],["ilo","Ilocano"],["id","Indonesian"],["ga","Irish"],["it","Italian"],["ja","Japanese"],["jw","Javanese"],["kn","Kannada"],["kk","Kazakh"],["km","Khmer"],["rw","Kinyarwanda"],["gom","Konkani"],["ko","Korean"],["kri","Krio"],["ku","Kurdish (Kurmanji)"],["ckb","Kurdish (Sorani)"],["ky","Kyrgyz"],["lo","Lao"],["la","Latin"],["lv","Latvian"],["ln","Lingala"],["lt","Lithuanian"],["lg","Luganda"],["lb","Luxembourgish"],["mk","Macedonian"],["mai","Maithili"],["mg","Malagasy"],["ms","Malay"],["ml","Malayalam"],["mt","Maltese"],["mi","Maori"],["mr","Marathi"],["mni-Mtei","Meiteilon (Manipuri)"],["lus","Mizo"],["mn","Mongolian"],["my","Myanmar (Burmese)"],["ne","Nepali"],["no","Norwegian"],["or","Odia (Oriya)"],["om","Oromo"],["ps","Pashto"],["fa","Persian"],["pl","Polish"],["pt","Portuguese"],["pa","Punjabi"],["qu","Quechua"],["ro","Romanian"],["ru","Russian"],["sm","Samoan"],["sa","Sanskrit"],["gd","Scots Gaelic"],["nso","Sepedi"],["sr","Serbian"],["st","Sesotho"],["sn","Shona"],["sd","Sindhi"],["si","Sinhala"],["sk","Slovak"],["sl","Slovenian"],["so","Somali"],["es","Español (original)"],["su","Sundanese"],["sw","Swahili"],["sv","Swedish"],["tg","Tajik"],["ta","Tamil"],["tt","Tatar"],["te","Telugu"],["th","Thai"],["ti","Tigrinya"],["ts","Tsonga"],["tr","Turkish"],["tk","Turkmen"],["ak","Twi"],["uk","Ukrainian"],["ur","Urdu"],["ug","Uyghur"],["uz","Uzbek"],["vi","Vietnamese"],["cy","Welsh"],["xh","Xhosa"],["yi","Yiddish"],["yo","Yoruba"],["zu","Zulu"]];
var SOURCE='es';
var tabs=document.getElementById('tabs');
var menuBtn=document.getElementById('menuBtn');
var langBtn=document.getElementById('langBtn');
var langMenu=document.getElementById('langMenu');
var langList=document.getElementById('langList');
var langSearch=document.getElementById('langSearch');
var langLabel=document.getElementById('langLabel');
if(!tabs||!langMenu) return;

function closeMenu(){tabs.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}
function closeLang(){langMenu.hidden=true;langBtn.setAttribute('aria-expanded','false');}
function closeAll(){closeMenu();closeLang();}

menuBtn.addEventListener('click',function(e){
e.stopPropagation();
var open=!tabs.classList.contains('open');
closeLang();
tabs.classList.toggle('open',open);
menuBtn.setAttribute('aria-expanded',open?'true':'false');
});
langBtn.addEventListener('click',function(e){
e.stopPropagation();
var open=langMenu.hidden;
closeMenu();
langMenu.hidden=!open;
langBtn.setAttribute('aria-expanded',open?'true':'false');
if(open){langSearch.value='';render('');setTimeout(function(){langSearch.focus();},0);var a=langList.querySelector('.active');if(a)a.scrollIntoView({block:'center'});}
});
document.addEventListener('click',function(e){
if(!e.target.closest('.topnav')) closeAll();
});
tabs.addEventListener('click',function(e){if(e.target.closest('.tab')) closeMenu();});
document.addEventListener('keydown',function(e){if(e.key==='Escape') closeAll();});
window.addEventListener('hashchange',closeAll);

/* ----- language ----- */
function getCookie(n){
var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));
return m?decodeURIComponent(m[1]):'';
}
function current(){
var parts=getCookie('googtrans').split('/');
return parts[2]||SOURCE;
}
function writeCookie(value,days){
var exp=days<0?'; expires=Thu, 01 Jan 1970 00:00:00 GMT':'';
var host=location.hostname;
var base='googtrans='+value+exp+'; path=/';
document.cookie=base;
document.cookie=base+'; domain='+host;
if(host.indexOf('.')>-1) document.cookie=base+'; domain=.'+host;
}
function apply(code){
if(code===SOURCE){writeCookie('',-1);}
else{writeCookie('/'+SOURCE+'/'+code,1);}
location.reload();
}
function labelOf(code){
for(var i=0;i<LANGS.length;i++){if(LANGS[i][0]===code) return LANGS[i][1];}
return code;
}
function render(q){
q=(q||'').trim().toLowerCase();
var cur=current();
langList.innerHTML='';
var n=0;
LANGS.forEach(function(l){
if(q && l[1].toLowerCase().indexOf(q)<0 && l[0].toLowerCase().indexOf(q)<0) return;
var b=document.createElement('button');
b.type='button';
b.className='lang-opt'+(l[0]===cur?' active':'');
b.setAttribute('role','option');
b.setAttribute('aria-selected',l[0]===cur?'true':'false');
b.textContent=l[1];
b.addEventListener('click',function(){apply(l[0]);});
langList.appendChild(b);
n++;
});
if(!n){var d=document.createElement('div');d.className='lang-empty';d.textContent='Sin resultados';langList.appendChild(d);}
}
langSearch.addEventListener('input',function(){render(langSearch.value);});

var cur=current();
if(langLabel){langLabel.textContent=(cur===SOURCE)?'Idioma':labelOf(cur);}
render('');

/* load Google Translate only when a language other than the original is active */
if(cur!==SOURCE){
window.googleTranslateElementInit=function(){
new google.translate.TranslateElement({pageLanguage:SOURCE,autoDisplay:false},'google_translate_element');
};
var s=document.createElement('script');
s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
s.async=true;
document.head.appendChild(s);
}
})();
