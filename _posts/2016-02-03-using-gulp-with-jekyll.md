---
title: "Using Gulp with Jekyll"
date: 2016-02-03 03:45 UTC
ad: checkt
---

I'm a fan of [Jekyll].
Combine it with [GitHub Pages] and you get a free blog that can handle tons of traffic.
It's great.
It's the best.
There's just this one thing.
Jekyll handles [Sass] out of the box and supports [CoffeeScript] with a gem but I demand more.
I want Sass, file concatentation, minification, automatic prefixing of CSS, live reloading, and dancing unicorns!
Ok, that last one might not be available.
For the rest... enter [Gulp].

<!--more-->

### The More You Know

I assume you're familiar with Jekyll.
If you're not, go read up on that and come back.
I'll be here.

If you've used Gulp, give yourself a high five and move to the next section.

Still here?
Grab your helmet and buckle up for a crash course in Gulp.

At its core Gulp can run tasks and watch files.
It also provides a handy way to source files, transform them, and write them out within a single task.
If you've worked with Ruby on Rails, it's like rake, guard, and the asset pipeline had a baby.

To install Gulp, the first thing you'll need is [Node].

Once you have Node installed run this:

```sh
$ npm init
```

You'll be prompted with a few questions.
The answers are used to write out a file called `package.json`.
Don't be too worried about messing up.
You can always change the file later.

The `package.json` file is a description of your project and its dependencies.
Go ahead and add Gulp as your first dependency.

```sh
$ npm install --global gulp
$ npm install --save-dev gulp
```

The first install makes `gulp` available as a system wide command.
The second saves it to the local `node_modules` directory and adds it to your `package.json`.

Gulp expects to find a `gulpfile.js` when run.
That file contains all of the tasks you want to be able to run.

```javascript
// gulpfile.js

const gulp = require('gulp');
function magicUpperCaseConvert() {
  // ...
};

gulp.task('upper', () => {
  gulp.src('*.txt')
    .pipe(magicUpperCaseConvert())
    .pipe(gulp.dest('upper_files'));
});

gulp.task('watch', () => {
  gulp.watch('*.txt', ['upper']);
});

gulp.task('default', ['watch']);
```

Let's break down the "upper" task.
It starts by getting all text files from the current directory via `gulp.src`.
Each file is piped through our `magicUpperCaseConvert` function.
Then the file is written to the "upper\_files" directory via `gulp.dest`.
All this can be done from the command line by calling `gulp upper`.

The "watch" task uses `gulp.watch` to keep an eye on those same text files.
Any file changes will cause it to call the "upper" task.
You'll notice that "upper" is part of an array.
More than one task can be executed.

At the end there's a "default" task.
Calling `gulp` without specifying a task results in a call to the "default" task.
Similar to `gulp.watch`, this can also take an array of tasks.

That's it.
The course is complete.
You'll receive a certificate in 8-12 weeks.

### A Friendly Reminder

By the time you're done your project will include `package.json`, `gulpfile.js`, and a `node_modules` directory.
You don't want these served up with your actual site.
Take a moment and add them to your `_config.yml` as build exclusions.

```yaml
exclude:
  - package.json
  - node_modules
  - gulpfile.js
```

On to the Gulping!

### Concatenation

I like to keep my hand crafted CSS in a folder called "_css".
The processed assets that end up on the site go in a folder called "assets".
Use whatever structure works for you.
This guide uses my setup.

You'll start by joining all of the files in "_css" and adding the new file to "assets".
For the concatentation you'll use a library called `gulp-concat`.

```sh
$ npm install --save-dev gulp-concat
```

Start off your `gulpfile.js` with the code below.

```javascript
const gulp = require('gulp');
const concat = require('gulp-concat');

const cssFiles = '_css/**/*.css';

gulp.task('css', () => {
  gulp.src(cssFiles)
    .pipe(concat('all.css'))
    .pipe(gulp.dest('assets'))
});

gulp.task('watch', () => {
  gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['css', 'watch']);
```

Running `gulp css` will generate a file with all of your CSS called "assets/all.css".
You can also run `gulp watch` and it will continuously regenerate the file as you make changes.

Not bad for 12 lines of code.

### Sass

Jekyll supports Sass and I like using it.
Adding Sass to the existing code requires little effort.

Go ahead and install `gulp-sass`.

```sh
$ npm install --save-dev gulp-sass
```

First, update the files being watched to include "scss".
Then pipe the files through the Sass transform.

```diff
 const gulp = require('gulp');
 const concat = require('gulp-concat');
+const sass = require('gulp-sass');

-const cssFiles = '_css/**/*.css';
+const cssFiles = '_css/**/*.?(s)css';

 gulp.task('css', () => {
   gulp.src(cssFiles)
+    .pipe(sass())
     .pipe(concat('all.css'))
     .pipe(gulp.dest('assets'));
 });

 gulp.task('watch', () => {
   gulp.watch(cssFiles, ['css']);
 });

 gulp.task('default', ['css', 'watch']);
```

