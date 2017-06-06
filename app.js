var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//Connect to database
mongoose.connect('mongodb://pratik:1234@pratik:27017/xerox');
var classes = new mongoose.Schema({
	collegeID : String,
	mobile    : String,
	pwd       : String,
	branch    : String,
});


var urlencodedParser = bodyParser.urlencoded({ extended: false});

var app = express();

app.use(express.static('Styles'));
app.use('/register', express.static('Styles'));

app.get('/',function(req, res) {
	console.log('Delivering Homepage'+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('homepage.html', 'utf8');
	readStream.pipe(res);
});

app.post('/register', urlencodedParser, function(req, res){

	//Now create a model by this name
	var mod = mongoose.model('TheClasses', classes);

	

	mod.find({'collegeID' : req.collegeID}, function(err, data){
		if(data.mobile === {}){
			var newClass = mod(req.body).save(function(err){
				if(err) throw err;
				res.end();
			});	
			
		}
		else{
				console.log('User Exists!');
		}
	});
	
});

app.get('/register',function(req,res){
	console.log('Delivering Register page '+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('studentRegister.html', 'utf8');
	readStream.pipe(res);
});

app.listen(3000, function(){
	console.log("Listening on port 3000");
});