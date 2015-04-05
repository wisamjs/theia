var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('mocha-ci', function (cb) {
  return gulp.src('lib/**/*.test.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'min'
    }));
});

gulp.task('mocha-watch', function () {
  gulp.watch('lib/**/*.js', ['mocha-ci']);
});

gulp.task('default',['mocha-watch']);
gulp.task('test',['mocha-ci']);