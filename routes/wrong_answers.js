module.exports = function (app) {
    app.get('/wrong_answers', function (req, res) {
        let para_obj={};
        if(req.session.user){
            let account_data = para_obj['loginUser'] = req.session.user;
            global.db.query_wrong_anwsers(account_data['aid']).then(function(rows){
                para_obj['waList'] = rows;
                res.render('wrong_answers', para_obj);
            }).catch(function(err){
                console.log(err);
                res.sendStatus(500);
            })
        } else{
            res.redirect('/login');
        }
    });

    app.post('/wrong_answers', function (req, res) {
        let aid = req.body.aid;
        let qids = req.body["qids[]"];
        if(Array.isArray(qids)==false){
            qids = [qids];
        }
        global.db.insert_wrong_anwsers(aid,qids).then(function(){
            res.sendStatus(200);
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    });

    app.delete('/wrong_answers', function (req, res) {
        let wids = req.body["wids[]"];
        if(Array.isArray(wids)==false){
            wids = [wids];
        }
        global.db.delete_wrong_anwsers(wids).then(function(){
            res.sendStatus(200);
        }).catch(function(err){
            console.log(err);
            res.sendStatus(500);
        });
    });
}