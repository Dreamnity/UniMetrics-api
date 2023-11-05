const { createServer } = require("http");
const {join} = require('path/posix')
createServer(async (req, res) => {
	const url = new URL(req.url, "https://0.0.0.0");
    try {
        if(url.pathname==='/') return res.end('Working');
        const result = await (require('./'+join('script', url.pathname)))(url)
        res.writeHead(200);
        res.end(result);
	} catch (e) {
		res.writeHead(500);
		res.end("500 Internal Server Error: "+e.message);
	}
}).listen(8000);
