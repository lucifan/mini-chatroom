var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var webpack = require('webpack-stream');

gulp.task('sass', function() {
	return gulp.src('./public/scss/*.scss')
    .pipe(sass())
    .on('error', function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit('end');
    })
    // .pipe(csso())    //    Minify CSS
	.pipe(gulp.dest('./public/css/'));
});

gulp.task('webpack', function() {
	return gulp.src('./public/jsx/*.jsx')
	.pipe(webpack( require('./webpack.config.js') ))
    .on('error', function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit('end');
    })
	.pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
	gulp.watch('./public/scss/*.scss', ['sass']);
});


gulp.task('default', ['watch', 'webpack']);
