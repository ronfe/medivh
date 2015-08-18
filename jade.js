var fs = require('fs');
var jade = require('jade');
var _ = require('lodash');
var async = require('async');

exports.generate = function (arr) {
    var fn = jade.compileFile('./template/seed1.jade', {pretty: true});
    async.each(arr,
        function (item, callback) {
            fs.writeFile("./out/" + item.activity + '.html', fn(item), callback);
        }, function (err) {
            console.log("done." + (err | ''));
            process.exit(0);
        });
};
