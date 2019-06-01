var express = require('express');
var router = express.Router();

var db = require('../queries');
var db_yeepua = require('../queries_yeepua');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// Report Min Stock
router.get('/api/rpt_profit', db.getProfitReport);
router.get('/api/rpt_profitByUser', db.getProfitByUser);
router.get('/api/rpt_profitByItem', db.getProfitByItem);
router.get('/api/rpt_minSupplier', db.getMinSupplier);
router.get('/api/rpt_minStock/:id', db.getMinBySupID);
router.get('/api/rpt_invSupplier', db.getInvSupplier);
router.get('/api/rpt_invStock/:id', db.getInvBySupID);
//datacollector
router.get('/api/datacollector', db.getItems);
router.get('/api/datacollector/:id', db.getItemByBarcode);
router.put('/api/datacollector/:id', db.updateItemQty);

//yeepua
router.get('/api/yeepua', db_yeepua.getBuyItems);
router.get('/api/yeepua/:id/barcode', db_yeepua.getBuyItemByBarcode);
router.post('/api/yeepua', db_yeepua.insertBuyItemsTrans);
//userlogin
router.post('/api/login', db_yeepua.getUser);


module.exports = router;
