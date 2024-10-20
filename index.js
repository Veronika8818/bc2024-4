const http = require('http'); 
const { program } = require('commander');
 const fs = require('fs');
 const path = require('path');

program
 .requiredOption('-h, --host <host>', 'Server host address') 
.requiredOption('-p, --port <port>', 'Server port number')
.requiredOption('-c, --cache <cacheDir>', 'Cache directory path') 
.parse(process.argv);

const options = program.opts();

const cacheDir = path.resolve(options.cache);
 if (!fs.existsSync(cacheDir)) { 
console.error(`Error: Cache directory "${cacheDir}" does not exist.`);
 process.exit(1); 
}

const server = http.createServer((req, res) => { 
 res.writeHead(200); 
res.end('Hello!\n');
 });

server.listen(options.port, options.host, () => { 
console.log(`Server running at http://${options.host}:${options.port}/`);
});
