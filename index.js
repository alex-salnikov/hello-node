//import http from 'http';
const http = require('node:http')

const hostname = '127.0.0.1'
const port = 3000
const url = `http://${hostname}:${port}/`

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello, World!')
});

server.listen(port, hostname, () => {
  console.log(`Server running at ${url}`)
});
