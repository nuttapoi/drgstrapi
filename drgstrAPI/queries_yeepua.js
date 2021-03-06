var sql = require("mssql");
var async = require('async');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
// var Request = require('tedious').Request;  
// var TYPES = require('tedious').TYPES;  
// var Connection = require('tedious').Connection;  
var env = process.env.NODE_ENV || 'development';

var config = require('./config')[env];

//Initiallising connection string
var dbConfig = {
    user:  config.database.user,
    password: config.database.password,
    server: config.database.host,
    database: config.database.db
};

// image save/serve
var fs  = require('fs')

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function extend(){
    if(arguments.length === 0){ return; }
    var x = arguments.length === 1 ? this : arguments[0];
    var y;

    for(var i = 1, len = arguments.length; i < len; i++) {
        y = arguments[i];
        for(var key in y){
            if(!(y[key] instanceof Function)){
                x[key] = y[key];
            }
        }           
    };

    return x;
}
//var bitmap = base64_encode("c:/programData/DrugStoreRx/images/product/image.jpg");

function getItemImage(req , res) {
	fs.readFile('c:/programData/DrugStoreRx/images/product/'+ req.params.id +'.jpg', function(err, contents) {
		if (err){
			var blankImg = "/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwAGBAUGBQQGBgUGBwcGCAoQCgoJCQoUDg8MEBcUGBgXFBYWGh0lHxobIxwWFiAsICMmJykqKRkfLTAtKDAlKCko/9sAQwEHBwcKCAoTCgoTKBoWGigoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgo/8AAEQgAIAAgAwEiAAIRAQMRAf/EABkAAAMAAwAAAAAAAAAAAAAAAAIEBQADCP/EACcQAAIBBAEDAgcAAAAAAAAAAAECAwAEBREhEkFRIjETJEJhcZHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOqaSvcjFaSrGUklkYb6YxsgVpz5b4FuisyiSZUbpOjrmgW1FhP8sD6l3LPMdhFHYff+UDdpfw3MUkgDRiM6cSDRWgx9695LKyRatRwjn3Y9+PFT3dsw8wjYx2UXLa4Mjap/AsWxNuWOzoj9EigLK25nSA9aokUokZm7AA1Jv57jJsBBBM1kD9HpLn8mquQs3vJYleXptRy6D3Y9ufFOoiogVAFUDQA7UEO1kntbZoYMXKAd7JcEk+faqOHhe3xsMUo04B2PGyTTlZQf/9k="
			res.send(JSON.stringify({productID: req.params.id, imageBase64: blankImg}));
		}else {
			//console.log("image64");
			var buffer =new Buffer(contents).toString('base64');	
			//console.log(buffer);
			res.send(JSON.stringify({productID: req.params.id, imageBase64: buffer}));		
		}
	}); 
}

function saveItemImage(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			return res.status(500).send(JSON.stringify({error: err}));
		}
		// create Request object
		var request = new sql.Request();

		request.input('productID', sql.VarChar,req.params.id);
		request.execute('m_product_AddImage', function (err, recordsets, returnValue) {
			if (err) {
				console.log("Error while querying database :- " + err);
				return	res.status(500).send(JSON.stringify({error: err}));
			}
			let fileName ='c:/programData/DrugStoreRx/images/product/'+ req.params.id +'.jpg'; 
			let putImage = req.body.imageBase64;
			let data = putImage.replace(/^data:image\/\w+;base64,/, '');
			fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
				if (err){
					res.status(500).send(JSON.stringify({error: err}));
				}else {
					res.send(JSON.stringify({productID: req.params.id, imageBase64: data }));
					// console.log("save image sucess");
				}
			}); 
		});
	});  
}
// function saveItemImage(req , res) {
// 	let fileName ='c:/programData/DrugStoreRx/images/product/'+ req.params.id +'.jpg'; 
// 	let putImage = req.body.imageBase64;
// 	let data = putImage.replace(/^data:image\/\w+;base64,/, '');

// 	fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
// 		if (err){
// 			res.status(500).send(JSON.stringify({error: err}));
// 		}else {
// 			res.send(JSON.stringify({productID: req.params.id, imageBase64: data }));
// 			// console.log("save image sucess");
// 		}
// 	}); 
// }



var executeQuery = function(res, query){             
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.status(500).send(JSON.stringify({error: err}));
		}
		else {
		    // create Request object
		    var request = new sql.Request();
		    // query to the database
		    request.query(query, function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.status(500).send(JSON.stringify({error: err}));
		        } else {
					console.log(recordsets);
		            res.send(recordsets);
		        }
		    });
		}
	});           
}

