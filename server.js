var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var port = 8080;

// Routes
var game = require('./routes/game.js');
var api = require('./routes/api.js');

// Express
var app = express();

// View Engine

//set the views directly 
app.set('views', path.join(__dirname, './front-end/build'));
//set the view engine
app.set('view engine','ejs');
//template engine
app.engine('html', require('ejs').renderFile);

// Static Files
app.use(express.static(path.join(__dirname,"./front-end/build")));

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Routes
app.use('/', game);
app.use('/api', api);

var server = app.listen(port,function(){
    console.log("Server started on port " + port);
});

//socket stuff
var io = require('socket.io')(server);
//var gameNamespace = io.of('/game');

io.on("connection",function(socket){
    console.log("Client connected");
    
    require('./sockets/chatSocket')(io,socket);
    require('./sockets/gameSocket')(io,socket);
})