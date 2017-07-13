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

// var config = {  
//         userName: 'sa',  
//         password: '123456',  
//         server: '127.0.0.1',  
//         // If you are on Azure SQL Database, you need these next options.  
//         // options: {encrypt: true, database: 'DRGSTR'}  
// 		options: {instanceName: 'SQLEXPRESS',database: 'DRGSTRPRO'}  
//     };  


var executeQuery = function(res, query){             
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();
		    // query to the database
		    request.query(query, function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
		            res.send(recordsets);
		        }
		    });
		}
	});           
}


getProfitReport = function(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();
			var fromDate = req.query.fromDate;
 			var toDate = req.query.toDate;
			request.input('fromDate', sql.VarChar,fromDate);
			request.input('toDate', sql.VarChar, toDate);
    		// request.output('output_parameter', sql.VarChar(50));d
		    request.execute('m_sale_ByDate', function (err, recordsets,returnValue) {
				var data = [];
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		            res.send(JSON.stringify(recordsets).slice(1, -1));
		        }
		    });
		}
	});  
}

getProfitByUser = function(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();
			var fromDate = req.query.fromDate;
 			var toDate = req.query.toDate;
			request.input('fromDate', sql.VarChar,fromDate);
			request.input('toDate', sql.VarChar, toDate);
    		// request.output('output_parameter', sql.VarChar(50));d
		    request.execute('m_sale_ByUser', function (err, recordsets,returnValue) {
				var data = [];
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		            res.send(JSON.stringify(recordsets).slice(1, -1));
		        }
		    });
		}
	});  
}

getProfitByItem = function(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();
			var fromDate = req.query.fromDate;
 			var toDate = req.query.toDate;
			request.input('fromDate', sql.VarChar,fromDate);
			request.input('toDate', sql.VarChar, toDate);
			request.input('topN', sql.Int, 0);
			request.input('orderBy', sql.Int, 1);
		    request.execute('v_reportSale_SEL_ByProduct', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
		            res.send(JSON.stringify(recordsets).slice(1, -1));
		        }
		    });
		}
	});  
}

function getMinSupplier(req , res){
	console.log("get expire supplier");
    var query = "select COALESCE(supID,'na') as id, COALESCE(supName,'na') \
	as name from v_LIFO group by supID, supName \
	having(sum(qtyNowAll*avgCost) >0) \
	order by (sum(qtyNowAll*avgCost)) desc" ;
    executeQuery(res, query);
}

// function getMinBySupID(req, res) {
// 	console.log("get expire supplier");
// 	var where = (req.params.id=="na") ? "where supID is NULL" : "where supID ="+req.params.id
// 	var query = "select productID,businessName,unitNameA,qtyNowAll,latestCost from v_LIFOwithOrderQTY " +where;
//     executeQuery(res, query);
// }

function getInvSupplier(req , res){
	console.log("get expire supplier");
    var query = "select COALESCE(supID,'na') as id, COALESCE(supName,'na') \
	as name from v_LIFO group by supID, supName \
	having(sum(qtyNowAll*avgCost) >0) \
	order by (sum(qtyNowAll*avgCost)) desc";

    executeQuery(res, query);
}

function getInvBySupID(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('supID', sql.VarChar,req.params.id);
		    request.execute('m_inventory_BySupID', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
		            res.send(JSON.stringify(recordsets).slice(1, -1));
					// req.body =JSON.stringify(recordsets).slice(1, -1);
			        }
		    });
		}
	});  
}

function getMinBySupID(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('supID', sql.VarChar,req.params.id);
		    request.execute('m_inventory_MinBySupID', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
			        res.send(JSON.stringify(recordsets).slice(1, -1));
					// req.body =JSON.stringify(recordsets).slice(1, -1);
			        }
		    });
		}
	});  
}

// เครื่องนับสต๊อก

function getItems(req, res) {
	var where = "where businessName like '" + req.query.name + "%' and (statusActive ='false')";
	var query = "select productID,businessName,latestCost,qtyNowAll,unitNameA,saleA,qtyNowAll as 'qtyActual' from v_LIFO " + where;
    executeQuery(res, query);
}

function getItemByBarcode(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('barcode', sql.VarChar,req.params.id);
		    request.execute('m_inventory_barcode', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
			        res.send(JSON.stringify(recordsets).slice(1, -1));
			        }
		    });
		}
	});  
}

function updateItemQty(req , res) {
	sql.connect(dbConfig, function (err) {
		if (err) {   
			console.log("Error while connecting database :- " + err);
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('productID', sql.VarChar,req.params.id);
			request.input('qtyActual', sql.VarChar, req.body.qtyActual);
			request.input('qtyNowAll', sql.VarChar, req.body.qtyNowAll);
		    request.execute('m_inventory_Adjust', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
					res.send( recordsets)
		            //res.send(JSON.stringify(recordsets).slice(1, -1));					
					// req.body =JSON.stringify(recordsets).slice(1, -1);
			        }
		    });
		}
	});  
}

//yeepua

