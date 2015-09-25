// Simple server
// Modules
var http = require('http');
var url= require('url');
var fs = require('fs');
var pm = require('path');
var qs = require('querystring');
var Q = require('q');


var votes_path = '/votes',
	default_path='/',
	salute_path='/salute',
	text_path = 'data/texto.txt',
    default_page='table.html';


var files_to_serve_regex = /^.*\.(html|txt|pdf|css|png|jpg|js)$/;
var htmlReg =/^.*\.(htm|html)$/;
var cssReg =/^.*\.css$/;
var jsReg =/^.*\.js$/;
var pdfReg =/^.*\.pdf$/;
var pngReg =/^.*\.png$/;
var jpgReg =/^.*\.jpg$/;
var txtReg =/^.*\.txt$/;





// Server parameters
var port = 8080;
function serveroptions(){
	this.req= '';
	this.res='';
	this.path= '';
	this.actions= '';
}

var server= new serveroptions();

function initWorkFlow(){
	return Q(); // Promesa vacia
};

function setPath(){
	var d = Q.defer();
	var urlObj = url.parse(server.req.url);
	var path= urlObj.pathname;
	server.path=path;
	d.resolve(server);
	return d.promise;
}

function handleFileToServe(path, req, res){
   path=path.substring(1, path.length);
   console.log("Trying to serve "+__dirname+path);
   var type=null, enc="utf8";
   if(htmlReg.test(path)){
      type='text/html';
   }else if(txtReg.test(path)){
	  type = 'text/plain'
   }else if(cssReg.test(path)){
      type='text/css';
   }else if(jsReg.test(path)){
      type='text/javascript';
   }else if(pdfReg.test(path)){
      type='application/pdf';
   }else if(pngReg.test(path)){
      type='image/png';
	  enc=null;
   }else if(jpgReg.test(path)){
      enc=null;
      type='image/jpg';
   }else{
      handleInvalidPath(req, res, {status:400, msg:'Invalid type'});
	  return;
   };
   console.log("type ="+type);
   var filename=pm.join(__dirname, path);
   console.log("getting: "+filename);
   var file;
   try{
     if(enc)
       file=fs.readFileSync(filename, enc);
     else
      file=fs.readFileSync(filename);
   }catch(e){
      console.log(e);
      handleInvalidPath(req, res, {status:400, msg:'Not found'});
	  return;
   };
   console.log("file was read");
   res.writeHead(200, {'Content-Type': type});
   res.write(file);
   res.end();
   return;
   
};
function handleInvalidPath(req, res, options){
	console.log("Entra a handleInvalidPath");
        var status=500, 
		    msg='Invalid Path Requested';
		if(options){
           res.statusCode = options["status"] || status;
		   msg = options["msg"] || msg;
		};
        res.setHeader('content-type', 'application/json');
		var data = {votes:['server error'+msg]};
		res.write(JSON.stringify(data));
		res.end();
};

function serveHello(req, res){

	    var who = url.parse(req.url, true).query.who;
	    res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
		res.write('<!doctype html>');
		res.write('<head><title>Hello World</title></head>');
		res.write('<h1>Hello '+who+ '!</h1>');
		res.end();
    };

    function handle_default_page(req, res){
   fs.readFile(default_page, function(err, file) {
            if(err){
			  handleInvalidPath(req, res);
			  return;
			};
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.write(file.toString())
            res.end()
     });
};

var the_votes = {
	heredia:{nombre:"heredia",voters: 70000, parties:{pln:0, pac:0, plib:0, rc:0}},
	sanjose:{nombre: "sanjose", voters: 200000, parties:{pln:0, pac:0, plib:0, rc:0}},
	alajuela:{nombre:"alajuela",voters: 80000, parties:{pln:0, pac:0, plib:0, rc:0}},
	cartago:{nombre:"cartago", voters: 50000, parties:{pln:0, pac:0, plib:0, rc:0}},
	puntarenas:{nombre:"puntarenas", voters:100000, parties:{pln:0, pac:0, plib:0, rc:0}},
	limon:{nombre: "limon", voters: 60000, parties:{pln:0, pac:0, plib:0, rc:0}},
	guanacaste: {nombre:"guanacaste", voters:90000, parties:{pln:0, pac:0, plib:0, rc:0}}
	
};

// simulate a query to db with the stand of elections
function obtainVotes(dto, f, h){
	 if(nRequests == 1){
		 f(the_votes);
		 return;
	 }
	 var err = Math.random()*100;
	 
	 if ( err  >= 100 ) h();

     for(var place in the_votes){
		 var prov = the_votes[place];
		 if (prov.voters == 0) continue;
		 for(var p in prov.parties){
			 var prob = Math.random()*0.3;
			 var v = Math.round(prov.voters*prob);
			 if (v > prov.voters) v = prov.voters;
			 console.log("province="+place + " party=" + p + " votes(before)=" + prov.parties[p] + " votes="+v);
			 prov.parties[p] += v;
			 console.log("province="+place  + " party=" + p + " votes(after)=" + prov.parties[p]);
			 prov.voters -= v;
			 if (prov.voters < 0) prove.voters = 0;
		 }
		 console.log("Remaining voters in "+ place + "="+prov.voters);
		 
	 }
	 console.log('Obtain votes returning')
	 if (dto.place){
		 var votes_one_place = {};
		 votes_one_place[dto.place] = the_votes[place];
		 f(votes_one_place);
	 }
	 else f(the_votes);
	 return;
}
var nRequests = 0;
function serveVotes(req, res){
    console.log("requesting votes again:"+(nRequests++)+' times. URL:' + req.url);
    var query = url.parse(req.url, true).query;	
	var place = query.place;
	console.log("votes for place ="+place);
	var dto = {place:place}; //data transfer object
	
	var votes = obtainVotes(dto, 
	                        function(votes){
								console.log('Building reponse');
								res.writeHead(200, {'Content-Type': 'application/json'});
								res.write(JSON.stringify({votes:votes}));
								res.end();
	                          },
	                        function(){
		                                handleInvalidPath(req, res, {status:500, msg:'Votes Server Error'});
		                                return;
                            });	
};



function buildPath(e){

	switch(e.path){
	  case salute_path: serveHello(e.req, e.res); return;
	  case default_path: handle_default_page(e.req, e.res);return;
	  case votes_path: serveVotes(e.req, e.res);return;
	  default: if (files_to_serve_regex.test(e.path))
	              handleFileToServe(e.path, e.req, e.res)  
	           else handleInvalidPath(e.req, e.res);return;
	};

}



function fail(){
	console.log('Se produjo un fallo');
}


function startServer(){
	  initWorkFlow()
	  .then(setPath)
	  .then(buildPath)
	  .fail(fail)
	  .done();
}



http.createServer(function(req, res){
	server.req=req;
	server.res=res;
	startServer();
}).listen(port);
console.log('Votes server up and running');
