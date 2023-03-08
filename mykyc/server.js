var express=require("express");
var path=require("path");
var bodyparser=require("body-parser");
var zlib = require('zlib');
var LZUTF8 = require('lzutf8');
var brotli = require('brotli');
var CryptoJS = require("crypto-js");
var nodemailer = require('nodemailer');

var app=express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res) {
	res.sendFile(__dirname+"/public/org_login.html");
});
app.get('/reg',function(req,res){
	res.sendFile(__dirname+"/public/kyc_register.html");
});
app.get('/org_login',function(req,res){
	res.sendFile(__dirname+"/public/org_login.html");
});

app.listen(3000,function(){
	console.log("Server Running in the port 3000");
})
app.post('/compress-lzutf8',function(req,res){
	
	console.log(req.body.json);
	var input = req.body.json;
	//var input = CryptoJS.AES.decrypt(ciphertext, "mypassword" ).toString(CryptoJS.enc.Utf8);
	console.log("Decrypted : "+input+"\n\n");

   	console.log("Original size : "+input.length);
   	console.log("\n\n");
   	
   	var deflated = LZUTF8.compress(input);
   	console.log("Deflated : "+deflated.byteLength);
   	console.log("Deflated : "+deflated.toString('utf8'));
   	console.log("Deflated : "+deflated.join(""));

   	var deflatedString = getString(deflated);
  	//var deflatedEncrypt = CryptoJS.AES.encrypt(deflatedString,"mypassword").toString();
   	res.send(deflatedString);
	
});

app.post('/compress-deflate',function(req,res){
	
	console.log(req.body.json);
	console.log("\n");
	var ciphertext = req.body.json;
	var input = CryptoJS.AES.decrypt(ciphertext, "mypassword" ).toString(CryptoJS.enc.Utf8);
	console.log("Decrypted : "+input+"\n\n");
	console.log("\n");
   	console.log("Original size : "+input.length);
   	console.log("\n\n");
   	
	var deflatedString = zlib.deflateSync(input).toString('base64');
	
	console.log("Deflated : "+deflatedString);
	console.log("\n");
	console.log("Deflated size : "+deflatedString.length);
	console.log("\n");
   	//console.log("Deflated string: "+getString(deflated));
   	//console.log("Deflated join: "+deflated.join(""));

   	//var deflatedString = getString(deflated);
   	var deflatedEncrypt = CryptoJS.AES.encrypt(deflatedString,"mypassword").toString();
   	res.send(deflatedEncrypt);

});

app.post('/compress-brotli',function(req,res){
	
	console.log(req.body.json);
	console.log("\n");
	var ciphertext = req.body.json;
	var input = CryptoJS.AES.decrypt(ciphertext, "mypassword" ).toString(CryptoJS.enc.Utf8);
	console.log("Decrypted : "+input+"\n\n");
	console.log("\n");
   	console.log("Original size : "+input.length);
   	console.log("\n");
   	
	var deflated = brotli.compress(input);
	console.log("deflated "+deflated);
	//console.log("inflated : "+brotli.decompress(getString(deflated)));
	console.log("inflated string : "+brotli.decompress(deflated));
	console.log("Deflated bytelength: "+deflated.byteLength);
   	console.log("Deflated string: "+getString(deflated));
   	console.log("Deflated join: "+deflated.join(""));

   	var deflatedString = getString(deflated);
   	var deflatedEncrypt = CryptoJS.AES.encrypt(deflatedString,"mypassword").toString();
   	res.send(deflatedEncrypt);

});
app.post('/view_customer',function(req,res){

	res.setHeader('Content-Type', 'application/json');
    	
	var encryptedJSON = req.body.json;
	var key = req.body.key;
	console.log("Encrypted json : "+encryptedJSON);
	try{
		var input = CryptoJS.AES.decrypt(encryptedJSON, req.body.key ).toString(CryptoJS.enc.Utf8);
		console.log("Decrypted : "+input);
		var jsonString = decompress(input);
		console.log("Json string : "+jsonString);
		res.send(JSON.stringify({error:"",json:jsonString}));
	}
	catch(err) {
		console.log(err);
		res.send(JSON.stringify({ error: "invalid_key" }));
		//res.json({error:"invalid_key"}).send("localhost:3000/invalid_key.html")
	}
	
	console.log(key);
	

});
function getString(ba) {
	var result="";
	for(var i = 0; i < ba.length; ++i){
		result+= (String.fromCharCode(ba[i]));
	}
	console.log(result);
	console.log("\n");
	return result;
	
}
function getBytes(str) {
	var bytes = [];
	var charCode;

	for (var i = 0; i < str.length; ++i)
	{
	    charCode = str.charCodeAt(i);
	    bytes.push(charCode & 0xFF);
	}

	return bytes;
}
function getByteLength(str) {
	return Buffer.byteLength(str,'utf8');
}

