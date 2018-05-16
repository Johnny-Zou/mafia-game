var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.send("arrived at api page");
});


module.exports = router;