function verifyToken(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
	// decode token
	if (token) {
  
	  // verifies secret and checks exp
	  jwt.verify(token, 'SuperSecret', function(err, decoded) {      
		if (err) {
		  return res.json({ success: false, message: 'Failed to authenticate token.' });    
		} else {
		  // if everything is good, save to request for use in other routes
		  req.decoded = decoded;    
		  next();
		}
	  });
  
	} else {
  
	  // if there is no token
	  // return an error
	  return res.status(403).send({ 
		  success: false, 
		  message: 'No token provided.' 
	  });
  
	}
}

//yeepua
function getUser(req , res) {
	//console.log("get login");
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.status(500).send(JSON.stringify({error: err}));
		}else {
		    // create Request object
		    var request = new sql.Request();
			console.log("user loging");
			request.input('loginName', sql.VarChar,req.body.userName);
			request.input('pass', sql.VarChar,req.body.password);
		    request.execute('m_customer_ValidateLogin', function (err, recordsets, returnValue) {
		        if (err) {
		            // console.log("Error while querying database :- " + err);
		    	    res.status(500).send(JSON.stringify({error: err}));
		        } else {
					// console.log(JSON.stringify(recordsets));
					if (recordsets === undefined || recordsets[0].length == 0) {
						// console.log(JSON.stringify({status:'denied', user: recordsets[0][0]}));
						res.status(401).send({status:'Access denied'});
					}else{
						// console.log(JSON.stringify({status:'success', user: recordsets[0][0]}));
						// res.send({status:'Success', user: recordsets[0][0]});
						// jwt.sign({userID: recordsets[0][0].userID, userName: recordsets[0][0].userName}, 'RESTFULAPIs')
						var token = jwt.sign({cusID: recordsets[0][0].cusID, cusName: recordsets[0][0].cusName}, 'SuperSecret', {
							expiresIn: 60 // expires in 1 hours
						  });
						return res.json({auth:true,token:token,user:recordsets[0][0]});
					
			        //res.send(JSON.stringify(recordsets).slice(1, -1));
					}
			    }
		    });
		}
	});  
}


function getBuyItems(req, res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.status(500).send(JSON.stringify({error: err}));
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('businessName', sql.VarChar,req.query.name);
		    request.execute('m_yeepua_itemBuy', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.status(500).send(JSON.stringify({error: err}));
		        } else {
		        	//console.log(res);
			        res.send(JSON.stringify(recordsets).slice(1, -1));
			    }
		    });
		}
	});  
}

function getPromotion(req, res) {
	var query = "select tb_campaignDetail.*,tb_campaign.startDate,tb_campaign.endDate,\
	tb_campaign.campaignName, tb_product.businessName\
	from tb_campaignDetail\
	inner join tb_campaign on tb_campaign.promoID = tb_campaignDetail.promoID\
	inner join tb_product on tb_product.productID = tb_campaignDetail.productID\
	where (tb_campaign.isActive = 1) and (tb_product.statusActive = 0) and (tb_product.pharmacafe = 1)";

	executeQuery(res, query);
}