app.post('/decompress',function(req,res){

	console.log(req.body.cjson);
	var encrypted = req.body.cjson;
	console.log("encrypted  : "+encrypted);
	console.log("\n");
	var deflatedString = CryptoJS.AES.decrypt(encrypted, "mypassword" ).toString(CryptoJS.enc.Utf8);
	var deflatedBytes = getBytes(deflatedString);
	console.log("deflated : "+deflatedString);
	console.log("\n");
	console.log("deflated : "+deflatedBytes);
	console.log("\n");
	//var inflated = zlib.inflateSync(deflatedBytes.toString('base64')).toString();
	var inflated = LZUTF8.decompress(new Buffer(deflatedBytes,'base64')).toString();
	console.log("inflated : "+inflated.toString());
	console.log("\n");
	var inflatedEncrypt = CryptoJS.AES.encrypt(inflated,"mypassword").toString();
	console.log(inflatedEncrypt);
	console.log("\n");
	res.send(inflatedEncrypt);
	
});
function decompress(deflatedString) {
	var deflatedBytes = getBytes(deflatedString);
	console.log("deflated : "+deflatedString);
	console.log("\n");
	console.log("deflated : "+deflatedBytes);
	console.log("\n");
	//var inflated = zlib.inflateSync(deflatedBytes.toString('base64')).toString();
	var inflated = LZUTF8.decompress(new Buffer(deflatedBytes,'base64')).toString();
	return inflated;
}



app.post("/sendmail",function(req,res){


	console.log("The user key" + req.body.key)
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		type: 'OAuth2',
		  user: 'afzaldev2@gmail.com',
		  pass: '',
		  clientId:'',
		  clientSecret:'',
		  refreshToken:'1//042pvDPn_LAyLCgYIARAAGAQSNwF-L9IrsKpDN8-wdjsZspKe6sjAne1s-lk8HY19-YhaEMiLKeCoot4rN2xb6xNAzvF_trK71Bg'
		}
	  });
	  
	  var mailOptions = {
		from: 'afzaldev2@gmail.com',
		to: req.body.email,
		subject: 'KYC Password',
		html: 'Dear user please find below the secret key for KYC verification: \n\n '+req.body.key+'<br><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+req.body.key+'"><br> Do not share this confidential information to anyone !<br>'
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });
	  
});
app.post("/alertmail",function(req,res){

	console.log("Trying to alert");
	var transporter = nodemailer.createTransport({
		service :'gmail',
		auth: {
			type: 'OAuth2',
			  user: 'afzaldev2@gmail.com',
			  pass: '',
			  clientId:'',
			  clientSecret:'',
			  refreshToken:'1//042pvDPn_LAyLCgYIARAAGAQSNwF-L9IrsKpDN8-wdjsZspKe6sjAne1s-lk8HY19-YhaEMiLKeCoot4rN2xb6xNAzvF_trK71Bg'
			}
	  });
	  
	  var mailOptions = {
		from: 'afzaldev2@gmail.com',
		to: req.body.email,
		subject: 'KYC Access alert',
		text: "Dear customer , \n\t Your KYC Data was accessed recently by "+req.body.oname+" at "+req.body.time+"\n If this activity is unusual please contact your nearest KYC organization for key change"
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });

});
	
