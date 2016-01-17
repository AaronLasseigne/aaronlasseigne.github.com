var spawn = require('child_process').spawn;
var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var csso = require('gulp-csso');
var livereload = require('gulp-livereload');

var siteDir = '_site';
var siteFiles = siteDir + '/**';

gulp.task('jekyll', function() {
  var jekyll = spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--drafts']);

  jekyll.stdout.on('data', function (data) {
      console.log('jekyll:\t' + data); // works fine
  });
});

gulp.task('css', function() {
  return gulp.src('css/**/*.css')
    .pipe(concat('all.css'))
    .pipe(csso())
    .pipe(gulp.dest('assets'))
    .pipe(gulp.dest(siteDir + '/assets'));
});

gulp.task('site', function() {
  gulp.src(siteFiles)
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('css/**/*.css', ['css']);

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
