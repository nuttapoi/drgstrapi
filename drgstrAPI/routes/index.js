var express = require('express');
var router = express.Router();

var db = require('../queries');

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
router.get('/api/yeepua', db.getBuyItems);
router.get('/api/yeepua/:id/barcode', db.getBuyItemByBarcode);
router.post('/api/yeepua', db.insertBuyItems);


module.exports = router;
