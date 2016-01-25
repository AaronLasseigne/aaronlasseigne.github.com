var spawn = require('child_process').spawn;

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var scss = require('gulp-sass');

var siteDir = '_site';
var siteFiles = siteDir + '/**';
var cssFiles = '_css/**/*.?(s)css';

gulp.task('jekyll', function() {
  var jekyll = spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--drafts']);

  jekyll.stdout.on('data', function (buffer) {
    buffer.toString().trim().split(/\s*\n\s*/).forEach(function(message){
      gutil.log('Jekyll: ' + message);
    });
  });
});

gulp.task('css', function() {
  gulp.src(cssFiles)
    .pipe(scss().on('error', scss.logError))
    .pipe(concat('all.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(csso())
    .pipe(gulp.dest('assets'))
    .pipe(gulp.dest(siteDir + '/assets'));
});

gulp.task('site', function() {
  gulp.src(siteFiles)
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(cssFiles, ['css']);

  gulp.watch(siteFiles, ['site']);
});

gulp.task('serve', function() {
  connect.server({
    port: 4000,
    root: siteDir,
    livereload: true
  });
});

gulp.task('default', ['css', 'jekyll', 'serve', 'watch']);