function insertBuyItemsTrans(req , res) {
	var transaction;
	var connection;
	var request;
	var ps;
	//var quoData = req.body;
	console.log(req.headers['bill-header']);
	var quoHeader = JSON.parse(req.headers['bill-header']);
  	//var quoHeader = quoData[0];
	var quoDetail = req.body;
	console.log(quoDetail);
	var quoID;
	var trans_1 = false;
	var trans_2 = false;

	async.waterfall([
		function(callback) {
			connection = new sql.Connection(dbConfig, 
				function(err) {
					console.log("connect");
					callback(err);
				}
			);
		},
		function(callback) {
			transaction = new sql.Transaction(connection);
			transaction.begin(function(err) {
					console.log("transaction");
					callback(err);
				}
			);
		},
		function(callback) {
			request = new sql.Request(transaction); 
			// request.output('newID', sql.Char(10));
		    request.execute('m_getQuoID_SEL', function(err, recordset,returnValue) {
				//console.log("debug" + returnValue);
				//console.log(recordset[0][0].newQuoID);
				quoID = returnValue;
				callback(err);
			});
		},
		function(callback) {
			// update quoID in req.body
			for(var i = 0; i < quoDetail.length; i++) {
				var obj = quoDetail[i];
				obj.billID = quoID;
			}
			request = new sql.Request(transaction);  
	
			request.input('billID', sql.Char (10), quoID);
			request.input('cusID', sql.Char (8),quoHeader.cusID);
			console.log(quoHeader.cusID);
			request.input('saleDate', sql.VarChar, quoHeader.saleDate);
			request.input('deliDate', sql.VarChar, quoHeader.deliDate);
			request.input('expDate', sql.VarChar, quoHeader.expDate);
			request.input('standPrice', sql.VarChar, quoHeader.standPrice);
			request.input('creditDay', sql.VarChar(20), quoHeader.creditDay);
			request.input('totalPrice', sql.Real, quoHeader.totalPrice);
			request.input('discount100', sql.Real, quoHeader.discount100);
			request.input('discountTHB', sql.Real, quoHeader.discountTHB);
			request.input('netSale', sql.Real, quoHeader.netSale);
			request.input('payBy', sql.Real,quoHeader.payBy);
			request.input('userID', sql.Char (5),quoHeader.userID);
			request.input('ipAddress', sql.VarChar (15),quoHeader.ipAddress);
			request.input('saleNote', sql.NVarChar (200),quoHeader.saleNote);

		    request.execute('tb_quotation_INS', function(err, recordset) {
				if (err) {
					console.log("m_quotation_INS err");
					trans_2 = true;
				};
				callback(err);
			});
		},
		function(callback){
			ps = new sql.PreparedStatement(connection);
			var strSQL = "INSERT INTO  tb_quoDetail \
				(billID,	ItemNO,	productID,	itemQTY, saleUnitName, salePrice) \
				Values ( @billID,	@ItemNO, 	@productID,	@itemQTY,	@saleUnitName,	@salePrice)";

			ps.input('billID', sql.Char(10));
			ps.input('ItemNO', sql.SmallInt);
			ps.input('productID', sql.Char(6));
			ps.input('itemQTY', sql.Float);
			ps.input('salePrice', sql.Float);
			ps.input('saleUnitName', sql.NChar(20));

			ps.prepare(strSQL, function(err) {
				console.log("prepare");
				callback(err);
			});
		},
		function(callback){
				console.log("start asyn.mapseries");
				async.mapSeries(quoDetail, function(quoDetail, next) {
				ps.execute({billID: quoDetail.billID, ItemNO: quoDetail.ItemNO, productID: quoDetail.productID,
						itemQTY: quoDetail.itemQTY,salePrice: quoDetail.salePrice,saleUnitName: quoDetail.saleUnitName}, next);
				}, function(err) {
					if (err) {
						trans_1 = true;
					};
					callback(err);
				});
		},
		function(callback){
			console.log("unprepared");
			// ... error checks
			ps.unprepare(function(err) {
				callback(err)
			});
		},
		function(callback) {
			transaction.commit(function(err) {
            // ... error checks
				callback(err);
            	console.log("Transaction committed.");
        	});;
		}		
	], function(err) {
		// ... error checks should go here :
		// output query result to console:
		if (err) {
			if (trans_1 || trans_2){
				console.log("rollback transaction");
				transaction.rollback(function(err){
					if (err) {
						console.log("rollback error");
					}else{
						console.log("rollback success");
					}	
				});
			};

			console.log("err");
			res.status(500).send(JSON.stringify({error: err}));
		}else{
			// console.log("final result");
			res.send(JSON.stringify("Success"));
			// res.send("201 Created");
		}
		
	});
}

function getBuyItemByBarcode(req , res){
	async.waterfall([
		function firstStep(callback) {
			sql.connect(dbConfig, function (err) {
				if (!err) {   
					// create Request object
					var request = new sql.Request();
					request.input('barcode', sql.VarChar,req.params.id);
					request.execute('m_yeepua_barcode', function (err, recordsets, returnValue) {
						if (!err) {
							callback(null, JSON.stringify(recordsets).slice(1, -1)); // <- set value to passed to step 2
							//callback(null, recordsets); // <- set value to passed to step 2
						}
					});
				}
			});  

		},
		function secondStep(step1Result, callback) {
			fs.readFile('c:/programData/DrugStoreRx/images/product/'+ req.params.id +'.jpg', function(err, contents) {
				if (err){
					var blankImg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwAGBAUGBQQGBgUGBwcGCAoQCgoJCQoUDg8MEBcUGBgXFBYWGh0lHxobIxwWFiAsICMmJykqKRkfLTAtKDAlKCko/9sAQwEHBwcKCAoTCgoTKBoWGigoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgo/8AAEQgAIAAgAwEiAAIRAQMRAf/EABkAAAMAAwAAAAAAAAAAAAAAAAIEBQADCP/EACcQAAIBBAEDAgcAAAAAAAAAAAECAwAEBREhEkFRIjETJEJhcZHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOqaSvcjFaSrGUklkYb6YxsgVpz5b4FuisyiSZUbpOjrmgW1FhP8sD6l3LPMdhFHYff+UDdpfw3MUkgDRiM6cSDRWgx9695LKyRatRwjn3Y9+PFT3dsw8wjYx2UXLa4Mjap/AsWxNuWOzoj9EigLK25nSA9aokUokZm7AA1Jv57jJsBBBM1kD9HpLn8mquQs3vJYleXptRy6D3Y9ufFOoiogVAFUDQA7UEO1kntbZoYMXKAd7JcEk+faqOHhe3xsMUo04B2PGyTTlZQf/9k="
					var final = JSON.parse(step1Result);
					if (!final) {
						final[0].imageBase64=blankImg; 
						// console.log(final);
					}
					res.send(JSON.stringify(final));
				}else {
					//console.log("image64");
					var buffer =new Buffer(contents).toString('base64');
					var final = JSON.parse(step1Result);
					final[0].imageBase64="data:image/jpeg;base64," + buffer; 
					// console.log(final);					
					res.send(JSON.stringify(final));		
				}
			}); 
			callback(null); 
		  },
		],
		
		function (err) {
		  if (err) {
			res.status(500).send(JSON.stringify({error: err}));
		  }
		});
}	

