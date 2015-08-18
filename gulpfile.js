var path = require('path');
var del = require('del');

/* font compress npm module */
var rename = require('gulp-rename');
var gfi = require("gulp-file-insert");
var fontSpider = require('gulp-font-spider');
var gulpCopy = require('gulp-copy');
/****************************/

var bower = require('./bower.json');
var bowerDir = 'vendor';

var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/,
    rename: {
        "gulp-minify-css": "minifyCSS",
        "gulp-css-url-basename": "basename"
    }
});
var runSequence = require('run-sequence');

// script
var SCRIPT = 'template/script.js';
var CSS = 'template/seed.css';

var DEBUG = 'build';
var RELEASE = 'bin';

gulp.task('debug', ['build_index']);
gulp.task('release', ['bin_index']);

gulp.task('debug', function (callback) {
    runSequence('clean',
        ['build_js', 'build_css', 'build_copy'],
        'build_index',
        callback);
});

gulp.task('release', function (callback) {
    runSequence('clean',
        ['bin_js', 'bin_css', 'bin_copy'],
        'bin_index',
        callback);
});

gulp.task('clean', function () {
    del.sync([DEBUG, RELEASE]);
});

gulp.task('build_js', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: '**/*.js'
    }).concat(SCRIPT))
        //.pipe(plugins.debug())
        .pipe(plugins.concat(bowerDir + bower.version + '.js'))
        .pipe(gulp.dest(DEBUG))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('bin_js', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: '**/*.js'
    }).concat(SCRIPT))
        //.pipe(plugins.debug())
        .pipe(plugins.concat(bowerDir + bower.version + '.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(RELEASE))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('build_css', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: '**/*.css'
    }).concat(CSS))
        .pipe(plugins.concat(bowerDir + bower.version + '.min.css'))
        .pipe(plugins.basename())
        .pipe(gulp.dest(DEBUG))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('bin_css', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: '**/*.css'
    }).concat(CSS))
        .pipe(plugins.concat(bowerDir + bower.version + '.min.css'))
        .pipe(plugins.basename())
        .pipe(plugins.minifyCSS())
        .pipe(gulp.dest(RELEASE))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('build_copy', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: /.*\.((?!less|css|js).)*$/i
    }).concat('assets/*').concat('out/*.html'))
        .pipe(gulp.dest(DEBUG))
        .on('error', plugins.util.log);
});

gulp.task('bin_copy', function () {
    return gulp.src(plugins.mainBowerFiles({
        base: bowerDir,
        filter: /.*\.((?!less|css|js).)*$/i
    }).concat('assets/*').concat('out/*.html'))
        .pipe(gulp.dest(RELEASE))
        .on('error', plugins.util.log);
});

gulp.task('build_index', ['build_copy', 'build_css', 'build_js'], function () {
    var target = DEBUG + '/*.html';
    var sources = gulp.src([DEBUG + '/*.js', DEBUG + '/*.css'], {read: false});
    return gulp.src(target)
        .pipe(plugins.inject(sources, {relative: true}))
        .pipe(gulp.dest(DEBUG))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});

gulp.task('bin_index', ['bin_copy', 'bin_css', 'bin_js'], function () {
    var target = RELEASE + '/*.html';
    var sources = gulp.src([RELEASE + '/*.js', RELEASE + '/*.css'], {read: false});
    return gulp.src(target)
        .pipe(plugins.inject(sources, {relative: true}))
        .pipe(gulp.dest(RELEASE))
        .pipe(plugins.filesize())
        .on('error', plugins.util.log);
});


/* font compress tasks */
gulp.task('font-compress', ['renameFontName', 'insertJadeToHtml'], function () {
    return gulp.src('font-compress/template/fontCompressTemplate.html')
        .pipe(fontSpider());
});

gulp.task('renameFontName', function () {
    gulp.src('font-compress/FZLanTYJW_Zhun.eot')
        .pipe(rename('FZLanTYJWC.eot'))
        .pipe(gulp.dest('assets/'));
    return gulp.src('font-compress/FZLanTYJW_Zhun.ttf')
        .pipe(rename('FZLanTYJWC.ttf'))
        .pipe(gulp.dest('assets/'));
});

gulp.task('renameJadeConcatedTemplate', function () {
    return gulp.src('font-compress/fontCompressTemplate.html')
        .pipe(rename('fontCompressTemplate.html'))
        .pipe(gulp.dest('font-compress/template/'));
});

gulp.task('insertJadeToHtml', ['renameJadeConcatedTemplate'], function () {
    return gulp.src('font-compress/template/fontCompressTemplate.html')
        .pipe(gfi({
            "/* jadeStr */": "font-compress/template/seed1.jade"
        }))
        .pipe(gulp.dest('font-compress/template/'))
});

//优先npm start
gulp.task('copy-seed1', function () {
    return gulp.src('template/seed1.jade')
        .pipe(gulpCopy('font-compress/', 2));
});
/********************/