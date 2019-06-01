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
};
