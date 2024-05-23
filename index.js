// Settings
const port = 3000;
const hostname = "0.0.0.0";
const contentDir = `${__dirname}/public`;
const defaultUrl = "/index.htm";
const appPath = "app"; // example: http://domain.tld/app/<some-app>

// Libraries
const http = require("node:http");
//const path = require("node:path");
const fs = require("node:fs");
const url = require("node:url");
const querystring = require("node:querystring");

// simple mime-type resolver
const mime = {
  types:
    "htm=text/html,html=text/html,css=text/css,js=text/javascript,png=image/png,jpg=image/jpeg,ico=image/x-icon,json=application/json"
      .split(",")
      .map((str) => str.split("="))
      .map((arr) => ({ [arr[0]]: arr[1] }))
      .reduce((result, item) => Object.assign(result, item), {}),

  getType: function (fname) {
    return (
      this.types[fname.split(".").pop()] || "application/octet-stream" // alternative: path.extname().slice(1)
    );
  },
};

// Handlers
const app = {
  parseBody: function (body) {
    try {
      return JSON.parse(body) || {};
    } catch (exc) {
      return {};
    }
  },

  appHandler: function (req, res, reqPath, body) {
    const input =
      "POST,PUT,PATCH".split(",").indexOf(req.method) < 0
        ? querystring.parse(url.parse(req.url).query) || {}
        : this.parseBody(body);
    const data = {
      path: req.url,
      message: `hello ${input.name || "noname"}`,
    };

    res.writeHead(200, { "Content-Type": mime.getType("app.json") });
    res.end(JSON.stringify(data));
  },

  fileHandler: function (req, res, reqPath) {
    const file = `${contentDir}${reqPath}`; // TODO improve path security

    fs.access(file, fs.constants.R_OK, (err) => {
      if (err) {
        res.writeHead(404, { "Content-Type": mime.getType("404.htm") });
        res.end("404. Page not found");
      } else {
        fs.readFile(file, "utf8", (err, data) => { // TODO support binary files
          if (err) {
            console.log(err);
          }
          res.writeHead(200, { "Content-Type": mime.getType(file) });
          res.end(data);
        });
        //fs.createReadStream(file).pipe(res);  // for downloads
      }
    });
  },

  server: function (req, res) {
    const bodyParts = [];

    req
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        const body = Buffer.concat(bodyParts).toString();
        const reqPath = req.url != "/" ? req.url : defaultUrl;

        reqPath.split("/")[1] == appPath
          ? this.appHandler(req, res, reqPath, body)
          : this.fileHandler(req, res, reqPath);
      });
  },
};

// Start server
const server = http
  .createServer(app.server.bind(app))
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });
