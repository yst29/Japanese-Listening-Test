const urlObject = require('url')

module.exports = function (app) {
    app.get('/', function(req, res){
        let para_obj={};
        if(req.session.user){
            para_obj['loginUser'] = req.session.user;

            let queryData = urlObject.parse(req.url, true).query;
            if(queryData.mode=='review'){
                para_obj['reviewMode'] = true;
            }
        }
        res.render('index', para_obj);
    });
}