'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const server=http.createServer((req,res)=>{
 if(req.headers.host!=='127.0.0.1:18765'){res.writeHead(403);return res.end();}
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('immersion-sound-local-v1');}
 if(req.url!=='/'&&req.url!=='/index.html'&&req.url!=='/sphere-audio.js'){res.writeHead(404);return res.end();}
 res.writeHead(200,{'Content-Type':req.url==='/sphere-audio.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','Permissions-Policy':'microphone=(self), speaker-selection=(self)'});
 fs.createReadStream(path.join(__dirname,req.url==='/sphere-audio.js'?'sphere-audio.js':'index.html')).pipe(res);
});
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
server.listen(18765,'127.0.0.1',()=>console.log('Immersion : http://127.0.0.1:18765'));
