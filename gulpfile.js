var child = require('child_process');

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var scss = require('gulp-sass');

var siteRoot = '_site';
var cssFiles = '_css/**/*.?(s)css';

gulp.task('css', function () {
  gulp.src(cssFiles)
    .pipe(scss().on('error', scss.logError))
    .pipe(concat('all.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(csso())
    .pipe(gulp.dest('assets'));
});

gulp.task('jekyll', function () {
  var jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--drafts']);

  jekyll.stdout.on('data', function (buffer) {
    buffer.toString().trim().split(/\s*\n\s*/).forEach(function (message) {
      gutil.log('Jekyll: ' + message);
    });
  });
});

gulp.task('serve', function () {
  connect.server({
    port: 4000,
    root: siteRoot,
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch(cssFiles, ['css']);

  gulp.watch(siteRoot + '/**', function (event) {
    gulp.src(event.path)
      .pipe(connect.reload());
  });
});

gulp.task('default', ['css', 'jekyll', 'serve', 'watch']);
