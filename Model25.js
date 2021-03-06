var async = require('async');
var _ = require('lodash');
var chaptersNameStr = '';
var topicsNameStr = '';
var activitiesNameStr = '';

exports.traverse = function (mongoose, cb) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.Types.ObjectId;

    var Publisher = mongoose.model('Publisher', new Schema({
        name: String
    }, {
        collection: 'publishers'
    }));

    var Cvgrade = mongoose.model('Cvgrade', new Schema({
        cv: {type: ObjectId},
        chapters: [{type: ObjectId}]
    }, {
        collection: 'cvgrades'
    }));

    var Chapter = mongoose.model('Chapter', new Schema({
        name: String,
        state: String,
        icourses: [
            {topic: {type: ObjectId}}
        ],
        icon: String,
        guideVideo: String
    }, {
        collection: 'chapters'
    }));

    var Topic = mongoose.model('Topic', new Schema({
        name: String,
        icon: String,
        desc: String,
        tasks: [{type: ObjectId}]
    }, {
        collection: 'topics'
    }));

    var Task = mongoose.model('Task', new Schema({
        type: String,
        activities: [{type: ObjectId}]
    }, {
        collection: 'tasks'
    }));

    var Activity = mongoose.model('Activity', new Schema({
        name: String,
        videos: [{type: ObjectId}],
        thumbnail: String
    }, {
        collection: 'activities'
    }));

    var Video = mongoose.model('Video', new Schema({
        type: String,
        url: String,
        thumbnail: String
    }));

    var target = [];
    var guideTopics = [];
    var guideChapters = {
        chapterList: []
    };

    Publisher.findOne({name: '人教版'}, function (err, publisher) {
        Cvgrade.find({cv: publisher._id}, function (err, cvGrades) {
            // async 1st cvgrades
            async.each(cvGrades, function (cvGrade, callback) {
                Chapter.find({
                    $or: [{_id: {$in: cvGrade.chapters}, state: 'published'}, {
                        _id: {$in: cvGrade.chapters},
                        state: 'updating'
                    }]
                }, function (err, chapters) {

                    // async 2nd chapters
                    async.each(chapters, function (chapter, callback) {
                        var tempChapter = {
                            chapterName: chapter.name,
                            chapterIcon: chapter.icon
                        };
                        guideChapters.chapterList.push(tempChapter);
                        var populateChapter = {
                            chapterName: chapter.name,
                            guideVideo: 1,
                            topics: []
                        };
                        Video.find({_id: chapter.guideVideo}, function (err, gv) {
                            if (gv[0]) {
                                target.push({
                                    chapter: chapter.name,
                                    chapterIcon: chapter.icon,
                                    topic: "章节引入",
                                    topicIcon: "guide.png",
                                    task: "guide",
                                    activity: chapter.name + '的引入',
                                    // change to the video thumbnail in case of database ready
                                    actThumbnail: chapter.icon,
                                    video: gv[0].url
                                });
                                var guideTopic = {
                                    topicName: "章节引入",
                                    icon: "guide.png",
                                    chapter: chapter.name,
                                    videos: [
                                        {
                                            task: "guide",
                                            activityName: chapter.name + '的引入',
                                            videoUrl: gv[0].url
                                        }
                                    ]
                                };
                                populateChapter.topics.push(guideTopic);
                            }
                        });
                        // async 3rd topics/icourses
                        async.each(chapter.icourses, function (icourse, callback) {
                            Topic.findOne({_id: icourse.topic}, function (err, topic) {
                                var tempTopic = {
                                    topicName: topic.name,
                                    icon: topic.icon,
                                    chapter: chapter.name,
                                    videos: []
                                };

                                Task.find({_id: {$in: topic.tasks}}, function (err, tasks) {
                                    // async 4th tasks
                                    async.each(tasks, function (task, callback) {
                                        Activity.find({_id: {$in: task.activities}}, function (err, activities) {
                                            // async 5th activities
                                            async.each(activities, function (activity, callback) {
                                                Video.find({_id: {$in: activity.videos}}, function (err, videos) {
                                                    _.forEach(videos, function (video) {
                                                        tempTopic.videos.push(
                                                            {
                                                                task: task.type,
                                                                activityName: activity.name,
                                                                videoUrl: video.url
                                                            }
                                                        );
                                                        populateChapter.topics.push(tempTopic);
                                                        target.push({
                                                            chapter: chapter.name,
                                                            chapterIcon: chapter.icon,
                                                            topic: topic.name,
                                                            topicIcon: topic.icon,
                                                            topicDesc: topic.desc,
                                                            task: task.type,
                                                            activity: activity.name,
                                                            actThumbnail: activity.thumbnail,
                                                            video: video.url
                                                        });
                                                        chaptersNameStr += chapter.name;
                                                        topicsNameStr += topic.name;
                                                        activitiesNameStr += activity.name;
                                                    });
                                                    callback();
                                                });
                                            }, callback);
                                            // end of 5th async
                                        });
                                    }, callback);
                                    // end of 4th async
                                });
                            });
                        }, callback);
                        // end of 3rd async
                        guideTopics.push(populateChapter);
                    }, callback);
                    // end of 2nd async
                });
            }, function () {
                chaptersNameStr += '立即免费使用';
                console.log(chaptersNameStr, topicsNameStr, activitiesNameStr);
                target = [target, guideChapters, _.uniq(guideTopics)];
                cb(target);
            });
            // end of 1st async
        });
    });

};
