const http = require('http');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const jp_test = function(app) {
    jp_test.CurrentAudioPath = ''

    app.get('/createquestions/:range?/:amount?', function(req, res, next){
        const range = req.params.range;
        const amount = req.params.amount;
        const difficulty_arr = getDifficultyArr(range);
        global.db.query_questions(difficulty_arr).then(function(rows){
            const subarray = random_subarray(rows,amount);
            return res.json(subarray);
        }).catch(function(err){
            console.log(err);
            return res.sendStatus(500);
        });
    });

    app.get('/create_questions_from_wa/:amount?', function (req, res) {
        if(req.session.user){
            let aid = req.session.user['aid'];
            let amount = req.params.amount;
            global.db.query_wrong_anwsers(aid).then(function(rows){
                if(rows.length==0){
                    return res.sendStatus(411);
                }
                let subarray = random_subarray(rows,amount);
                return res.json(subarray);
            }).catch(function(err){
                console.log(err);
                return res.sendStatus(500);
            })
        } else{
            return res.sendStatus(401);
        }
    });

    app.get('/createsound/:word?', function(req, res){
        const word = req.params.word;
        const randomName = uuidv4()+'.mp3';
        const audioPath = global.__base + 'public/audio_word/' + randomName;
        if (jp_test.CurrentAudioPath!='' && fs.existsSync(jp_test.CurrentAudioPath)) {
            fs.unlink(jp_test.CurrentAudioPath);
        }
        const url = 'http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q='+encodeURI(word)+'&tl=ja';

        download_file(url,audioPath).then(function(){
            jp_test.CurrentAudioPath = audioPath;
            return res.send(randomName);
        }, function(reason) {
            console.log(reason);
            return res.sendStatus(500);
        });
    });


    function random_subarray(arr,amount){
        let i, tmp, rand, max_index=arr.length-1;
        amount = Math.min(amount,arr.length);
        for(i=0; i<amount; i++){
            rand = Math.floor(Math.random() * max_index);
            tmp = arr[i];
            arr[i] = arr[rand];
            arr[rand] = tmp;
        }
        const subarray = arr.slice(0,amount);
        return subarray;
    }

    function getDifficultyArr(range){
        let difficulty_arr = [];
        let mask = 1;
        for(let i=1; i<=5; i++){
            if( (range & mask) != 0 ){
                difficulty_arr.push(i);
            }
            mask <<= 1;
        }
        return difficulty_arr;
    }

    function download_file(url, dest) {
        return new Promise(function(resolve, reject){
            const file = fs.createWriteStream(dest);
            const request = http.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    resolve();
                });
            }).on('error', function(err) {
                fs.unlink(dest);
                reject(err);
            });
        });
    };
}

module.exports = jp_test;