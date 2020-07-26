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
<<<<<<< HEAD

//yeepua
router.get('/api/yeepua', db_yeepua.getBuyItems);
router.get('/api/yeepua/:id/barcode', db_yeepua.getBuyItemByBarcode);
router.post('/api/yeepua', db_yeepua.insertBuyItemsTrans);
//userlogin
router.post('/api/login', db_yeepua.getUser);
=======
router.get('/api/rpt_getLotDetail/:id', db.getLotsByID);
router.get('/api/rpt_getLotDetail/:id/barcode', db.getLotsByBarcode);
router.put('/api/rpt_getLotDetail', db.updateLots);

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
router.get('/api/yeepua/:id/image', db_yeepua.getItemImage);
router.get('/api/yeepua/:id/barcode', db_yeepua.getBuyItemByBarcode);
router.get('/api/yeepua', db_yeepua.getBuyItems);
// route middleware to verify a token
// router.use(db_yeepua.verifyToken);
router.post('/api/yeepua', db_yeepua.insertBuyItemsTrans);

>>>>>>> 3nd release


module.exports = router;
