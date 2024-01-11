const { createServer } = require("http");
const { join } = require('path/posix');
const { WebSocketServer } = require('ws');
const server = new WebSocketServer({noServer:true});
//check database existance
if(!(fs=require('fs')).existsSync('database.yaml')) fs.writeFileSync('database.yaml','{}')
createServer(async (req, res) => {
	const url = new URL(req.url, "https://0.0.0.0");
	try {
		if (url.pathname === "/") {
			res.writeHead(301,'Redirect to main',{'Location':'https://unimetrics.dreamnity.in'});
			return res.end('API running.');
		}
		const result = await require("./" + join("script", url.pathname))(
			url,
			req,
      res,
      server
		);
		try {
			res.writeHead(200);
		} catch {}
		try {
			res.end(result);
		} catch {}
  } catch (e) {
		try {
			res.writeHead(500);
		} catch {}
		try {
			res.end("Error: " + (e?.message?e?.message?.split('\n')[0]:e));
		} catch(e) {console.log(e);}
	}
})
  .on("upgrade", (request, socket, head) =>
    server.handleUpgrade(request, socket, head, function done(ws) {
      const url = new URL(request.url, "https://0.0.0.0");
      ws.param = {};
      url.searchParams.forEach((v,k)=>ws.param[k] = v);
			server.emit("connection", ws, request);
		})
	).on('error',()=>{})
	.listen(process.env.SERVER_PORT);
