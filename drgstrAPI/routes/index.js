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
router.get('/api/datacollector/:id/id', db.getCountByID);

router.get('/api/inventory_check', db.getAllCounted);
router.post('/api/inventory_check', db.insertCounted);
router.delete('/api/inventory_check/:id/id', db.deleteCounted);

router.get('/api/rpt_getLotDetail/:id', db.getLotsByID);
router.get('/api/rpt_getLotDetail/:id/barcode', db.getLotsByBarcode);
router.put('/api/rpt_getLotDetail', db.updateLots);

//delivery checker
router.get('/api/delivery_check/:id/return', db.getReturnItem);
router.get('/api/delivery_check/:id/barcode', db.getReturnItemX);


//image upload
router.get('/api/product/:id/image', db_yeepua.getItemImage);
router.put('/api/product/:id/image', db_yeepua.saveItemImage);

//edit barcode upload
router.get('/api/product/:id/barcode', db.getBarcodeByID);
router.put('/api/product/:id/barcode', db.updateBarcodeByID);
//linebot
router.get('/api/bot_pushOrder/:id', db.getOrderBySupID);
router.get('/api/bot_pushDaily', db.getDailyReport);

//yeepua
//userlogin
router.post('/api/login', db_yeepua.getUser);
router.get('/api/yeepua/promotion', db_yeepua.getPromotion);
router.post('/api/logout', function(req, res) {
res.status(200).send({ auth: false, token: null });
});
router.get('/api/yeepua/:id/barcode', db_yeepua.getBuyItemByBarcode);
router.get('/api/yeepua', db_yeepua.getBuyItems);
// route middleware to verify a token
// router.use(db_yeepua.verifyToken);
router.post('/api/yeepua', db_yeepua.insertBuyItemsTrans);



module.exports = router;
