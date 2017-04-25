'use strict';

const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const strip = require('gulp-strip-comments');
const styleguide = require('gulp-styleguide');
const browserSync = require('browser-sync').create();

const dist = path.join(__dirname, 'dist/**/*.s+(a|c)ss')

const options = {
    site: {
        title: 'Test Pattern Library'
    },
    src: {
      css: [dist, '!./dist/bower_components/*']
    },
    dest: {
      html: 'styleguide'
    }
};


gulp.task('templates', styleguide.templates(options));
gulp.task('build', ['templates'], styleguide.build(options));

gulp.task('lint', function () {
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

gulp.task('sass', ['lint'], function () {
  return gulp.src(dist)
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
  });

gulp.task('serve', function () {
  browserSync.init({
        server: {
          baseDir: "./styleguide"
        }
    });

    gulp.watch(dist, {interval:2000}, ['sass', 'build']);
    gulp.watch("./styleguide/*.html").on('change', browserSync.reload);
  })

gulp.task('default', ['serve']);
