var express = require('express');
var app = express();
const { spawn } = require('child_process');


app.get('/test', function (req, res) {
    const ls = spawn('ls', ['-lh', '/Users']);
    res.end();

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})