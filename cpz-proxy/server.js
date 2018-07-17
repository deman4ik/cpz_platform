var http = require('http')
var net = require('net')
var url = require('url')
var tr = require('tor-request');
tr.TorControlPort.password = 'cryptuoso'; //TODO: environment variable
const ipservices = [
    "http://icanhazip.com",
    "http://ifconfig.me/ip",
    "http://ifconfig.me",
    "https://api.ipify.org",
    "http://ip.appspot.com",
    "http://ip-spot.com"
  ];
  //TODO: move to external file
  function findExternalIp(request, done) {
    let iterator = 0;
    function tick() {
     const url = ipservices[iterator++];
      if (!url) return done(null);
  
      request(url, (err_, req_, body) => {
        if (err_) {
          console.log(err_);
          tick();
        } else {
          done(body);
        }
      });
    }
    tick();
  }
  //TODO: Authentication
var server = http.createServer(function(request, response) {
    console.log(request.url)

    var ph = url.parse(request.url)
    var options = {
        port: ph.port,
        hostname: ph.hostname,
        method: request.method,
        path: ph.path,
        headers: request.headers
    }
    var proxyRequest = tr.request(request.url,options,(err)=>{
        console.log(err);
    });
    proxyRequest.on('response', function(proxyResponse) {
        proxyResponse.on('data', function(chunk) {
            response.write(chunk, 'binary')
        })
        proxyResponse.on('end', function() { response.end() })
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
    })
    request.on('data', function(chunk) {
        proxyRequest.write(chunk, 'binary')
    })
    request.on('end', function() { proxyRequest.end() })
}).on('connect', function(request, socketRequest, head) {
    console.log(request.url);
    tr.renewTorSession((err) => {
        if (err) {console.log(err)}
      
    findExternalIp(tr.request, (ip) => {
        console.log(ip);
       });
    var ph = url.parse('http://' + request.url);

    var socket = net.connect(ph.port, ph.hostname, function() {
        socket.write(head)
        // Сказать клиенту, что соединение установлено
        socketRequest.write("HTTP/" + request.httpVersion + " 200 Connection established\r\n\r\n")
    })
    // Туннелирование к хосту
    socket.on('data', function(chunk) { socketRequest.write(chunk) })
    socket.on('end', function() { socketRequest.end() })
    socket.on('error', function() {
        // Сказать клиенту, что произошла ошибка
        socketRequest.write("HTTP/" + request.httpVersion + " 500 Connection error\r\n\r\n")
        socketRequest.end()
    })
    // Туннелирование к клиенту
    socketRequest.on('data', function(chunk) { socket.write(chunk) })
    socketRequest.on('end', function() { socket.end() })
    socketRequest.on('error', function() { socket.end() })
});
}).listen(process.env.NODE_PORT || process.env.PORT || 3323, err => {
    if (err) throw err;
    console.log(
      `> CPZ Proxy Ready on http://localhost:${process.env.NODE_PORT ||
        process.env.PORT ||
        3323}`
    );
  });