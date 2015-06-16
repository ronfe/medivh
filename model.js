'use strict';
var async = require('async');
var _ = require('lodash');

exports.traverse = function (mongoose, cb) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;
    var Publisher = mongoose.model('Publisher', new Schema({
        name: String,
        grades: [{
            type: ObjectId
        }]
        // chapters: [
        //     {type: ObjectId}
        // ]
    }, { collection: 'publishers' }));

    var CVGrade = mongoose.model('CVGrade', new Schema({
        cv: {type: ObjectId},
        grade: {type: ObjectId},
        chapters: [{
            type: ObjectId,
            ref: 'Chapter'
        }]
    }, {collection: 'cvgrades'}));

    var Grade = mongoose.model('Grade', new Schema({
        name: String,
        chapters: [
            {type: ObjectId}
        ]
    }, {collection: 'grades'}));

    var Chapter = mongoose.model('Chapter', new Schema({
        name: String,
        icourses: [
            {
                topic: { type: ObjectId}
            }
        ],
        state: String,
        icon: String,
        guideVideo: String
    }, {collection: 'chapters'}));
    var Topic = mongoose.model('Topic', new Schema({
        name: String,
        tasks: [
            {type: ObjectId}
        ]
    }));
    var Task = mongoose.model('Task', new Schema({
        type: String,
        activities: [
            {type: ObjectId}
        ]
    }));
    var Activity = mongoose.model('Activity', new Schema({
        name: String,
        videos: [
            {type: ObjectId}
        ]
    }));
    var Video = mongoose.model('Video', new Schema({
        type: String,
        url: String
    }));

    var target = [];

    var populateGeneralInfo = function(cpt, cb){
        async.each(cpt.icourses, function(icourse, callback){
            // Topic.findOne({_id: icourse.topic}, function(err, topic){
            //     Task.find({_id: {$in: topic.tasks}}, function(err, tasks){
            //         async.each(tasks, function(task, callback){
            //             // Activity.find({_id: {$in: task.activities}}, function(err, activities){
            //             //     async.each(activities, function(activity, callback){
            //             //         // Video.find({_id: {$in: activity.videos}}, function(err, videos){
            //             //         //     _.forEach(videos, function (video) {
            //             //         //         target.push({chapter: cpt.name, topic: topic.name, topicIcon: topic._doc.icon, task: task.type,
            //             //         //             activity: activity.name, actThumbnail: activity._doc.thumbnail, video: video.url});
            //             //         //     });
            //             //         //     console.log(target);
            //             //         //     callback();
            //             //         // });
            //             //
            //             //     }, cb);
            //             // });
            //
            //         }, cb);
            //     });
            // });
            console.log(icourse);
            callback();
        }, cb);
    }

    Publisher.findOne({name: '人教版'}, function(err, publisher){
        var publisherId = publisher._id;
        CVGrade.find({cv: publisherId}, function(err, grades){
            async.each(grades, function(grade, callback){
                grade.populate('chapters', function(err, populatedGrades){
                    async.each(populatedGrades.chapters, function(chapter, callback){
                        if (chapter.state === 'published' || chapter.state === 'updating'){
                            Video.findOne({_id: chapter.guideVideo}, function(err, gv){
                                if (gv !== null){
                                    target.push({
                                        chapter: chapter.name,
                                        topic: '章节引入',
                                        topicIcon: 'guide.png',
                                        task: 'guide',
                                        activity: chapter.name + '的引入',
                                        actThumbnail: chapter.icon,
                                        video: gv.url
                                    });
                                }
                            });
                            async.each(chapter.icourses, function(icourse, callback){
                                Topic.find({_id: icourse.topic}, function (err, topics) {
                                    async.each(topics, function (topic, callback) {
                                        Task.find({_id: {$in: topic.tasks}}, function (err, tasks) {
                                            async.each(tasks, function (task, callback) {
                                                Activity.find({_id: {$in: task.activities}}, function (err, activities) {
                                                    async.each(activities, function (activity, callback) {
                                                        Video.find({_id: {$in: activity.videos}, type: 'main'}, function (err, videos) {
                                                            _.forEach(videos, function (video) {
                                                                target.push({chapter: chapter.name, topic: topic.name, topicIcon: topic._doc.icon, task: task.type,
                                                                    activity: activity.name, actThumbnail: activity._doc.thumbnail, video: video.url});
                                                                });
                                                                callback();
                                                            });
                                                        }, callback);
                                                    });
                                                }, callback);
                                            });
                                        }, callback);
                                    });
                            }, callback);
                        }
                        else{
                            callback();
                        }
                    }, callback);
                });

            }, function(){ console.log(target); cb(target);});
        });
    });
}
