'use strict';

const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');

const dist = path.join(__dirname, 'dist/**/*.s+(a|c)ss')

gulp.task('lint', function () {
  console.log(dist)
  return gulp.src(dist)
    .pipe(sassLint({
      configFile: '.sass-lint.yml',
      files: {
        ignore: 'dist/bower_components/**/*.s+(a|c)ss' // This will still be respected and read
      }
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
  })

gulp.task('default', ['lint'], function () {
  gulp.watch(dist, {interval:2000}, ['lint']);
});
