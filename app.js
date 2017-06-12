var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var session = require('express-session')

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.set('view engine', 'ejs');
/*
	1. Connection to the Database
	2. Delivering the static pages
	3. Delivering the Homepage
	4. Post request to register
	5. Get request to deliver the Register page
*/

//1. Connect to database
mongoose.connect('mongodb://pratik:1234@ds028540.mlab.com:28540/xerox', function(err){
	if(err){	
		console.log('Could not connect to the server! Try again');
		throw err;
	}
});

var classes = new mongoose.Schema({
	collegeID : String,
	name      : String,
	mobile    : String,
	pwd       : String,
	branch    : String,
});

var copies = new mongoose.Schema({
	copy_name : String,
	branch	  : String,
	date 	  : Date,
	price     : Number,
});

var class_mod = mongoose.model('TheClasses', classes);
var copies_mod = mongoose.model('copies', copies);

var urlencodedParser = bodyParser.urlencoded({ extended: false});

//2. Delivering the static pages
app.use(express.static('Styles'));
app.use('/register', express.static('Styles'));
app.use('/', express.static('images'));
app.use('/register', express.static('images'));
app.use(session({secret: "d3h5j3g5h6k6l32lljj", resave: false, saveUninitialized:true}));


//3. Delivering the homepage
app.get('/',function(req, res) {
	console.log('Delivering Homepage'+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('pages/homepage.html', 'utf8');
	readStream.pipe(res);
});

//4. The register method doesn't yet consider the presence of duplicates in the collection

app.post('/register', urlencodedParser, function(req, res){

	//Now create a model by this name	

	class_mod.find({'collegeID' : req.body.collegeID}, function(err, data){
		if(data.length === 0){
			var newClass = class_mod(req.body).save(function(err){
				if(err) throw err;
				res.writeHead(200,{'content-Type' : 'text/html'});
				var readStream = fs.createReadStream('pages/homepage.html', 'utf8');
				readStream.pipe(res);
			});	
		}
		else{
			console.log(data);
			res.render('message', {'message' : "User already exists!"})
		}
		
	});
	
});

//5. Delivering the Register page
app.get('/register',function(req,res){
	console.log('Delivering Register page '+ req.url);
	res.writeHead(200,{'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('pages/studentRegister.html', 'utf8');
	readStream.pipe(res);
});

app.post('/getdata', function(req, res){
	console.log("Getting data for: "+ req.body.branch);
	class_mod.find({'branch' : req.body.branch}, function(err, data){
		if(err) throw err;
		res.render('viewStudents', {values : data});
	});
});

app.get('/getdata', function(req, res){
	console.log("Getting data for: "+ req.body.branch);
	class_mod.find({'branch' : req.body.branch}, function(err, data){
		if(err) throw err;
		res.render('viewStudents', {values : data});
	});
});


//Delivering the Login page
app.get('/login', function(req, res){
	if(req.session.user){
		console.log("Already logged in");
		class_mod.find({'collegeID' : req.session.user.collegeID}, function(err, data){
			if(err) console.log(err);
			res.render('welcome', { Data :  data });
		});
	}else{
		res.writeHead(200, {'content-Type' : 'text/html'});
		var readStream = fs.createReadStream('pages/loginpage.html', 'utf8');
		readStream.pipe(res);
	}	
});

//Logging in from the login page using POST method
app.post('/login', function(req, res){
	//Now create a model by this name	
	console.log(req.session.user);
	class_mod.find({'collegeID' : req.body.collegeID}, function(err, data){
		if(err) throw err;
		//console.log(data);
		if(data.length !=0){
			if(data[0].pwd === req.body.pass){
				//	console.log(data);
				req.session.user = req.body;
				res.render('welcome', {Data : data});
			}
		}
		else{
				res.render('message', {message : "It seems that you aren't signed up"});
		}
	});
	
});

app.post('/logout', function(req, res){
	req.session.destroy();
	res.writeHead(200, {'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('pages/homepage.html', 'utf8');
	readStream.pipe(res);
});

app.get('/upload', function(req, res){
	res.writeHead(200, {'content-Type' : 'text/html'});
	var readStream = fs.createReadStream('pages/upload.html', 'utf8');
	readStream.pipe(res);
});

app.post('/upload', function(req, res){
	req.body.date = new Date();
	var copy = copies_mod(req.body).save(function(err){
				if(err){
					res.render('message', {message : "Couldn't upload!"});
					throw err;	
				} 
				res.render('message', {message : "Uploaded: " + req.body.copy_name});
			});	
});


app.post('/dashboard', function(req, res){
	console.log(req.session.user);
	if(!req.session.user){
		res.render('message', {message : "You are not logged in!"});
	}

	class_mod.find({'collegeID' : req.session.user.collegeID}, function(err, data){
			if(err) console.log(err);
			res.render('dashboard', { Data :  data });
	});
});

app.post('/edit', function(req, res){
	class_mod.find({'collegeID' : req.session.user.collegeID}, function(err, data){
			if(err) console.log(err);
			res.render('editpage', { user :  data });
	});
});

app.post('/save', function(req, res){
	var query = {'collegeID' : req.body.collegeID};

	class_mod.findOneAndUpdate(query, req.body, {upsert:true}, function(err, doc){
	    if (err) return res.send(500, { error: err });
	    class_mod.find({'collegeID' : req.session.user.collegeID}, function(error, data){
			if(error) console.log(error);
			res.render('dashboard', { Data :  data });
		});
	});
});

app.post('/welcome', function(req, res){
	class_mod.find({'collegeID' : req.session.user.collegeID}, function(err, data){
		if(err) console.log(err);
		res.render('welcome', { Data :  data });
	});
});

// Listening to the server
app.listen(3000 ,function(){
	console.log("Listening on port 3000");
});
