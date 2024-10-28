const http = require('http');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

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
        try {
          const response = await superagent.get(`https://http.cat/${httpCode}`);
          await fs.writeFile(filePath, response.body);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(response.body);
        } catch (err) {
          console.error(`Error fetching image: ${err.message}`);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found\n');
        }
      }
    } else if (method === 'PUT') {
      let body = [];
      req.on('data', chunk => {
        body.push(chunk);
      }).on('end', async () => {
        try {
          const buffer = Buffer.concat(body);
          await fs.writeFile(filePath, buffer);
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('File created or replaced\n');
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error writing file\n');
        }
      });
    } else if (method === 'DELETE') {
      try {
        await fs.unlink(filePath);
        res.writeHead(204, { 'Content-Type': 'text/plain' });
        res.end('File deleted\n');
      } catch (err) {
        console.error(`Error deleting file: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error deleting file\n');
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed\n');
    }
  });

  server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
  });
})();









