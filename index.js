
const http = require('http');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');


program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port number')
  .requiredOption('-c, --cache <cacheDir>', 'Cache directory path')
  .parse(process.argv);

const options = program.opts();
const cacheDir = path.resolve(options.cache);


(async () => {
  try {
    await fs.access(cacheDir);
  } catch (err) {
    console.error(`Error: Cache directory "${cacheDir}" does not exist.`);
    process.exit(1);
  }

  
  const server = http.createServer(async (req, res) => {
    const method = req.method;
    const url = req.url;
    const httpCode = url.slice(1); 
    const filePath = path.join(cacheDir, `${httpCode}.jpg`);


    if (method === 'GET') {
      try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found\n');
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed\n');
    }
  });

  
  server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
  });
})();









