(()=>{"use strict";class t{constructor(t,e,i,s){this.x=t,this.y=e,this.w=i,this.h=s}isInsideOut(){return this.w<0&&this.h<0}getLeft(){return this.x}getRight(){return this.x+this.w}getTop(){return this.y}getBottom(){return this.y+this.h}getOldLeft(){return this.oldX}getOldRight(){return this.oldX+this.w}getOldTop(){return this.oldY}getOldBottom(){return this.oldY+this.h}getCenterX(){return this.x+.5*this.w}getCenterY(){return this.y+.5*this.h}setLeft(t){this.x=t}setRight(t){this.x=t-this.w}setTop(t){this.y=t}setBottom(t){this.y=t-this.h}drawOutline(t,e){t.strokeStyle="#ffef42",t.lineWidth=4,t.strokeRect(this.x-e.x-2,this.y-e.y-2,this.w+4,this.h+4)}}class e{constructor({w:t,h:e,data:i}){this.width=t,this.height=e,this.pixels=[];for(let t=0;t<this.height;t++){this.pixels[t]=[];for(let e=0;e<this.width;e++)this.pixels[t][e]=i[t*this.width+e]}}draw(e,i){e.fillStyle="#000000";for(let s=0;s<this.pixels.length;s++)for(let o=0;o<this.pixels[s].length;o++)if("1"==this.pixels[s][o]){const r=i.WorldToCanvasRect(new t(o,s,1,1));e.fillRect(r.x,r.y,r.w,r.h)}}}class i{constructor(t,e,i,s=255){this.r=t,this.g=e,this.b=i,this.a=s}toHex(){let t="#";for(let e of[this.r,this.g,this.b,this.a])t+=("0"+Math.floor(e).toString(16)).substr(-2,2);return t}toHexNoAlpha(){let t="#";for(let e of[this.r,this.g,this.b])t+=("0"+Math.floor(e).toString(16)).substr(-2,2);return t}copy(){return new i(this.r,this.g,this.b,this.a)}}class s{constructor({id:t,color:e,center:s,age:o,settings:r}){this.id=t,this.color=new i(e.r,e.g,e.b,e.a),this.settings=r,this.alive=!0,this.age=o,this.r,this.center=s,this.vertices=[];for(let t=0;t<this.settings.resolutionClient;t++){const e=(t/this.settings.resolutionClient-.5)*this.settings.spread+this.settings.rotation;this.vertices[t]={dir:{x:Math.cos(e),y:Math.sin(e)},active:!0,x:this.center.x,y:this.center.y}}this.settings.full||this.vertices.push({x:this.center.x,y:this.center.y,active:!1,center:!0})}update(t,e){this.age+=t,this.r=this.age*this.settings.speed,this.age/this.settings.lifetime>1&&(this.alive=!1),this.power=1-this.age/this.settings.lifetime,this.color.a=Math.max(0,255*this.power*this.power);for(const t of this.vertices){if(!t.active)continue;const i=t.dir,s=this.center;let o=i.x>0?Math.ceil(s.x):Math.floor(s.x),r=i.y>0?Math.ceil(s.y):Math.floor(s.y);for(;;){let n,a;n=a=Number.POSITIVE_INFINITY,0!=i.x&&(n=(o-s.x)/i.x),0!=i.y&&(a=(r-s.y)/i.y);let h=Math.min(n,a);if(h>this.r){t.x=s.x+this.r*i.x,t.y=s.y+this.r*i.y;break}let l={x:s.x+h*i.x,y:s.y+h*i.y};t.x=l.x,t.y=l.y;let d,c,y=!1;if(n<a?(d=Math.round(l.x),c=Math.floor(l.y),i.x>0?o++:(d--,o--)):(d=Math.floor(l.x),c=Math.round(l.y),i.y>0?r++:(r--,c--)),y=d<0||d>=e.width||c<0||c>=e.height||"1"==e.pixels[c][d],y){t.active=!1;break}}}}draw(t,e){if(this.vertices.length>0){const s=e.WorldToCanvas(this.center),o=e.WorldToCanvasScale(this.r),r=t.createRadialGradient(s.x,s.y,0,s.x,s.y,o);r.addColorStop(0,"#00000000"),r.addColorStop(1,this.color.toHex()),t.fillStyle=r,t.beginPath();let n=e.WorldToCanvas(this.vertices[0]);t.moveTo(n.x,n.y);for(let i=0;i<this.vertices.length;i++){let s=(i+1)%this.vertices.length;n=e.WorldToCanvas(this.vertices[s]),t.lineTo(n.x,n.y)}t.fill();var i=t.createRadialGradient(s.x,s.y,0,s.x,s.y,o);i.addColorStop(0,this.color.toHex()),i.addColorStop(1,this.color.toHex()),t.strokeStyle=i,t.lineWidth=15,t.lineCap="round",t.beginPath();for(let i=0;i<this.vertices.length;i++){let s=(i+1)%this.vertices.length,o=!this.vertices[i].active&&!this.vertices[i].center,r=!this.vertices[s].active&&!this.vertices[s].center;if(o&&r){let o=e.WorldToCanvas(this.vertices[i]),r=e.WorldToCanvas(this.vertices[s]);t.moveTo(o.x,o.y),t.lineTo(r.x,r.y)}}t.stroke()}}}class o extends t{constructor({id:t,x:e,y:i,w:s,h:o,name:r,cSelf:n,cOther:a,health:h}){super(e,i,s,o),this.id=t,this.cSelf=n,this.cOther=a,this.health=h,this.name=r}draw(t,e,i){t.fillStyle=i?this.cSelf:this.cOther;const s=e.WorldToCanvasRect(this);t.fillRect(s.x,s.y,s.w,s.h),t.font="bold 10px Verdana",t.textAlign="center";let o=e.WorldToCanvas({x:this.getCenterX(),y:this.getBottom()});t.fillText(this.name,o.x,o.y+14)}}window.socket=io.connect(location.url);const r=new class{constructor(){this.axisX=0,this.axisY=0,this.angle=0,this.keys=[]}getKey(t){return this.keys[t]||!1}onKey(t,e=(()=>{}),i=(()=>{})){document.addEventListener("keydown",(i=>{i.code==t&&(this.keys[t]=!0,e(this))})),document.addEventListener("keyup",(e=>{e.code==t&&(this.keys[t]=!1,i(this))}))}recordMovement(t=!0,e=!0){let i=[];t&&i.push("KeyW","KeyA","KeyS","KeyD"),e&&i.push("ArrowUp","ArrowRight","ArrowDown","ArrowLeft");for(const t of i)this.onKey(t,this.updateAxis,this.updateAxis)}updateAxis(t){let e=t.keys.ArrowUp||t.keys.KeyW||!1,i=t.keys.ArrowLeft||t.keys.KeyA||!1,s=t.keys.ArrowDown||t.keys.KeyS||!1,o=t.keys.ArrowRight||t.keys.KeyD||!1;t.axisX=(o?1:0)-(i?1:0),t.axisY=(s?1:0)-(e?1:0),0==t.axisX&&0==t.axisY||(t.angle=Math.atan2(t.axisY,t.axisX))}};r.recordMovement(),r.onKey("Space"),r.onKey("ShiftLeft");const n=document.getElementById("canvas").getContext("2d");let a,h,l=0,d=0,c=0;const y=new class{constructor(){this.map,this.mainPlayer,this.players=[],this.soundwaves=[]}update(t){const i=t.dt;if(t.m&&(this.map=new e(t.m)),t.w)for(let e of t.w)this.soundwaves.push(new s(e));for(let t=this.soundwaves.length-1;t>=0;t--){const e=this.soundwaves[t];e.update(i,this.map),e.alive||this.soundwaves.splice(t,1)}t.p&&this.merge(this.players,t.p,o),this.mainPlayer=this.players.find((t=>t.id==socket.id))}merge(t,e,i){if(e)for(let s of e)if("new"==s.info)t.find((t=>t.id==s.id))?console.log("object was tried to create but id already existed!"):t.push(new i(s));else if("upd"==s.info){let e=t.find((t=>t.id==s.id));if(e)for(let t in s)e[t]=s[t];else console.log("update called on non existing array object!")}else if("del"==s.info){let e=t.indexOf(t.find((t=>t.id==s.id)));e>=0?t.splice(e,1):console.log("delete called on non existing array object!")}}getTree(){let t={m:void 0!==this.map,p:[],w:[]};for(let e of this.players)t.p.push(e.id);for(let e of this.soundwaves)t.w.push(e.id);return t}draw(t,e,i,s){t.fillStyle="#000000",t.fillRect(0,0,i,s);for(const i of this.soundwaves)i.draw(t,e);this.map&&this.map.draw(t,e);for(let i of this.players)i.draw(t,e,i==this.mainPlayer)}},x=new class{constructor(t=0,e=0,i=1){this.x=t,this.y=e,this.zoom=i}WorldToCanvas(t){return{x:(t.x-this.x)*this.zoom,y:(t.y-this.y)*this.zoom}}CanvasToWorld(t){return{x:t.x/this.zoom+this.x,y:t.y/this.zoom+this.y}}WorldToCanvasRect(e){const i=this.WorldToCanvas({x:e.x,y:e.y}),s=this.WorldToCanvasVector({x:e.w,y:e.h});return new t(i.x,i.y,s.x,s.y)}CanvasToWorldRect(e){const i=this.CanvasToWorld({x:e.x,y:e.y}),s=this.CanvasToWorldVector({x:e.w,y:e.h});return new t(i.x,i.y,s.x,s.y)}WorldToCanvasVector(t){return{x:this.WorldToCanvasScale(t.x),y:this.WorldToCanvasScale(t.y)}}CanvasToWorldVector(t){return{x:this.CanvasToWorldScale(t.x),y:this.CanvasToWorldScale(t.y)}}WorldToCanvasScale(t){return t*this.zoom}CanvasToWorldScale(t){return t/this.zoom}}(0,0,100);let f={},u=!0;function w(){let t=document.getElementById("nameInput").value.trim(),e=document.getElementById("colorInput").value;console.log(e),socket.emit("request-join",t,e),socket.on("answer-join",(({answer:t,reasoning:e})=>{let i=document.getElementById("nameError");t?i.classList.add("disabled"):(i.innerHTML=e||"Something must have happened!",i.classList.remove("disabled"))}))}function g(){const t=document.getElementById("canvas");a=t.width=window.innerWidth,h=t.height=window.innerHeight}function v(t,e,i,s,o,r,n,a){if(void 0===a&&(a=!0),void 0===r&&(r=5),"number"==typeof r)r={tl:r,tr:r,br:r,bl:r};else{var h={tl:0,tr:0,br:0,bl:0};for(var l in h)r[l]=r[l]||h[l]}t.beginPath(),t.moveTo(e+r.tl,i),t.lineTo(e+s-r.tr,i),t.quadraticCurveTo(e+s,i,e+s,i+r.tr),t.lineTo(e+s,i+o-r.br),t.quadraticCurveTo(e+s,i+o,e+s-r.br,i+o),t.lineTo(e+r.bl,i+o),t.quadraticCurveTo(e,i+o,e,i+o-r.bl),t.lineTo(e,i+r.tl),t.quadraticCurveTo(e,i,e+r.tl,i),t.closePath(),n&&t.fill(),a&&t.stroke()}socket.on("loop",(t=>{const e=JSON.parse(t);y.update(e),function(){let t=Math.sqrt(window.innerWidth*window.innerHeight);x.zoom=Math.floor(.5*t);let{x:e,y:i}=x.CanvasToWorldVector({x:.5*window.innerWidth,y:.5*window.innerHeight});if(y.mainPlayer){let t=.05;x.x+=(y.mainPlayer.x-e-x.x)*t,x.y+=(y.mainPlayer.y-i-x.y)*t}else 1==l&&(x.x=.5*y.map.width-e,x.y=.5*y.map.height-i)}(),y.draw(n,x,a,h),function(){if(y.mainPlayer){let t=Math.min(200,.3*a),e=30,i=30,s=h-e-30,o=.3;c+=(y.mainPlayer.health-c)*o,d+=(.34-d)*o;let r=[{stat:c,color:"#ff2244",name:"HEALTH"}];for(let o of r){n.fillStyle="#ddd",v(n,i,s,t,e,10,!0,!1),n.fillStyle=o.color;let r=4,a=Math.max(0,Math.min(1,o.stat));v(n,i+r,s+r,a*(t-2*r),e-2*r,5,!0,!1),n.fillStyle="#000000",n.font="bold 16px Verdana",n.textAlign="center",n.fillText(o.name,i+.5*t,s+e-8.7),s-=20+e}}}();const i={tree:y.getTree()};let s=document.getElementById("join-window");if(y.mainPlayer){let t={x:r.axisX,y:r.axisY,shoot:r.getKey("Space"),sneak:r.getKey("ShiftLeft")},e={};for(let i in t)t[i]!=f[i]&&(f[i]=e[i]=t[i]);i.input=e,u&&(s.classList.add("opacity-zero"),setTimeout((()=>{s.classList.add("disabled")}),400),u=!1)}else u||(s.classList.remove("disabled"),setTimeout((()=>{s.classList.remove("opacity-zero")}),3),u=!0);socket.emit("client-data",i),l++})),document.getElementById("nameInput").addEventListener("keypress",(t=>{13==t.keyCode&&w()})),window.joinGame=w,g(),window.addEventListener("resize",g)})();