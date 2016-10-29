// Herald App gulpfile
// This file build all of the sass file and start the server

// 1. LIBRARIES
// - - - - - - - - - - - - - - - 
'use strict';



var $         = require('gulp-load-plugins')();
var gulp      = require('gulp');
var sass      = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename    = require('gulp-rename');
var sequence  = require('run-sequence');
var concat    = require('gulp-concat');
var uglify    = require('gulp-uglify');
var ngmin     = require('gulp-ngmin');

// 2. FILE PATHS
// - - - - - - - - - - - - - - -

var paths = {
    sass:['./static/scss/**/*.scss'],
    js:['./static/js/*.js','./pages/**/*.js'],
    cssfile:['./static/css/app.min.css'],
    htmlfile:['./**/*.html','!./node_modules/**/*.html','!./out/**/*.html','!index.html'],
    imagefile:['./static/img/**/*.jpg'],
    fontfile:['./static/fonts/**/*.*']
};

// 3.TASKS
// - - - - - - - - - - - - - - -

// compile scss file 
// - - - - - - - - - - - - - - -
gulp.task('sass',function(done){
    gulp.src(paths.sass)
        .pipe(sass({includePaths: ['./static/scss'],errLogToConsole: true}).on('error', sass.logError))
        .pipe(gulp.dest('./static/css/'))
        .pipe(minifyCss({
            keepSpecialComments:0
        }))
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest('./static/css/'))
        .on('end', done);
});

gulp.task('minifyjs',function(){
    return gulp.src(paths.js)
            .pipe(ngmin({dynamic: false}))
            .pipe(uglify({outSourceMap: false}))
            .pipe(concat('app.min.js'))
            .pipe(gulp.dest('./out/static/js/'));
});

gulp.task('moveCssfile',function(){
    return gulp.src(paths.cssfile)
        .pipe(gulp.dest('./out/static/css'));
});
gulp.task('moveHtmlfile',function(){
    return gulp.src(paths.htmlfile)
        .pipe(gulp.dest('./out/'));
});
gulp.task('moveJsfile',function(){
    return gulp.src(paths.jsfile)
        .pipe(gulp.dest('./out/static/js'));
});
gulp.task('moveImagefile',function(){
    return gulp.src(paths.imagefile)
        .pipe(gulp.dest('./out/static/img'));
});
gulp.task('moveFontfile',function(){
    return gulp.src(paths.fontfile)
        .pipe(gulp.dest('./out/static/fonts'));
});
// before start server,compile scss file
// - - - - - - - - - - - - - - -

gulp.task('build',function(done){
    sequence('sass','minifyjs','moveCssfile','moveHtmlfile','moveImagefile','moveFontfile',done);
})

// start the server
// - - - - - - - - - - - - - - -

gulp.task('server',['build'],function(){
    gulp.src('./')
        .pipe($.webserver({
            port: 3000,
            host: 'localhost',
            fallvack: 'index.html',
            livereload: true,
            open: true
        }));
});


// watch file's change and reload server
// - - - - - - - - - - - - - - -

gulp.task('default',['server'],function(){
    gulp.watch(paths.sass, ['sass']);
});

// gulp.task('default',['minifyjs'],function(){
//     gulp.watch(paths.sass, ['sass']);
// });