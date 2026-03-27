var yt=Object.defineProperty;var Be=t=>{throw TypeError(t)};var wt=(t,e,r)=>e in t?yt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var p=(t,e,r)=>wt(t,typeof e!="symbol"?e+"":e,r),De=(t,e,r)=>e.has(t)||Be("Cannot "+r);var o=(t,e,r)=>(De(t,e,"read from private field"),r?r.call(t):e.get(t)),x=(t,e,r)=>e.has(t)?Be("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),f=(t,e,r,s)=>(De(t,e,"write to private field"),s?s.call(t,r):e.set(t,r),r),b=(t,e,r)=>(De(t,e,"access private method"),r);var We=(t,e,r,s)=>({set _(n){f(t,e,n,r)},get _(){return o(t,e,s)}});var Ge=(t,e,r)=>(s,n)=>{let i=-1;return a(0);async function a(d){if(d<=i)throw new Error("next() called multiple times");i=d;let c,l=!1,h;if(t[d]?(h=t[d][0][0],s.req.routeIndex=d):h=d===t.length&&n||void 0,h)try{c=await h(s,()=>a(d+1))}catch(u){if(u instanceof Error&&e)s.error=u,c=await e(u,s),l=!0;else throw u}else s.finalized===!1&&r&&(c=await r(s));return c&&(s.finalized===!1||l)&&(s.res=c),s}},Et=Symbol(),Rt=async(t,e=Object.create(null))=>{const{all:r=!1,dot:s=!1}=e,i=(t instanceof at?t.raw.headers:t.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?Ot(t,{all:r,dot:s}):{}};async function Ot(t,e){const r=await t.formData();return r?At(r,e):{}}function At(t,e){const r=Object.create(null);return t.forEach((s,n)=>{e.all||n.endsWith("[]")?Ct(r,n,s):r[n]=s}),e.dot&&Object.entries(r).forEach(([s,n])=>{s.includes(".")&&(Pt(r,s,n),delete r[s])}),r}var Ct=(t,e,r)=>{t[e]!==void 0?Array.isArray(t[e])?t[e].push(r):t[e]=[t[e],r]:e.endsWith("[]")?t[e]=[r]:t[e]=r},Pt=(t,e,r)=>{let s=t;const n=e.split(".");n.forEach((i,a)=>{a===n.length-1?s[i]=r:((!s[i]||typeof s[i]!="object"||Array.isArray(s[i])||s[i]instanceof File)&&(s[i]=Object.create(null)),s=s[i])})},rt=t=>{const e=t.split("/");return e[0]===""&&e.shift(),e},jt=t=>{const{groups:e,path:r}=St(t),s=rt(r);return Ht(s,e)},St=t=>{const e=[];return t=t.replace(/\{[^}]+\}/g,(r,s)=>{const n=`@${s}`;return e.push([n,r]),n}),{groups:e,path:t}},Ht=(t,e)=>{for(let r=e.length-1;r>=0;r--){const[s]=e[r];for(let n=t.length-1;n>=0;n--)if(t[n].includes(s)){t[n]=t[n].replace(s,e[r][1]);break}}return t},Pe={},It=(t,e)=>{if(t==="*")return"*";const r=t.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const s=`${t}#${e}`;return Pe[s]||(r[2]?Pe[s]=e&&e[0]!==":"&&e[0]!=="*"?[s,r[1],new RegExp(`^${r[2]}(?=/${e})`)]:[t,r[1],new RegExp(`^${r[2]}$`)]:Pe[s]=[t,r[1],!0]),Pe[s]}return null},Ne=(t,e)=>{try{return e(t)}catch{return t.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return e(r)}catch{return r}})}},kt=t=>Ne(t,decodeURI),st=t=>{const e=t.url,r=e.indexOf("/",e.indexOf(":")+4);let s=r;for(;s<e.length;s++){const n=e.charCodeAt(s);if(n===37){const i=e.indexOf("?",s),a=e.indexOf("#",s),d=i===-1?a===-1?void 0:a:a===-1?i:Math.min(i,a),c=e.slice(r,d);return kt(c.includes("%25")?c.replace(/%25/g,"%2525"):c)}else if(n===63||n===35)break}return e.slice(r,s)},$t=t=>{const e=st(t);return e.length>1&&e.at(-1)==="/"?e.slice(0,-1):e},ne=(t,e,...r)=>(r.length&&(e=ne(e,...r)),`${(t==null?void 0:t[0])==="/"?"":"/"}${t}${e==="/"?"":`${(t==null?void 0:t.at(-1))==="/"?"":"/"}${(e==null?void 0:e[0])==="/"?e.slice(1):e}`}`),nt=t=>{if(t.charCodeAt(t.length-1)!==63||!t.includes(":"))return null;const e=t.split("/"),r=[];let s="";return e.forEach(n=>{if(n!==""&&!/\:/.test(n))s+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){r.length===0&&s===""?r.push("/"):r.push(s);const i=n.replace("?","");s+="/"+i,r.push(s)}else s+="/"+n}),r.filter((n,i,a)=>a.indexOf(n)===i)},_e=t=>/[%+]/.test(t)?(t.indexOf("+")!==-1&&(t=t.replace(/\+/g," ")),t.indexOf("%")!==-1?Ne(t,ot):t):t,it=(t,e,r)=>{let s;if(!r&&e&&!/[%+]/.test(e)){let a=t.indexOf("?",8);if(a===-1)return;for(t.startsWith(e,a+1)||(a=t.indexOf(`&${e}`,a+1));a!==-1;){const d=t.charCodeAt(a+e.length+1);if(d===61){const c=a+e.length+2,l=t.indexOf("&",c);return _e(t.slice(c,l===-1?void 0:l))}else if(d==38||isNaN(d))return"";a=t.indexOf(`&${e}`,a+1)}if(s=/[%+]/.test(t),!s)return}const n={};s??(s=/[%+]/.test(t));let i=t.indexOf("?",8);for(;i!==-1;){const a=t.indexOf("&",i+1);let d=t.indexOf("=",i);d>a&&a!==-1&&(d=-1);let c=t.slice(i+1,d===-1?a===-1?void 0:a:d);if(s&&(c=_e(c)),i=a,c==="")continue;let l;d===-1?l="":(l=t.slice(d+1,a===-1?void 0:a),s&&(l=_e(l))),r?(n[c]&&Array.isArray(n[c])||(n[c]=[]),n[c].push(l)):n[c]??(n[c]=l)}return e?n[e]:n},Lt=it,Tt=(t,e)=>it(t,e,!0),ot=decodeURIComponent,Ke=t=>Ne(t,ot),ae,C,M,ct,lt,Me,z,Je,at=(Je=class{constructor(t,e="/",r=[[]]){x(this,M);p(this,"raw");x(this,ae);x(this,C);p(this,"routeIndex",0);p(this,"path");p(this,"bodyCache",{});x(this,z,t=>{const{bodyCache:e,raw:r}=this,s=e[t];if(s)return s;const n=Object.keys(e)[0];return n?e[n].then(i=>(n==="json"&&(i=JSON.stringify(i)),new Response(i)[t]())):e[t]=r[t]()});this.raw=t,this.path=e,f(this,C,r),f(this,ae,{})}param(t){return t?b(this,M,ct).call(this,t):b(this,M,lt).call(this)}query(t){return Lt(this.url,t)}queries(t){return Tt(this.url,t)}header(t){if(t)return this.raw.headers.get(t)??void 0;const e={};return this.raw.headers.forEach((r,s)=>{e[s]=r}),e}async parseBody(t){var e;return(e=this.bodyCache).parsedBody??(e.parsedBody=await Rt(this,t))}json(){return o(this,z).call(this,"text").then(t=>JSON.parse(t))}text(){return o(this,z).call(this,"text")}arrayBuffer(){return o(this,z).call(this,"arrayBuffer")}blob(){return o(this,z).call(this,"blob")}formData(){return o(this,z).call(this,"formData")}addValidatedData(t,e){o(this,ae)[t]=e}valid(t){return o(this,ae)[t]}get url(){return this.raw.url}get method(){return this.raw.method}get[Et](){return o(this,C)}get matchedRoutes(){return o(this,C)[0].map(([[,t]])=>t)}get routePath(){return o(this,C)[0].map(([[,t]])=>t)[this.routeIndex].path}},ae=new WeakMap,C=new WeakMap,M=new WeakSet,ct=function(t){const e=o(this,C)[0][this.routeIndex][1][t],r=b(this,M,Me).call(this,e);return r&&/\%/.test(r)?Ke(r):r},lt=function(){const t={},e=Object.keys(o(this,C)[0][this.routeIndex][1]);for(const r of e){const s=b(this,M,Me).call(this,o(this,C)[0][this.routeIndex][1][r]);s!==void 0&&(t[r]=/\%/.test(s)?Ke(s):s)}return t},Me=function(t){return o(this,C)[1]?o(this,C)[1][t]:t},z=new WeakMap,Je),Dt={Stringify:1},dt=async(t,e,r,s,n)=>{typeof t=="object"&&!(t instanceof String)&&(t instanceof Promise||(t=t.toString()),t instanceof Promise&&(t=await t));const i=t.callbacks;return i!=null&&i.length?(n?n[0]+=t:n=[t],Promise.all(i.map(d=>d({phase:e,buffer:n,context:s}))).then(d=>Promise.all(d.filter(Boolean).map(c=>dt(c,e,!1,s,n))).then(()=>n[0]))):Promise.resolve(t)},_t="text/plain; charset=UTF-8",qe=(t,e)=>({"Content-Type":t,...e}),be=(t,e)=>new Response(t,e),we,Ee,T,ce,D,A,Re,le,de,Q,Oe,Ae,F,ie,Xe,qt=(Xe=class{constructor(t,e){x(this,F);x(this,we);x(this,Ee);p(this,"env",{});x(this,T);p(this,"finalized",!1);p(this,"error");x(this,ce);x(this,D);x(this,A);x(this,Re);x(this,le);x(this,de);x(this,Q);x(this,Oe);x(this,Ae);p(this,"render",(...t)=>(o(this,le)??f(this,le,e=>this.html(e)),o(this,le).call(this,...t)));p(this,"setLayout",t=>f(this,Re,t));p(this,"getLayout",()=>o(this,Re));p(this,"setRenderer",t=>{f(this,le,t)});p(this,"header",(t,e,r)=>{this.finalized&&f(this,A,be(o(this,A).body,o(this,A)));const s=o(this,A)?o(this,A).headers:o(this,Q)??f(this,Q,new Headers);e===void 0?s.delete(t):r!=null&&r.append?s.append(t,e):s.set(t,e)});p(this,"status",t=>{f(this,ce,t)});p(this,"set",(t,e)=>{o(this,T)??f(this,T,new Map),o(this,T).set(t,e)});p(this,"get",t=>o(this,T)?o(this,T).get(t):void 0);p(this,"newResponse",(...t)=>b(this,F,ie).call(this,...t));p(this,"body",(t,e,r)=>b(this,F,ie).call(this,t,e,r));p(this,"text",(t,e,r)=>!o(this,Q)&&!o(this,ce)&&!e&&!r&&!this.finalized?new Response(t):b(this,F,ie).call(this,t,e,qe(_t,r)));p(this,"json",(t,e,r)=>b(this,F,ie).call(this,JSON.stringify(t),e,qe("application/json",r)));p(this,"html",(t,e,r)=>{const s=n=>b(this,F,ie).call(this,n,e,qe("text/html; charset=UTF-8",r));return typeof t=="object"?dt(t,Dt.Stringify,!1,{}).then(s):s(t)});p(this,"redirect",(t,e)=>{const r=String(t);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,e??302)});p(this,"notFound",()=>(o(this,de)??f(this,de,()=>be()),o(this,de).call(this,this)));f(this,we,t),e&&(f(this,D,e.executionCtx),this.env=e.env,f(this,de,e.notFoundHandler),f(this,Ae,e.path),f(this,Oe,e.matchResult))}get req(){return o(this,Ee)??f(this,Ee,new at(o(this,we),o(this,Ae),o(this,Oe))),o(this,Ee)}get event(){if(o(this,D)&&"respondWith"in o(this,D))return o(this,D);throw Error("This context has no FetchEvent")}get executionCtx(){if(o(this,D))return o(this,D);throw Error("This context has no ExecutionContext")}get res(){return o(this,A)||f(this,A,be(null,{headers:o(this,Q)??f(this,Q,new Headers)}))}set res(t){if(o(this,A)&&t){t=be(t.body,t);for(const[e,r]of o(this,A).headers.entries())if(e!=="content-type")if(e==="set-cookie"){const s=o(this,A).headers.getSetCookie();t.headers.delete("set-cookie");for(const n of s)t.headers.append("set-cookie",n)}else t.headers.set(e,r)}f(this,A,t),this.finalized=!0}get var(){return o(this,T)?Object.fromEntries(o(this,T)):{}}},we=new WeakMap,Ee=new WeakMap,T=new WeakMap,ce=new WeakMap,D=new WeakMap,A=new WeakMap,Re=new WeakMap,le=new WeakMap,de=new WeakMap,Q=new WeakMap,Oe=new WeakMap,Ae=new WeakMap,F=new WeakSet,ie=function(t,e,r){const s=o(this,A)?new Headers(o(this,A).headers):o(this,Q)??new Headers;if(typeof e=="object"&&"headers"in e){const i=e.headers instanceof Headers?e.headers:new Headers(e.headers);for(const[a,d]of i)a.toLowerCase()==="set-cookie"?s.append(a,d):s.set(a,d)}if(r)for(const[i,a]of Object.entries(r))if(typeof a=="string")s.set(i,a);else{s.delete(i);for(const d of a)s.append(i,d)}const n=typeof e=="number"?e:(e==null?void 0:e.status)??o(this,ce);return be(t,{status:n,headers:s})},Xe),y="ALL",Mt="all",Nt=["get","post","put","delete","options","patch"],ht="Can not add a route since the matcher is already built.",ut=class extends Error{},zt="__COMPOSED_HANDLER",Ft=t=>t.text("404 Not Found",404),Ve=(t,e)=>{if("getResponse"in t){const r=t.getResponse();return e.newResponse(r.body,r)}return console.error(t),e.text("Internal Server Error",500)},j,w,ft,S,K,je,Se,he,Ut=(he=class{constructor(e={}){x(this,w);p(this,"get");p(this,"post");p(this,"put");p(this,"delete");p(this,"options");p(this,"patch");p(this,"all");p(this,"on");p(this,"use");p(this,"router");p(this,"getPath");p(this,"_basePath","/");x(this,j,"/");p(this,"routes",[]);x(this,S,Ft);p(this,"errorHandler",Ve);p(this,"onError",e=>(this.errorHandler=e,this));p(this,"notFound",e=>(f(this,S,e),this));p(this,"fetch",(e,...r)=>b(this,w,Se).call(this,e,r[1],r[0],e.method));p(this,"request",(e,r,s,n)=>e instanceof Request?this.fetch(r?new Request(e,r):e,s,n):(e=e.toString(),this.fetch(new Request(/^https?:\/\//.test(e)?e:`http://localhost${ne("/",e)}`,r),s,n)));p(this,"fire",()=>{addEventListener("fetch",e=>{e.respondWith(b(this,w,Se).call(this,e.request,e,void 0,e.request.method))})});[...Nt,Mt].forEach(i=>{this[i]=(a,...d)=>(typeof a=="string"?f(this,j,a):b(this,w,K).call(this,i,o(this,j),a),d.forEach(c=>{b(this,w,K).call(this,i,o(this,j),c)}),this)}),this.on=(i,a,...d)=>{for(const c of[a].flat()){f(this,j,c);for(const l of[i].flat())d.map(h=>{b(this,w,K).call(this,l.toUpperCase(),o(this,j),h)})}return this},this.use=(i,...a)=>(typeof i=="string"?f(this,j,i):(f(this,j,"*"),a.unshift(i)),a.forEach(d=>{b(this,w,K).call(this,y,o(this,j),d)}),this);const{strict:s,...n}=e;Object.assign(this,n),this.getPath=s??!0?e.getPath??st:$t}route(e,r){const s=this.basePath(e);return r.routes.map(n=>{var a;let i;r.errorHandler===Ve?i=n.handler:(i=async(d,c)=>(await Ge([],r.errorHandler)(d,()=>n.handler(d,c))).res,i[zt]=n.handler),b(a=s,w,K).call(a,n.method,n.path,i)}),this}basePath(e){const r=b(this,w,ft).call(this);return r._basePath=ne(this._basePath,e),r}mount(e,r,s){let n,i;s&&(typeof s=="function"?i=s:(i=s.optionHandler,s.replaceRequest===!1?n=c=>c:n=s.replaceRequest));const a=i?c=>{const l=i(c);return Array.isArray(l)?l:[l]}:c=>{let l;try{l=c.executionCtx}catch{}return[c.env,l]};n||(n=(()=>{const c=ne(this._basePath,e),l=c==="/"?0:c.length;return h=>{const u=new URL(h.url);return u.pathname=u.pathname.slice(l)||"/",new Request(u,h)}})());const d=async(c,l)=>{const h=await r(n(c.req.raw),...a(c));if(h)return h;await l()};return b(this,w,K).call(this,y,ne(e,"*"),d),this}},j=new WeakMap,w=new WeakSet,ft=function(){const e=new he({router:this.router,getPath:this.getPath});return e.errorHandler=this.errorHandler,f(e,S,o(this,S)),e.routes=this.routes,e},S=new WeakMap,K=function(e,r,s){e=e.toUpperCase(),r=ne(this._basePath,r);const n={basePath:this._basePath,path:r,method:e,handler:s};this.router.add(e,r,[s,n]),this.routes.push(n)},je=function(e,r){if(e instanceof Error)return this.errorHandler(e,r);throw e},Se=function(e,r,s,n){if(n==="HEAD")return(async()=>new Response(null,await b(this,w,Se).call(this,e,r,s,"GET")))();const i=this.getPath(e,{env:s}),a=this.router.match(n,i),d=new qt(e,{path:i,matchResult:a,env:s,executionCtx:r,notFoundHandler:o(this,S)});if(a[0].length===1){let l;try{l=a[0][0][0][0](d,async()=>{d.res=await o(this,S).call(this,d)})}catch(h){return b(this,w,je).call(this,h,d)}return l instanceof Promise?l.then(h=>h||(d.finalized?d.res:o(this,S).call(this,d))).catch(h=>b(this,w,je).call(this,h,d)):l??o(this,S).call(this,d)}const c=Ge(a[0],this.errorHandler,o(this,S));return(async()=>{try{const l=await c(d);if(!l.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return l.res}catch(l){return b(this,w,je).call(this,l,d)}})()},he),pt=[];function Bt(t,e){const r=this.buildAllMatchers(),s=((n,i)=>{const a=r[n]||r[y],d=a[2][i];if(d)return d;const c=i.match(a[0]);if(!c)return[[],pt];const l=c.indexOf("",1);return[a[1][l],c]});return this.match=s,s(t,e)}var Ie="[^/]+",me=".*",ye="(?:|/.*)",oe=Symbol(),Wt=new Set(".\\+*[^]$()");function Gt(t,e){return t.length===1?e.length===1?t<e?-1:1:-1:e.length===1||t===me||t===ye?1:e===me||e===ye?-1:t===Ie?1:e===Ie?-1:t.length===e.length?t<e?-1:1:e.length-t.length}var J,X,H,ee,Kt=(ee=class{constructor(){x(this,J);x(this,X);x(this,H,Object.create(null))}insert(e,r,s,n,i){if(e.length===0){if(o(this,J)!==void 0)throw oe;if(i)return;f(this,J,r);return}const[a,...d]=e,c=a==="*"?d.length===0?["","",me]:["","",Ie]:a==="/*"?["","",ye]:a.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let l;if(c){const h=c[1];let u=c[2]||Ie;if(h&&c[2]&&(u===".*"||(u=u.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(u))))throw oe;if(l=o(this,H)[u],!l){if(Object.keys(o(this,H)).some(g=>g!==me&&g!==ye))throw oe;if(i)return;l=o(this,H)[u]=new ee,h!==""&&f(l,X,n.varIndex++)}!i&&h!==""&&s.push([h,o(l,X)])}else if(l=o(this,H)[a],!l){if(Object.keys(o(this,H)).some(h=>h.length>1&&h!==me&&h!==ye))throw oe;if(i)return;l=o(this,H)[a]=new ee}l.insert(d,r,s,n,i)}buildRegExpStr(){const r=Object.keys(o(this,H)).sort(Gt).map(s=>{const n=o(this,H)[s];return(typeof o(n,X)=="number"?`(${s})@${o(n,X)}`:Wt.has(s)?`\\${s}`:s)+n.buildRegExpStr()});return typeof o(this,J)=="number"&&r.unshift(`#${o(this,J)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},J=new WeakMap,X=new WeakMap,H=new WeakMap,ee),ke,Ce,Ye,Vt=(Ye=class{constructor(){x(this,ke,{varIndex:0});x(this,Ce,new Kt)}insert(t,e,r){const s=[],n=[];for(let a=0;;){let d=!1;if(t=t.replace(/\{[^}]+\}/g,c=>{const l=`@\\${a}`;return n[a]=[l,c],a++,d=!0,l}),!d)break}const i=t.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let a=n.length-1;a>=0;a--){const[d]=n[a];for(let c=i.length-1;c>=0;c--)if(i[c].indexOf(d)!==-1){i[c]=i[c].replace(d,n[a][1]);break}}return o(this,Ce).insert(i,e,s,o(this,ke),r),s}buildRegExp(){let t=o(this,Ce).buildRegExpStr();if(t==="")return[/^$/,[],[]];let e=0;const r=[],s=[];return t=t.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,i,a)=>i!==void 0?(r[++e]=Number(i),"$()"):(a!==void 0&&(s[Number(a)]=++e),"")),[new RegExp(`^${t}`),r,s]}},ke=new WeakMap,Ce=new WeakMap,Ye),Qt=[/^$/,[],Object.create(null)],He=Object.create(null);function gt(t){return He[t]??(He[t]=new RegExp(t==="*"?"":`^${t.replace(/\/\*$|([.\\+*[^\]$()])/g,(e,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function Jt(){He=Object.create(null)}function Xt(t){var l;const e=new Vt,r=[];if(t.length===0)return Qt;const s=t.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,u],[g,v])=>h?1:g?-1:u.length-v.length),n=Object.create(null);for(let h=0,u=-1,g=s.length;h<g;h++){const[v,R,k]=s[h];v?n[R]=[k.map(([I])=>[I,Object.create(null)]),pt]:u++;let P;try{P=e.insert(R,u,v)}catch(I){throw I===oe?new ut(R):I}v||(r[u]=k.map(([I,m])=>{const $=Object.create(null);for(m-=1;m>=0;m--){const[pe,Le]=P[m];$[pe]=Le}return[I,$]}))}const[i,a,d]=e.buildRegExp();for(let h=0,u=r.length;h<u;h++)for(let g=0,v=r[h].length;g<v;g++){const R=(l=r[h][g])==null?void 0:l[1];if(!R)continue;const k=Object.keys(R);for(let P=0,I=k.length;P<I;P++)R[k[P]]=d[R[k[P]]]}const c=[];for(const h in a)c[h]=r[a[h]];return[i,c,n]}function se(t,e){if(t){for(const r of Object.keys(t).sort((s,n)=>n.length-s.length))if(gt(r).test(e))return[...t[r]]}}var U,B,$e,xt,Ze,Yt=(Ze=class{constructor(){x(this,$e);p(this,"name","RegExpRouter");x(this,U);x(this,B);p(this,"match",Bt);f(this,U,{[y]:Object.create(null)}),f(this,B,{[y]:Object.create(null)})}add(t,e,r){var d;const s=o(this,U),n=o(this,B);if(!s||!n)throw new Error(ht);s[t]||[s,n].forEach(c=>{c[t]=Object.create(null),Object.keys(c[y]).forEach(l=>{c[t][l]=[...c[y][l]]})}),e==="/*"&&(e="*");const i=(e.match(/\/:/g)||[]).length;if(/\*$/.test(e)){const c=gt(e);t===y?Object.keys(s).forEach(l=>{var h;(h=s[l])[e]||(h[e]=se(s[l],e)||se(s[y],e)||[])}):(d=s[t])[e]||(d[e]=se(s[t],e)||se(s[y],e)||[]),Object.keys(s).forEach(l=>{(t===y||t===l)&&Object.keys(s[l]).forEach(h=>{c.test(h)&&s[l][h].push([r,i])})}),Object.keys(n).forEach(l=>{(t===y||t===l)&&Object.keys(n[l]).forEach(h=>c.test(h)&&n[l][h].push([r,i]))});return}const a=nt(e)||[e];for(let c=0,l=a.length;c<l;c++){const h=a[c];Object.keys(n).forEach(u=>{var g;(t===y||t===u)&&((g=n[u])[h]||(g[h]=[...se(s[u],h)||se(s[y],h)||[]]),n[u][h].push([r,i-l+c+1]))})}}buildAllMatchers(){const t=Object.create(null);return Object.keys(o(this,B)).concat(Object.keys(o(this,U))).forEach(e=>{t[e]||(t[e]=b(this,$e,xt).call(this,e))}),f(this,U,f(this,B,void 0)),Jt(),t}},U=new WeakMap,B=new WeakMap,$e=new WeakSet,xt=function(t){const e=[];let r=t===y;return[o(this,U),o(this,B)].forEach(s=>{const n=s[t]?Object.keys(s[t]).map(i=>[i,s[t][i]]):[];n.length!==0?(r||(r=!0),e.push(...n)):t!==y&&e.push(...Object.keys(s[y]).map(i=>[i,s[y][i]]))}),r?Xt(e):null},Ze),W,_,et,Zt=(et=class{constructor(t){p(this,"name","SmartRouter");x(this,W,[]);x(this,_,[]);f(this,W,t.routers)}add(t,e,r){if(!o(this,_))throw new Error(ht);o(this,_).push([t,e,r])}match(t,e){if(!o(this,_))throw new Error("Fatal error");const r=o(this,W),s=o(this,_),n=r.length;let i=0,a;for(;i<n;i++){const d=r[i];try{for(let c=0,l=s.length;c<l;c++)d.add(...s[c]);a=d.match(t,e)}catch(c){if(c instanceof ut)continue;throw c}this.match=d.match.bind(d),f(this,W,[d]),f(this,_,void 0);break}if(i===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,a}get activeRouter(){if(o(this,_)||o(this,W).length!==1)throw new Error("No active router has been determined yet.");return o(this,W)[0]}},W=new WeakMap,_=new WeakMap,et),ve=Object.create(null),er=t=>{for(const e in t)return!0;return!1},G,O,Y,ue,E,q,V,fe,tr=(fe=class{constructor(e,r,s){x(this,q);x(this,G);x(this,O);x(this,Y);x(this,ue,0);x(this,E,ve);if(f(this,O,s||Object.create(null)),f(this,G,[]),e&&r){const n=Object.create(null);n[e]={handler:r,possibleKeys:[],score:0},f(this,G,[n])}f(this,Y,[])}insert(e,r,s){f(this,ue,++We(this,ue)._);let n=this;const i=jt(r),a=[];for(let d=0,c=i.length;d<c;d++){const l=i[d],h=i[d+1],u=It(l,h),g=Array.isArray(u)?u[0]:l;if(g in o(n,O)){n=o(n,O)[g],u&&a.push(u[1]);continue}o(n,O)[g]=new fe,u&&(o(n,Y).push(u),a.push(u[1])),n=o(n,O)[g]}return o(n,G).push({[e]:{handler:s,possibleKeys:a.filter((d,c,l)=>l.indexOf(d)===c),score:o(this,ue)}}),n}search(e,r){var h;const s=[];f(this,E,ve);let i=[this];const a=rt(r),d=[],c=a.length;let l=null;for(let u=0;u<c;u++){const g=a[u],v=u===c-1,R=[];for(let P=0,I=i.length;P<I;P++){const m=i[P],$=o(m,O)[g];$&&(f($,E,o(m,E)),v?(o($,O)["*"]&&b(this,q,V).call(this,s,o($,O)["*"],e,o(m,E)),b(this,q,V).call(this,s,$,e,o(m,E))):R.push($));for(let pe=0,Le=o(m,Y).length;pe<Le;pe++){const Fe=o(m,Y)[pe],N=o(m,E)===ve?{}:{...o(m,E)};if(Fe==="*"){const te=o(m,O)["*"];te&&(b(this,q,V).call(this,s,te,e,o(m,E)),f(te,E,N),R.push(te));continue}const[mt,Ue,ge]=Fe;if(!g&&!(ge instanceof RegExp))continue;const L=o(m,O)[mt];if(ge instanceof RegExp){if(l===null){l=new Array(c);let re=r[0]==="/"?1:0;for(let xe=0;xe<c;xe++)l[xe]=re,re+=a[xe].length+1}const te=r.substring(l[u]),Te=ge.exec(te);if(Te){if(N[Ue]=Te[0],b(this,q,V).call(this,s,L,e,o(m,E),N),er(o(L,O))){f(L,E,N);const re=((h=Te[0].match(/\//))==null?void 0:h.length)??0;(d[re]||(d[re]=[])).push(L)}continue}}(ge===!0||ge.test(g))&&(N[Ue]=g,v?(b(this,q,V).call(this,s,L,e,N,o(m,E)),o(L,O)["*"]&&b(this,q,V).call(this,s,o(L,O)["*"],e,N,o(m,E))):(f(L,E,N),R.push(L)))}}const k=d.shift();i=k?R.concat(k):R}return s.length>1&&s.sort((u,g)=>u.score-g.score),[s.map(({handler:u,params:g})=>[u,g])]}},G=new WeakMap,O=new WeakMap,Y=new WeakMap,ue=new WeakMap,E=new WeakMap,q=new WeakSet,V=function(e,r,s,n,i){for(let a=0,d=o(r,G).length;a<d;a++){const c=o(r,G)[a],l=c[s]||c[y],h={};if(l!==void 0&&(l.params=Object.create(null),e.push(l),n!==ve||i&&i!==ve))for(let u=0,g=l.possibleKeys.length;u<g;u++){const v=l.possibleKeys[u],R=h[l.score];l.params[v]=i!=null&&i[v]&&!R?i[v]:n[v]??(i==null?void 0:i[v]),h[l.score]=!0}}},fe),Z,tt,rr=(tt=class{constructor(){p(this,"name","TrieRouter");x(this,Z);f(this,Z,new tr)}add(t,e,r){const s=nt(e);if(s){for(let n=0,i=s.length;n<i;n++)o(this,Z).insert(t,s[n],r);return}o(this,Z).insert(t,e,r)}match(t,e){return o(this,Z).search(t,e)}},Z=new WeakMap,tt),bt=class extends Ut{constructor(t={}){super(t),this.router=t.router??new Zt({routers:[new Yt,new rr]})}},sr=t=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...t},s=(i=>typeof i=="string"?i==="*"?()=>i:a=>i===a?a:null:typeof i=="function"?i:a=>i.includes(a)?a:null)(r.origin),n=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(r.allowMethods);return async function(a,d){var h;function c(u,g){a.res.headers.set(u,g)}const l=await s(a.req.header("origin")||"",a);if(l&&c("Access-Control-Allow-Origin",l),r.credentials&&c("Access-Control-Allow-Credentials","true"),(h=r.exposeHeaders)!=null&&h.length&&c("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),a.req.method==="OPTIONS"){r.origin!=="*"&&c("Vary","Origin"),r.maxAge!=null&&c("Access-Control-Max-Age",r.maxAge.toString());const u=await n(a.req.header("origin")||"",a);u.length&&c("Access-Control-Allow-Methods",u.join(","));let g=r.allowHeaders;if(!(g!=null&&g.length)){const v=a.req.header("Access-Control-Request-Headers");v&&(g=v.split(/\s*,\s*/))}return g!=null&&g.length&&(c("Access-Control-Allow-Headers",g.join(",")),a.res.headers.append("Vary","Access-Control-Request-Headers")),a.res.headers.delete("Content-Length"),a.res.headers.delete("Content-Type"),new Response(null,{headers:a.res.headers,status:204,statusText:"No Content"})}await d(),r.origin!=="*"&&a.header("Vary","Origin",{append:!0})}};const ze=new bt;ze.use("/api/*",sr());ze.get("/",t=>t.html(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>אזרחות 2026 | המרכז ללמידה מונגשת</title>
    <link href="https://fonts.googleapis.com/css2?family=Alef:wght@400;700&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --deep-coal: #1A1C1E;
            --surface-dark: #232528;
            --brushed-gold: #C5A059;
            --off-white: #E0E0E0;
            --radius-main: 12px;
            --motion-smooth: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            --border-red: rgba(239, 68, 68, 0.5);
            --hint-green: rgba(16, 185, 129, 0.15);
            --border-green: rgba(16, 185, 129, 0.5);
        }

        body { 
            background-color: var(--deep-coal); 
            color: var(--off-white); 
            font-family: 'Alef', sans-serif; 
            margin: 0; padding: 0; 
            overflow-x: hidden; scroll-behavior: smooth;
        }

        /* --- Layout & Spine --- */
        .header-area { 
            padding: 20px 40px; background: rgba(26, 28, 30, 0.9); 
            backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }

        .layout-wrapper {
            display: grid; grid-template-columns: 80px 1fr;
            max-width: 1100px; margin: 40px auto; gap: 40px; padding: 0 20px;
        }

        .golden-spine { position: relative; }
        .spine-track { position: absolute; right: 39px; top: 0; bottom: 0; width: 2px; background: rgba(224, 224, 224, 0.1); }
        .spine-progress { position: absolute; right: 39px; top: 0; width: 2px; background: var(--brushed-gold); transition: height 300ms ease-out; }
        .spine-nodes { 
            list-style: none; padding: 0; margin: 0; position: sticky; top: 120px; 
            display: flex; flex-direction: column; gap: 60px; z-index: 3;
        }
        .spine-node {
            width: 32px; height: 32px; border-radius: 50%; background: var(--deep-coal);
            border: 2px solid rgba(224, 224, 224, 0.2); display: flex; align-items: center;
            justify-content: center; transition: var(--motion-smooth); cursor: pointer;
            position: relative; font-weight: bold; color: rgba(224,224,224,0.4);
        }
        .spine-node.active { border-color: var(--brushed-gold); color: var(--brushed-gold); box-shadow: 0 0 15px rgba(197, 160, 89, 0.3); }

        /* --- Cards & UI Elements --- */
        .card {
            background: var(--surface-dark); border-radius: var(--radius-main);
            padding: 30px; margin-bottom: 30px; border: 1px solid rgba(197, 160, 89, 0.05);
            transition: var(--motion-smooth);
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

        .search-input {
            width: 100%; padding: 15px; background: var(--deep-coal);
            border: 1px solid rgba(197, 160, 89, 0.3); border-radius: var(--radius-main);
            color: white; font-size: 1.1rem; outline: none; transition: var(--motion-smooth);
        }
        .search-input:focus { border-color: var(--brushed-gold); box-shadow: 0 0 10px rgba(197,160,89,0.2); }

        .action-btn {
            background: transparent; color: var(--brushed-gold); border: 1px solid var(--brushed-gold);
            padding: 12px 24px; border-radius: var(--radius-main); cursor: pointer;
            font-family: 'Rubik', sans-serif; transition: var(--motion-smooth);
        }
        .action-btn:hover { background: rgba(197, 160, 89, 0.1); }

        /* --- Scaffolding & Quiz --- */
        .scaffold-box {
            max-height: 0; opacity: 0; overflow: hidden;
            transition: max-height 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease;
            background: rgba(197, 160, 89, 0.05); border-right: 3px solid var(--brushed-gold);
        }
        .scaffold-box.open { max-height: 200px; opacity: 1; padding: 15px; margin-top: 10px; }

        @media (max-width: 768px) { .layout-wrapper { grid-template-columns: 1fr; } .golden-spine { display: none; } }
    </style>
</head>
<body>

<header class="header-area">
    <div style="font-family: 'Rubik'; font-weight: bold; color: var(--brushed-gold); font-size: 1.5rem;">אזרחות 2026</div>
    <div id="status-badge" style="font-size: 0.8rem; opacity: 0.6;">מצב ארכיטקט פעיל</div>
</header>

<div class="layout-wrapper">
    <aside class="golden-spine">
        <div class="spine-track"></div>
        <div class="spine-progress" id="spine-progress"></div>
        <ul class="spine-nodes">
            <li class="spine-node active" data-target="sec-search">1</li>
            <li class="spine-node" data-target="sec-nano">2</li>
            <li class="spine-node" data-target="sec-quiz">3</li>
        </ul>
    </aside>

    <main>
        <section id="sec-search" class="card">
            <h2 style="color: var(--brushed-gold);">חיפוש מושגים חכם</h2>
            <input type="text" id="concept-search" class="search-input" placeholder="הקלד מושג (למשל: אפליה, שוויון)...">
            <div id="concepts-list" style="margin-top: 20px;"></div>
        </section>

        <section id="sec-nano" class="card">
            <h2 style="color: var(--brushed-gold);">זירת הניתוח: ננו-בננה</h2>
            <p>כאן תוכל להשוות בין מושגים דומים כדי למנוע בלבול.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="card" style="background: rgba(224,224,224,0.02);">הבחנה מותרת</div>
                <div class="card" style="background: rgba(224,224,224,0.02);">אפליה פסולה</div>
            </div>
        </section>

        <section id="sec-quiz" class="card">
            <h2 style="color: var(--brushed-gold);">תרגול אינטראקטיבי</h2>
            <div id="quiz-app"></div>
        </section>
    </main>
</div>

<script>
    // === DATA ===
    const memorySentences = {
        "dist_01": "זוכר? אפליה פסולה היא יחס שונה מסיבה לא עניינית (דעה קדומה).",
        "dist_02": "עוגן: הבחנה מותרת מתקיימת רק כשיש שוני רלוונטי לנושא.",
        "dist_03": "טיפ: העדפה מתקנת היא זמנית ונועדה לצמצם פערים חברתיים."
    };

    const conceptsData = [
        { name: "אפליה פסולה", def: "יחס שונה לבני אדם ללא סיבה מוצדקת.", unit: "ערכי יסוד" },
        { name: "הבחנה מותרת", def: "יחס שונה כאשר השוני רלוונטי לעניין.", unit: "ערכי יסוד" },
        { name: "העדפה מתקנת", def: "הטבה זמנית לקבוצה שקופחה בעבר.", unit: "ערכי יסוד" }
    ];

    const quizQuestions = [
        {
            q: "חברה מסרבת לקבל לעבודה נשים כי 'זה לא מתאים לאופי המשרד'. מה זה?",
            options: [
                { text: "הבחנה מותרת", isCorrect: false, hintId: "dist_02" },
                { text: "אפליה פסולה", isCorrect: true, feedback: "נכון! זו סיבה לא עניינית." },
                { text: "העדפה מתקנת", isCorrect: false, hintId: "dist_03" }
            ]
        }
    ];

    // === SEARCH LOGIC (Zero-Jank) ===
    const state = { searchTerm: '', ticking: false };
    const searchInput = document.getElementById('concept-search');
    const listContainer = document.getElementById('concepts-list');

    function renderSearch() {
        const fragment = document.createDocumentFragment();
        const filtered = conceptsData.filter(c => c.name.includes(state.searchTerm));
        
        filtered.forEach(c => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '15px';
            div.innerHTML = '<strong>' + c.name + ':</strong> ' + c.def;
            fragment.appendChild(div);
        });
        listContainer.innerHTML = '';
        listContainer.appendChild(fragment);
    }

    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        if (!state.ticking) {
            requestAnimationFrame(() => {
                renderSearch();
                state.ticking = false;
            });
            state.ticking = true;
        }
    });

    // === QUIZ LOGIC (Scaffolding) ===
    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-app');
        const q = quizQuestions[0];
        
        quizContainer.innerHTML = \`
            <p style="font-size: 1.2rem; margin-bottom: 20px;">\${q.q}</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                \${q.options.map((opt, i) => \`
                    <div>
                        <button class="action-btn" style="width:100%; text-align:right;" 
                                onclick="handleAnswer(this, \${opt.isCorrect}, '\${opt.hintId || ''}', '\${opt.feedback || ''}')">
                            \${opt.text}
                        </button>
                        <div class="scaffold-box"></div>
                    </div>
                \`).join('')}
            </div>
        \`;
    }

    window.handleAnswer = (btn, isCorrect, hintId, feedback) => {
        const box = btn.nextElementSibling;
        if (isCorrect) {
            btn.style.borderColor = 'var(--border-green)';
            box.innerHTML = feedback;
            box.classList.add('open');
        } else {
            btn.style.borderColor = 'var(--border-red)';
            box.innerHTML = memorySentences[hintId];
            box.classList.add('open');
        }
    };

    // === SPINE LOGIC ===
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const nodes = document.querySelectorAll('.spine-node');
        const progress = document.getElementById('spine-progress');
        
        let activeIdx = 0;
        sections.forEach((sec, idx) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) activeIdx = idx;
        });

        nodes.forEach((n, i) => {
            n.classList.toggle('active', i === activeIdx);
        });
        progress.style.height = (activeIdx * 90) + 'px';
    });

    // Start
    renderSearch();
    renderQuiz();
<\/script>

</body>
</html>`));const Qe=new bt,nr=Object.assign({"/src/index.tsx":ze});let vt=!1;for(const[,t]of Object.entries(nr))t&&(Qe.all("*",e=>{let r;try{r=e.executionCtx}catch{}return t.fetch(e.req.raw,e.env,r)}),Qe.notFound(e=>{let r;try{r=e.executionCtx}catch{}return t.fetch(e.req.raw,e.env,r)}),vt=!0);if(!vt)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Qe as default};
