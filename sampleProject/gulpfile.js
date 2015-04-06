var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var prettify = require('gulp-jsbeautifier');
var eslint = require('gulp-eslint');
var inject = require('gulp-inject');
var karma = require('gulp-karma');
var gulpFilter = require('gulp-filter');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['gulpfile.js', 'www/app.js', 'www/sections/**/*.js',
    'www/core/**/*.js'
  ],
  html: ['www/*.html', 'www/core/**/*.html', 'www/sections/**/*.html']
};

var karmaVendorFiles = [
  'www/lib/q/q.js',
  'www/lib/ionic/js/ionic.bundle.js',
  'www/lib/angular-mocks/angular-mocks.js',
  'www/lib/sinon-chai/lib/sinon-chai.js'
];
var karmaFiles = karmaVendorFiles.concat(paths.js.slice(1));
// var karmaFiles = karmaVendorFiles;


/*
 * Start web server
 */
gulp.task('devServer', function () {
  connect.server({
    root: 'www',
    port: 3000,
    livereload: true
  });
});

gulp.task('watch', function () {

});

/*
 * Compile Sass
 */
gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

/*
 * Run client-side unit tests
 */
gulp.task('karma-ci', function () {
  return gulp.src(karmaFiles)
    .pipe(karma({
      configFile: 'test/unit/karma-ci.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err;
    });
});

/*
 * Run and watch client-side unit tests
 */
gulp.task('karma-watch', function () {
  gulp.src(karmaFiles)
    .pipe(karma({
      configFile: 'test/unit/karma-ci.conf.js',
      action: 'watch'
    }));
});

gulp.task('dev', ['sass', 'devServer', 'watch']);
