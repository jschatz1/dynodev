var express = require('express');
var app = express();

app.get('/', function(req, res){
   res.send("<h1 style='font-family:arial;'>Hello world!</h1>");
});

app.listen(8080, '0.0.0.0');