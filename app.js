var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

/*
	1. Connection to the Database
	2. Delivering the static pages
	3. Delivering the Homepage
	4. Post request to register
	5. Get request to deliver the Register page

*/

//1. Connect to database
mongoose.connect('mongodb://pratik:1234@pratik:27017/xerox');

var classes = new mongoose.Schema({
	collegeID : String,
	mobile    : String,
	pwd       : String,
	branch    : String,
});


var urlencodedParser = bodyParser.urlencoded({ extended: false});

var app = express();

//2. Delivering the static pages
app.use(express.static('Styles'));
app.use('/register', express.static('Styles'));

//3. Delivering the homepage
app.get('/',function(req, res) {
	console.log('Delivering Homepage'+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('homepage.html', 'utf8');
	readStream.pipe(res);
});

//4. The register method doesn't yet consider the presence of duplicates in the collection

app.post('/register', urlencodedParser, function(req, res){

	//Now create a model by this name
	var mod = mongoose.model('TheClasses', classes);

	

	mod.find({'collegeID' : req.collegeID}, function(err, data){
		var newClass = mod(req.body).save(function(err){
				if(err) throw err;
				res.end();
			});	
	});
	
});

//5. Delivering the Register page
app.get('/register',function(req,res){
	console.log('Delivering Register page '+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('studentRegister.html', 'utf8');
	readStream.pipe(res);
});

// Listening to the server
app.listen(3000, function(){
	console.log("Listening on port 3000");
});