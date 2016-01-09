var gulp = require('gulp');
var concat = require('gulp-concat');
var csso = require('gulp-csso');

gulp.task('compile', function() {
  return gulp.src('css/**/*.css')
    .pipe(concat('all.css'))
    .pipe(csso())
    .pipe(gulp.dest('assets'));
});

gulp.task('watch', function() {
  gulp.watch('css/**/*.css', ['compile']);
});
