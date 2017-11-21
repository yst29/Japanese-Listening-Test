const bcrypt = require('bcrypt');

module.exports = function (app) {
    app.get('/register', function (req, res) {
        res.render('register', {withoutRightBar: true});
    });

    app.post('/register', function (req, res) {
        const uname = req.body.uname;
        const hash = req.body.hash;

        global.db.query_single_data('account','username',uname,false).then(function(rows){
            if(rows.length>0){
                res.sendStatus(409);
            } else {
                bcrypt.hash(hash, 5, function( err, bcryptedPassword) {
                    if(err) throw err;
                    global.db.insert_account(uname,bcryptedPassword).then(function(){
                        res.sendStatus(200);
                    });
                });
            }
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    });
}