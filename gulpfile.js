var path = require('path');
var del = require('del');

var bower = require('./bower.json')
var bowerDir = 'vendor';

var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/,
    rename: {
        "gulp-minify-css": "minifyCSS"
    }
});

// script
var SCRIPT = 'template/script.js';

// other assets
var misc = [];
misc.push('./assets/seed.css');
var em = bowerDir + '/mediaelement/build/';
misc = misc.concat([em + '*.svg', em + '*.gif', em + '*.png']); // mediaelement
var asset = './assets/'
misc = misc.concat([asset + '*.css', asset+ '*.ico', asset + '*.eot', asset + '*.svg', asset + '*.woff', asset + '*.woff2', asset + '*.png'])

var DEBUG = 'build'
var RELEASE = 'bin'

gulp.task('debug', ['clean', 'build_copy', 'build_index']);
gulp.task('release', ['clean', 'bin_copy', 'js', 'css', 'bin_index']);

gulp.task('clean', function () {
    del.sync([DEBUG, RELEASE]);
});

gulp.task('js', function () {
    return gulp.src([bowerDir + '/jquery/dist/jquery.js'].concat(plugins.mainBowerFiles({
            base: bowerDir,
            filter: /.*((?!jquery).)\.js$/i
        })).concat([SCRIPT]))
        .pipe(plugins.concat(bowerDir + bower.version + '.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(RELEASE))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('css', function () {
    return gulp.src(plugins.mainBowerFiles({
            base: bowerDir,
            filter: /.*\.css$/i
        }))
        .pipe(plugins.concat(bowerDir + bower.version + '.min.css'))
        .pipe(plugins.minifyCSS())
        .pipe(gulp.dest(RELEASE))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('build_copy', function () {
    return gulp.src(misc.concat(plugins.mainBowerFiles({
            base: bowerDir,
            filter: /.*\.((?!less).)*$/i
        })).concat([SCRIPT]))
        .pipe(gulp.dest(DEBUG))
        .on('error', plugins.util.log);
});

gulp.task('bin_copy', function () {
    return gulp.src(misc.concat(plugins.mainBowerFiles({
            base: bowerDir,
            filter: /.*\.((?!less|css|js).)*$/i
        })))
        .pipe(gulp.dest(RELEASE))
        .on('error', plugins.util.log);
});


var index = function (folder) {
    var target = './out/*.html'
    var sources = gulp.src([folder + '/jquery.js', folder + '/!(jquery)*.js', folder + '/*.css'], {read: false});
    return gulp.src(target)
        .pipe(gulp.dest(folder))
        .pipe(plugins.inject(sources, {relative: true}))
        .pipe(gulp.dest(folder))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
}

gulp.task('build_index', ['build_copy'], function () {
    return index(DEBUG);
});

gulp.task('bin_index', ['bin_copy', 'css', 'js'], function () {
    return index(RELEASE);
});
