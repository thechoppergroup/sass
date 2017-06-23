'use strict'

const browserSync = require('browser-sync').create()
const livingcss = require('gulp-livingcss')
const gulp = require('gulp')
const debug = require('gulp-debug')
const merge = require('merge-stream')
const path = require('path')
const rename = require("gulp-rename")
const sass = require('gulp-sass')
const sassLint = require('gulp-sass-lint')
const sourcemaps = require('gulp-sourcemaps')
const strip = require('gulp-strip-comments')
const styleguide = require('gulp-styleguide')
const gulpif = require('gulp-if')
const insert = require('gulp-insert');

const paths = {}
paths.src = path.join(__dirname, 'scss')
paths.sgTheme = path.join(__dirname, 'theme')
paths.dist = path.join(__dirname, 'dist')
paths.styleguide = path.join(__dirname, 'styleguide')
paths.template = path.join(__dirname, 'template')
paths.bower = path.join(__dirname, 'bower_components')
paths.partials = path.join(paths.template, 'partials')
paths.styleguideAssets = path.join(paths.styleguide, 'assets')
paths.theme = path.join(__dirname, 'theme')

const patterns = {}
patterns.scss = '**/*.s+(a|c)ss'
patterns.hbs = '**/*.hbs'
patterns.sassIgnore = path.join(paths.src, 'bower_components/**/*..s+(a|c)ss')

const files = {}
files.hbs = path.join(paths.template, patterns.hbs)
files.sgTheme = path.join(paths.sgTheme, patterns.scss)
files.scss = path.join(paths.src, patterns.scss)
files.sassIgnore = path.join(paths.bower, patterns.scss)
files.templatePartials = path.join(paths.partials, patterns.hbs)
files.themeSass = path.join(paths.theme, 'theme.scss')

gulp.task('livingcss', function () {
  gulp.src([files.scss, '!' + files.sassIgnore])
    .pipe(livingcss(paths.styleguide, {
        loadcss: true,
        preprocess: function(context, template, Handlebars) {
            context.pages = ['Styleguide', 'Iconography', 'Brand Styleguide'];
            context.title = 'Scoutahead Styleguide v1';
            context.footerHTML = 'Generated in June of 2017';
            context.globalStylesheets = ['assets/base.css', 'https://d2uooyvgxir3xs.cloudfront.net/20170531T151447214Z/css/theme.css', 'assets/theme.css', 'assets/prism.css', 'http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css'];
            context.scripts = ['assets/prism.js', 'https://code.jquery.com/jquery-3.2.1.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.1/jquery.waypoints.min.js'];

            Handlebars.registerHelper("debug", function(optionalValue) {
              console.log("Current Context");
              console.log("====================");
              console.log(this);

              if (optionalValue) {
                console.log("Value");
                console.log("====================");
                console.log(optionalValue);
              }
            });

            Handlebars.registerHelper('toArray', function(context) {
                if  (Array.isArray(context)) {
                    return context
                } else {
                    var ar = []
                    ar.push(context)
                    return ar
                }
            })

            return livingcss.utils.readFileGlobs(files.templatePartials, function (data, file) {
                var partialName = path.basename(file, path.extname(file))
                Handlebars.registerPartial(partialName, data)
            })

        },
        template: 'template/styleguide.hbs'
    }))
    .pipe(gulp.dest(paths.styleguide))
  })

gulp.task('test', () => {
    console.log(files.templatePartials)
    return gulp
        .src([files.scss, '!' + files.sassIgnore])
        .pipe(debug())
        .pipe(livingcss(paths.styleguide, {
            preprocess: function(context, template, Handlebars) {
                return livingcss.utils.readFileGlobs(files.templatePartials, function (data, file) {
                    var partialName = path.basename(file, path.extname(file))
                    console.log(partialName)
                    Handlebars.registerPartial(partialName, data)
                })
            }
        }))
        .pipe(debug())
        .pipe(gulp.dest(paths.styleguide))
})

gulp.task('theme', function() {
  return gulp.src('theme/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.styleguideAssets))
});

gulp.task('sass', function () {
  console.log(patterns.sassIgnore)
  return gulp
    .src(files.scss)
    .pipe(sassLint({
      configFile: '.sass-lint.yml',
      files: {
        ignore: 'src/bower_components/**/*.s+(a|c)ss'
      }
    }))
    // .pipe(sassLint.format())
    // .pipe(sassLint.failOnError())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.dist))
  })


gulp.task('serve', ['sass', 'theme', 'livingcss'], function () {
  browserSync.init({
        server: {
          baseDir: "./styleguide"
        }
    })

    gulp.watch(files.scss, {interval:2000}, ['sass', 'livingcss'])
    gulp.watch(files.sgTheme, {interval:2000}, ['theme'])
    gulp.watch(files.hbs, {interval: 2000}, ['livingcss'])
    gulp.watch("./styleguide/*.html").on('change', browserSync.reload)
    gulp.watch("./styleguide/assets/*.css").on('change', browserSync.reload)
  })

gulp.task('default', ['serve'])
