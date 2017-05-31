'use strict'

const browserSync = require('browser-sync').create()
const livingcss = require('gulp-livingcss')
const gulp = require('gulp')
const merge = require('merge-stream')
const path = require('path')
const rename = require("gulp-rename")
const sass = require('gulp-sass')
const sassLint = require('gulp-sass-lint')
const sourcemaps = require('gulp-sourcemaps')
const strip = require('gulp-strip-comments')
const styleguide = require('gulp-styleguide')
const gulpif = require('gulp-if')

const paths = {}

paths.src = path.join(__dirname, 'src')
paths.dist = path.join(__dirname, 'dist')
paths.styleguide = path.join(__dirname, 'styleguide')
paths.sass = path.join(paths.src, '**/*.s+(a|c)ss')
paths.sassIgnore = path.join(paths.src, 'bower_components/**/*..s+(a|c)ss')

gulp.task('livingcss', function () {
  gulp.src([paths.sass, '!' + paths.sassIgnore])
    .pipe(livingcss())
    .pipe(gulp.dest('styleguide'))
  })


gulp.task('sass', function () {
  console.log(paths.sassIgnore)
  return gulp
    .src(paths.sass)
    .pipe(sassLint({
      configFile: '.sass-lint.yml',
      files: {
        ignore: 'src/bower_components/**/*.s+(a|c)ss'
      }
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.dist))
  })


gulp.task('serve', ['sass', 'livingcss'], function () {
  browserSync.init({
        server: {
          baseDir: "./styleguide"
        }
    })

    gulp.watch(paths.sass, {interval:2000}, ['sass', 'livingcss'])
    gulp.watch("./styleguide/*.html").on('change', browserSync.reload)
  })

gulp.task('default', ['serve'])
