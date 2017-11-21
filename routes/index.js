//添加的文件
module.exports = function (app) {
    require('./home')(app);
    require('./jp_test')(app);
    require('./login')(app);
    require('./logout')(app);
    require('./register')(app);
    require('./wrong_answers')(app);
};