const child = require('child_process');
const browserSync = require('browser-sync').create();

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const css_minify = require('gulp-cssnano');
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
    .pipe(css_minify())
    .pipe(gulp.dest('assets'));
});

gulp.task('build', () => {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--drafts']);

  jekyll.stdout.on('data', (buffer) => {
    buffer.toString()
      .trim()
      .split(/\s*\n\s*/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  });
});

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    notify: false,
    open: false,
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['css', 'build', 'serve']);
