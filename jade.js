var fs = require('fs');
var jade = require('jade');
var _ = require('lodash');
var async = require('async');

exports.generate = function (arr) {
    var fn = jade.compileFile('./template/seed1.jade', {pretty: true});
    var chapterFn = jade.compileFile('./template/seed2.jade', {pretty: true});
    var topicFn = jade.compileFile('./template/seed3.jade', {pretty: true});

    fs.mkdirSync("./out/chapter");


    async.parallel([
        function (cb) {
            async.each(arr[0],
                function (item, callback) {
                    fs.writeFile("./out/" + item.activity + '.html', fn(item), callback);
                }, function (err) {
                    console.log("done videos." + (err | ''));
                    cb(null, 'videos');
                }
            );
        },
        function (cb) {
            async.each(arr[2],
                function (item, callback) {
                    var newItem = {
                        chapterName: item.chapterName,
                        guideVideo: item.guideVideo,
                        topics: _.uniq(item.topics)
                    };
                    fs.writeFile("./out/chapter/" + item.chapterName + ".html", topicFn(newItem), callback);
                }, function (err) {
                    console.log("done topics." + (err | ''));
                    cb(null, 'chapters');
                }
            );
        }
    ], function (err, data) {
        if (err) console.error(err);
        console.log('Parallel jade conversion done.');
        process.exit(0);
    });


    fs.writeFile("./out/index.html", chapterFn(arr[1]), function (err) {
        if (err) console.error(err);
        console.log('Index ready.');
    });

};