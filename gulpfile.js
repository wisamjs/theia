var gulp = require('gulp');
var mocha = require('gulp-mocha');
var prettify = require('gulp-jsbeautifier');
var eslint = require('gulp-eslint');

var jsFiles = ['*.js', 'lib/**/*.js'];


gulp.task('mocha-ci', function (cb) {
  return gulp.src('lib/**/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'min'
    }));
});

gulp.task('beautify', function () {
  gulp.src(jsFiles, {
      base: '.'
    })
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('beautify:build', function () {
  gulp.src(jsFiles)
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_ONLY'
    }));
});


/**
 * JavaScript Linting Task
 */
gulp.task('lint', function () {
  return gulp.src(jsFiles)
    .pipe(eslint())
    .pipe(eslint.format());
});

/**
 * JavaScript Build Lint Task
 */
gulp.task('lint:build', function () {
  return gulp.src(jsFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('mocha-watch', function () {
  gulp.watch('lib/**/*.js', ['mocha-ci']);
});

gulp.task('default', ['beautify', 'mocha-watch']);
gulp.task('test', ['beautify:build', 'mocha-ci']);
