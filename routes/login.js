const bcrypt = require('bcrypt');

module.exports = function (app) {
    app.get('/login', function (req, res) {
        res.render('login', {withoutRightBar: true});
    });

    app.post('/login', function (req, res) {
        let uname = req.body.uname;
        global.db.query_single_data('account','username',uname,true).then(function(rows){
            if(rows.length==0){
                res.sendStatus(404);
            } else {
                let account_data = rows[0];
                bcrypt.compare(req.body.hash, account_data['password'], function(err, doesMatch){
                    if(err){
                        throw err;
                    } else if(doesMatch){
                        delete account_data['password'];
                        req.session.user = account_data;
                        res.sendStatus(200);
                    } else{
                        res.sendStatus(401);
                    }
                 });
            }
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    });
}