function getBuyItems(req, res) {
	var query = "select 'ภาษาไทย' as billID, 0 as ItemNO, tb_posUnit.productID,tb_product.businessName, \
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
			res.send(err);
		}
		else {
		    // create Request object
		    var request = new sql.Request();

			request.input('barcode', sql.VarChar,req.params.id);
		    request.execute('m_inventory_barcode', function (err, recordsets, returnValue) {
		        if (err) {
		            console.log("Error while querying database :- " + err);
		    	    res.send(err);
		        } else {
		        	console.log(res);
			        res.send(JSON.stringify(recordsets).slice(1, -1));
			    }
		    });
		}
	});  
}

function insertBuyItems(req , res) {
	var connection = new sql.Connection(dbConfig, function(err) {
	// sql.connect(config, function(err) {
		var ps = new sql.PreparedStatement(connection);
		var sampleData = req.body;
		// var sampleData = [{'billID':'2017070001', 'ItemNO':'1','productID':'000001','itemQTY':'1','salePrice':'10','saleUnitName':'blister'},
		// {'billID':'2017070001', 'ItemNO':'2','productID':'000002','itemQTY':'2','salePrice':'20','saleUnitName':'blister'},
		// {'billID':'2017070001', 'ItemNO':'3','productID':'000003','itemQTY':'3','salePrice':'30','saleUnitName':'blister'},
		// {'billID':'2017070001', 'ItemNO':'4','productID':'000004','itemQTY':'4','salePrice':'40','saleUnitName':'blister'}];
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
			async.mapSeries(sampleData, function(sampleData, next) {
				ps.execute({billID: 'ภาษาไทย', ItemNO: sampleData.ItemNO, productID: sampleData.productID,
					itemQTY: sampleData.itemQTY,salePrice: sampleData.salePrice,saleUnitName: sampleData.saleUnitName}, next);
			}, function(err) {
				// ... error checks
				if (err) {
					res.send(err);
				}
				ps.unprepare(function(err) {
					// ... error checks
					// res.end()
					// done !
				});
			});
		});
	});
}

// function insertBuyItems(req , res) {
// 	sql.connect(dbConfig, function (err) {
// 		if (err) {   
// 			console.log("Error while connecting database :- " + err);
// 			res.send(err);
// 		}
// 		else {
// 		    // create Request object
// 		    var request = new sql.Request();
// 			request.input('billID', sql.Char(10),'ภาษาไทย');
// 			request.input('ItemNO', sql.SmallInt,1);
// 			request.input('productID', sql.Char(6),'000001');
// 			request.input('itemQTY', sql.Float,10);
// 			request.input('salePrice', sql.Float,10);
// 			request.input('saleUnitName', sql.Char(20),'ภาษาไทย');
// 		    request.execute('m_quoDetail_INS', function (err, recordsets, returnValue) {
// 		        if (err) {
// 		            console.log("Error while querying database :- " + err);
// 		    	    res.send(err);
// 		        } else {
// 		        	console.log(res);
// 					res.send( recordsets)
// 			        }
// 		    });
// 		}
// 	});  
// }

// function insertBuyItems(req, res) {
// 	var query = "insert into tb_quoDetail (billID,ItemNO,productID,itemQTY,salePrice,saleUnitName) \
// 	values('ภาษาไทย',1,'000004',5,10,'ภาษาไทย')";

//     executeQuery(res, query);
// }
// function insertBuyItems(req , res) {
// 	var connection = new Connection(config);      
//     connection.on('connect', function(err) {  
//         // If no error, then good to proceed.  
//         console.log("Connected");  
// 		// var request = new Request('select productID  from tb_product', function(err) {  
//         request = new Request('m_quoDetail_INS', function(err) {  
// 		// request = new Request('insert in to tb_quoDetail (billID,ItemNO,productID,itemQTY,salePrice,saleUnitName) values(@billID,@ItemNO,@productID,@itemQTY,@salePrice,@saleUnitName)', function(err) { 
//          if (err) {  
//             console.log(err);}  
//         });  
//         request.addParameter('billID', TYPES.VarChar,'20170707');  
//         request.addParameter('ItemNO', TYPES.SmallInt , 1);  
//         request.addParameter('productID', TYPES.VarChar, '0001001'); 
// 		request.addParameter('itemQTY', TYPES.Real,2);  
// 		request.addParameter('salePrice',TYPES.Real, 10 );  
// 		request.addParameter('saleUnitName', TYPES.NVarChar, 'ไม่ใช้ภาษาอังกฤษ');   
// 		// request.on('row', function(columns) {  
// 		// 		columns.forEach(function(column) {  
// 		// 		if (column.value === null) {  
// 		// 			console.log('NULL');  
// 		// 		} else {  
// 		// 			console.log("Product id of inserted item is " + column.value);  
// 		// 		}  
// 		// 		});  
// 		// 	});       
//         connection.callProcedure(request);  
// 		// connection.execSql(request); 
//     });  

// }

module.exports = {
  getProfitReport: getProfitReport,
  getProfitByUser: getProfitByUser,
  getProfitByItem: getProfitByItem,
  getMinSupplier: getMinSupplier,
  getMinBySupID: getMinBySupID,
  getInvSupplier: getInvSupplier,
  getInvBySupID: getInvBySupID,
  getItems: getItems,
  getItemByBarcode: getItemByBarcode,
  updateItemQty: updateItemQty,

  getBuyItems : getBuyItems,
  getBuyItemByBarcode: getBuyItemByBarcode,
  insertBuyItems: insertBuyItems
};