// fun

module.exports = {
  verifyToken:verifyToken,
  getUser:getUser,
  getItemImage: getItemImage,
  saveItemImage: saveItemImage,
  getBuyItems: getBuyItems,
  getBuyItemByBarcode: getBuyItemByBarcode,
  insertBuyItemsTrans: insertBuyItemsTrans,
  getPromotion: getPromotion,
};

// function InsertQuotation(req , res) {
// 	sql.connect(dbConfig, function (err) {
// 		if (err) {   
// 			console.log("Error while connecting database :- " + err);
// 			res.status(500).send({error: err});
// 		}
// 		else {
// 		    // create Request object
// 		    var request = new sql.Request();
//             var quoID ='2017070001';
//             var totalPrice = 0;
// 			console.log("insert tb_quotation");
// 			// update quoID in req.body
// 			for(var i = 0; i < req.body.length; i++) {
// 				var obj = req.body[i];
// 				obj.billID = quoID;
// 				totalPrice += obj.itemValue;
// 			}
// 			// request = new sql.Request(transaction);  
// 			var d = new Date();
// 			var n = d.toISOString();
// 			request.input('billID', sql.Char (10), '2017070001');
// 			request.input('cusID', sql.Char (5),'00003');
// 			request.input('saleDate', sql.VarChar, n);
// 			request.input('totalPrice', sql.Real, totalPrice);
// 			request.input('userID', sql.Char (5),'00003');
// 			request.input('saleNote', sql.NVarChar (200),'');
// 			request.input('ipAddress', sql.VarChar (10),'');
// 		    request.execute('m_quotation_INS', function(err, recordset) {
// 		        if (err) {
// 		            console.log("Error while querying database :- " + err);
// 		    	    res.status(500).send({error: err});
// 		        } else {
// 		        	console.log(res);
// 					res.send( recordset)
// 			        }
// 		    });
// 		}
// 	});  
// }
// function insertBuyItems(req , res) {
// 	var connection = new sql.Connection(dbConfig, function(err) {
// 	// sql.connect(config, function(err) {
// 		var ps = new sql.PreparedStatement(connection);
// 		var sampleData = req.body;
// 		// var sampleData = [{'billID':'2017070001', 'ItemNO':'1','productID':'000001','itemQTY':'1','salePrice':'10','saleUnitName':'blister'},
// 		// {'billID':'2017070001', 'ItemNO':'2','productID':'000002','itemQTY':'2','salePrice':'20','saleUnitName':'blister'},
// 		// {'billID':'2017070001', 'ItemNO':'3','productID':'000003','itemQTY':'3','salePrice':'30','saleUnitName':'blister'},
// 		// {'billID':'2017070001', 'ItemNO':'4','productID':'000004','itemQTY':'4','salePrice':'40','saleUnitName':'blister'}];
// 		var strSQL = "INSERT INTO  tb_quoDetail \
// 			(billID,	ItemNO,	productID,	itemQTY, saleUnitName, salePrice) \
// 			Values ( @billID,	@ItemNO, 	@productID,	@itemQTY,	@saleUnitName,	@salePrice)";

// 		ps.input('billID', sql.Char(10));
// 		ps.input('ItemNO', sql.SmallInt);
// 		ps.input('productID', sql.Char(6));
// 		ps.input('itemQTY', sql.Float);
// 		ps.input('salePrice', sql.Float);
// 		ps.input('saleUnitName', sql.NChar(20));

// 		ps.prepare(strSQL, function(err) {
// 			async.mapSeries(sampleData, function(sampleData, next) {
// 				ps.execute({billID: 'ภาษาไทย', ItemNO: sampleData.ItemNO, productID: sampleData.productID,
// 					itemQTY: sampleData.itemQTY,salePrice: sampleData.salePrice,saleUnitName: sampleData.saleUnitName}, next);
// 			}, function(err) {
// 				// ... error checks
// 				if (err) {
// 	                res.status(500).send({error: err});
// 				}

// 				ps.unprepare(function(err) {
// 					if (err){
// 						res.status(500).send({error: err});
// 					}else{
// 						res.status(201).send("201 Created");
// 					}
// 				});
// 			});
// 		});
// 	});
// }