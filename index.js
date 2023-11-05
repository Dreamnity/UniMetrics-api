const { createServer } = require("http");
const {join} = require('path/posix');
createServer(async (req, res) => {
	const url = new URL(req.url, "https://0.0.0.0");
	try {
		if (url.pathname === "/") return res.end("Working");
		const result = await require("./" + join("script", url.pathname))(
			url,
			req,
			res
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
			res.end("500 Internal Server Error: " + e.message);
		} catch {}
	}
})
	.on("upgrade", (request, socket, head) =>
		server.handleUpgrade(request, socket, head, function done(ws) {
			server.emit("connection", ws, request);
		})
	)
	.listen(8000);
