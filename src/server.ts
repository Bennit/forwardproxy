import { createServer, IncomingMessage, ServerResponse, request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { parse as parseUrl } from 'url';

const proxyPrefix = '/proxy/';

function handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.url.startsWith(proxyPrefix)) {
        proxyRequest(req, res);
    } else {
        res.end('Forward Proxy says Hello!');
    }
}

function proxyRequest(req: IncomingMessage, res: ServerResponse) {
    var url = parseUrl(decodeURI(req.url.substr(proxyPrefix.length)));
    var request = url.protocol === 'http:' ? httpRequest : httpsRequest;
    var req2 = request({
        hostname: url.hostname,
        port: Number.parseInt(url.port),
        path: url.path,
        protocol: url.protocol
    }, (res2) => {
        var body = '';
        res.statusCode = res2.statusCode;
        res.statusMessage = res2.statusMessage;
        console.log('PROXY :: %s %s => %s %s', req.method, url.href, res2.statusCode, res2.statusMessage);
        res2.on('data', (chunk) => {
            res.write(chunk);
        });
        res2.on('end', () => {
            res.end();
        });
    });
    req.on('data', (chunk) => req2.write(chunk));
    req.on('end', () => req2.end());
}

var server = createServer(handleRequest);
server.listen(3000);