Congratulations, your blog supports Sass files.
You can follow this basic process to add other transforms like automatic vender prefixing and minification.

### Running Jekyll via Gulp

As it stands you're going to have to run Jekyll and Gulp to have a functioning site.
It would be nice if we could get that back to one command.
The good news is we can!
We're going to run Jekyll in a child process.

To accomplish this you'll use the `child_process` library that comes with Node.
You'll also want `gulp-util`.

```sh
$ npm install --save-dev gulp-util
```

When Jekyll prints output we want to show it.
Using `gulp-util` makes it look like all the other entries in the log.

```sh
[23:23:25] Jekyll: Configuration file: /Users/aaron/blog/_config.yml
[23:23:25] Jekyll:
[23:23:25] Jekyll:             Source: /Users/aaron/blog
[23:23:25] Jekyll:        Destination: /Users/aaron/blog/_site
[23:23:25] Jekyll:  Incremental build: enabled
[23:23:25] Jekyll:
[23:23:25] Jekyll:       Generating...
[23:23:25] Jekyll:
[23:23:27] Jekyll:                     done in 2.734 seconds.
```

You'll need to launch `jekyll serve --watch --incremental --drafts` as a child process.
Then capture the output buffer, clean it up, and log it.

```javascript
const child = require('child_process');
const gutil = require('gulp-util');

gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', ['serve',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});
```

Add this new task to your "default" task.

```diff
- gulp.task('default', ['css', 'watch']);
+ gulp.task('default', ['css', 'jekyll', 'watch']);
```

Hit the command line, type `gulp`, lean back, and enjoy.
Initially this might look like a mere convenience.
On the contrary, we're now ready for the next big step.

### Live Reloading

Gone are the days of making a change to your blog and manually refreshing your browser.
These are the days of the live reload.
Every change will cause your browser to automatically reload the page.

There are several packages that you can install to achieve a live reload.
We'll do it with one called `browser-sync`.

```sh
$ npm install --save-dev browser-sync
```

[Browsersync] does more than just reload your pages.
It also syncs up all browsers viewing the page.
If you open your site in Firefox and in Chrome and then scroll in one, the other will scroll too.
You could open it in Safari on a Mac, Edge on a Windows PC, and in Firefox on your Android phone and scroll them all.
It'll copy clicks, submit forms, and generally do its best to keep everything in line.

In order to use all of Browsersync you need to let it run the show.
This means Jekyll will build content instead of serving it.

```diff
- const jekyll = child.spawn('jekyll', ['serve',
+ const jekyll = child.spawn('jekyll', ['build',
```

Leave it to Browsersync to serve up the files.

```javascript
const browserSync = require('browser-sync').create();

const siteRoot = '_site';

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });
});
```

I've set the port to `4000` for parity with Jekyll but you don't have to.
The `files` line is crutial because it spells out which files to watch for changes.

At this point the "watch" task doesn't serve much purpose by itself.
You might as well join it into "serve".

```diff
 gulp.task('serve', () => {
   browserSync.init({
     files: [siteRoot + '/**'],
     port: 4000,
     server: {
       baseDir: siteRoot
     }
   });
+
+  gulp.watch(cssFiles, ['css']);
 });

-gulp.task('watch', () => {
-  gulp.watch(cssFiles, ['css']);
-});
```

Replace "watch" with "serve" and you're all set.

```diff
- gulp.task('default', ['css', 'jekyll', 'watch']);
+ gulp.task('default', ['css', 'jekyll', 'serve']);
```

At this point you there should be fireworks, a choir of angels singing, and you should have a sense of complete tranquility.

### Everything Else

You're up and running but you don't have to stop here.
For minification take a look at `gulp-cssnano`.
If you're using something like flexbox where vendor prefixes can help a lot consider `gulp-autoprefixer`.
Maybe your site has JavaScript (or some flavor of it) and you want to handle that too.
The steps are largely the same.
From here the sky's your oyster and the world's the limit.
Well, something like that.

Final `gulpfile.js`:

```javascript
const child = require('child_process');
const browserSync = require('browser-sync').create();

const gulp = require('gulp');
const concat = require('gulp-concat');
const gutil = require('gulp-util');
const sass = require('gulp-sass');

const siteRoot = '_site';
const cssFiles = '_css/**/*.?(s)css';

gulp.task('css', () => {
  gulp.src(cssFiles)
    .pipe(sass())
    .pipe(concat('all.css'))
    .pipe(gulp.dest('assets'));
});

gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', ['build',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 4000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['css', 'jekyll', 'serve']);
```

[Jekyll]: https://jekyllrb.com/
[GitHub Pages]: https://pages.github.com/
[Sass]: http://sass-lang.com/
[CoffeeScript]: http://coffeescript.org/
[Gulp]: http://gulpjs.com/
[Node]: https://nodejs.org/en/
[Browsersync]: https://www.browsersync.io/
