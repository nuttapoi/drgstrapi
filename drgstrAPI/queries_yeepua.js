var sql = require("mssql");
var async = require('async');
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
					console.log(res);
		            res.send(recordsets);
		        }
		    });
		}
	});           
}
//yeepua
function getUser(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.status(500).send(JSON.stringify({error: err}));
		}else {
		    // create Request object
		    var request = new sql.Request();

			request.input('loginName', sql.VarChar,req.body.userName);
			request.input('pass', sql.VarChar,req.body.password);
		    request.execute('tb_user_ValidateLogin', function (err, recordsets, returnValue) {
		        if (err) {
		            // console.log("Error while querying database :- " + err);
		    	    res.status(500).send(JSON.stringify({error: err}));
		        } else {
					// console.log(JSON.stringify(recordsets));
					if (recordsets === undefined || recordsets[0].length == 0) {
						// console.log(JSON.stringify({status:'denied', user: recordsets[0][0]}));
						res.status(401).send({status:'Access denied'});
					}else{
						// console.log(JSON.stringify({status:'success', user: recordsets[0][0].userID}));
						res.send({status:'Success', user: recordsets[0][0]});
					
			        //res.send(JSON.stringify(recordsets).slice(1, -1));
					}
			    }
		    });
		}
	});  
}

function getBuyItems(req, res) {
	var query = "select '1971030012' as billID, 0 as ItemNO, tb_posUnit.productID,tb_product.businessName, \
	tb_posUnit.saleE as salePrice,tb_posUnit.unitNameS as saleUnitName, \
	1 as itemQTY, tb_posUnit.saleE as itemValue \
	from tb_posUnit inner join tb_product on tb_product.productID = tb_posUnit.productID \
	where tb_product.businessName like '" + req.query.name + "%' and (statusActive = 0) and (pharmacafe = 1) ";

    executeQuery(res, query);
}

function getBuyItemByBarcode(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.status(500).send(JSON.stringify({error: err}));
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('barcode', sql.VarChar,req.params.id);
		    request.execute('m_inventory_barcode', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.status(500).send(JSON.stringify({error: err}));
		        } else {
		        	console.log(res);
			        res.send(JSON.stringify(recordsets).slice(1, -1));
			    }
		    });
		}
	});  
}

function insertBuyItemsTrans(req , res) {
	var transaction;
	var connection;
	var request;
	var ps;
	var quoData = req.body;
	console.log(quoData);
	var quoHeader = quoData[0];
	var quoDetail = quoData[1];
	var quoID;
	var totalPrice=0;
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
			console.log("select query");
			// request.output('newID', sql.Char(10));
		    request.execute('m_getQuoID_SEL', function(err, recordset) {
				console.log(recordset);
				console.log(recordset[0][0].newQuoID);
				quoID = recordset[0][0].newQuoID;
				callback(err);
			});
		},
		function(callback) {
			console.log("insert tb_quotation");
			// update quoID in req.body
			for(var i = 0; i < quoDetail.length; i++) {
				var obj = quoDetail[i];
				obj.billID = quoID;
			}
			request = new sql.Request(transaction);  
	
			request.input('billID', sql.Char (10), quoID);
			request.input('cusID', sql.Char (5),quoHeader.cusID);
			request.input('saleDate', sql.VarChar, quoHeader.saleDate);
			request.input('totalPrice', sql.Real, quoHeader.totalPrice);
			request.input('userID', sql.Char (5),quoHeader.userID);
			request.input('saleNote', sql.NVarChar (200),quoHeader.saleNote);
			request.input('ipAddress', sql.VarChar (10),quoHeader.ipAddress);
		    request.execute('m_quotation_INS', function(err, recordset) {
				if (err) {
					console.log("m_quotation_INS err");
					trans_2 = true;
				};
				callback(err);
			});
		},
		function(callback){
			ps = new sql.PreparedStatement(connection);
			console.log("billID in: " + quoID);

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
			console.log("final result");
			res.send(JSON.stringify("Success"));
			// res.send("201 Created");
		}
		
	});
}	

// fun

module.exports = {
  getUser:getUser,
  getBuyItems: getBuyItems,
  getBuyItemByBarcode: getBuyItemByBarcode,
  insertBuyItemsTrans: insertBuyItemsTrans,
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