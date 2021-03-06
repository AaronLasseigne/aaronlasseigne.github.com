const child = require('child_process');
const browserSync = require('browser-sync').create();

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const log = require('fancy-log');
const scss = require('gulp-sass');

const siteRoot = '_site';
const cssFiles = '_css/**/*.?(s)css';

function css() {
  return gulp.src(cssFiles)
    .pipe(scss().on('error', scss.logError))
    .pipe(concat('all.css'))
    .pipe(postcss([
      autoprefixer({ cascade: false }),
      cssnano()
    ]))
    .pipe(gulp.dest('assets'));
}

function jekyll() {
  const jekyll = child.spawn('bundle', ['exec', 'jekyll', 'build'
    ,'--watch'
    ,'--incremental'
    ,'--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);

  return jekyll;
}

function serve() {
  browserSync.init({
    files: [siteRoot + '/**'],
    notify: false,
    open: false,
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch(cssFiles, css);
}

const build = gulp.parallel(jekyll, gulp.series(css, serve));

exports.default = build;
