var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var index = require('./routes/index');
app.use('/', index);

// CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
    console.log(req.body);
});

//Setting up server
 var server = app.listen(config.server.port || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });



//Function to connect to database and execute query


//GET API
// app.get("/api/user", function(req , res){
// 	console.log("get contact");
//     var query = "select * from [tb_user]";
//     executeQuery(res, query);
// });