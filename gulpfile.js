const child = require('child_process');

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const csso = require('gulp-csso');
const gutil = require('gulp-util');
const scss = require('gulp-sass');

const siteRoot = '_site';
const cssFiles = '_css/**/*.?(s)css';

gulp.task('css', () => {
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

gulp.task('jekyll', () => {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--drafts']);

  jekyll.stdout.on('data', (buffer) => {
    buffer.toString()
      .trim()
      .split(/\s*\n\s*/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  });
});

gulp.task('serve', () => {
  connect.server({
    port: 4000,
    root: siteRoot,
    livereload: true
  });
});

gulp.task('watch', () => {
  gulp.watch(cssFiles, ['css']);

  gulp.watch(siteRoot + '/**', (event) => {
    gulp.src(event.path)
      .pipe(connect.reload());
  });
});

gulp.task('default', ['css', 'jekyll', 'serve', 'watch']);
