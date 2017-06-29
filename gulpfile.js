'use strict'

const browserify = require('browserify');
const browserSync = require('browser-sync').create()
const buffer = require('vinyl-buffer')
const debug = require('gulp-debug')
const insert = require('gulp-insert');
const livingcss = require('gulp-livingcss')
const gulp = require('gulp')
const gulpCopy = require('gulp-copy');
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const jshint = require('gulp-jshint')
const merge = require('merge-stream')
const path = require('path')
const plumber = require('gulp-plumber')
const rename = require("gulp-rename")
const sass = require('gulp-sass')
const sassLint = require('gulp-sass-lint')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const strip = require('gulp-strip-comments')
const uglify = require('gulp-uglify')

const styles = require('../gulp/styleguide');

// Directory Paths
const paths = {}
paths.src = path.join(__dirname, 'src')
paths.sgTheme = path.join(__dirname, 'theme')
paths.dist = path.join(__dirname, 'dist')
paths.styleguide = path.join(__dirname, 'styleguide')
paths.template = path.join(__dirname, 'template')
paths.bower = path.join(__dirname, 'bower_components')

paths.assets = path.join(paths.template, 'assets')
paths.ionicons = path.join(paths.template, 'ionicons')
paths.js = path.join(paths.template, 'js')
paths.jsDest = path.join(paths.styleguide, 'js')
paths.partials = path.join(paths.template, 'partials')

// File Patterns
const patterns = {}
patterns.scss = '**/*.s+(a|c)ss'
patterns.hbs = '**/*.hbs'
patterns.mainjs = 'main.js'

// File References
const files = {}
files.hbs = path.join(paths.template, patterns.hbs)
files.js = path.join(paths.js, patterns.mainjs)
files.sgTheme = path.join(paths.sgTheme, patterns.scss)
files.scss = path.join(paths.src, patterns.scss)
files.sassIgnore = path.join(paths.bower, patterns.scss)
files.templatePartials = path.join(paths.partials, patterns.hbs)
files.assets = path.join(paths.assets, '**/*')
files.ionicons = path.join(paths.ionicons, '**/*')

gulp.task('livingcss', function () {
  gulp.src([files.scss, '!' + files.sassIgnore])
    .pipe(livingcss(paths.styleguide, {
        loadcss: true,
        preprocess: function(context, template, Handlebars) {
            context.pages = ['Styleguide', 'Iconography', 'Brand Styleguide'];
            context.title = 'Scoutahead Styleguide v1';
            var d = new Date();
            var m = d.getMonth();
            var y = d.getFullYear();
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            context.footerHTML = 'Generated in ' + months[m] + ' of ' + y;
            context.globalStylesheets = ['assets/base.css', 'https://d2uooyvgxir3xs.cloudfront.net/20170531T151447214Z/css/theme.css', 'assets/theme.css', 'assets/prism.css', 'http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css'];

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

            Handlebars.registerHelper('toRGB', function(hex) {

                function hexToRgb(hex) {
                    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                        return r + r + g + g + b + b;
                    });

                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                }

                function rgb(value) {
                  var merged = '(' + hexToRgb(value).r + ', ' + hexToRgb(value).g + ', ' + hexToRgb(value).b + ')';
                  return merged;
                }
                return rgb(hex);
            })

            // Handlebars.registerHelper('copyToClipboard', function(content) {
            //     function copyToClipboard(element) {
            //       var $temp = $("<input>");
            //       $("body").append($temp);
            //       $temp.val($(element).text()).select();
            //       document.execCommand("copy");
            //       $temp.remove();
            //     }
            // })

            return livingcss.utils.readFileGlobs(files.templatePartials, function (data, file) {
                var partialName = path.basename(file, path.extname(file))
                Handlebars.registerPartial(partialName, data)
            })

        },
        template: 'template/styleguide.hbs'
    }))
    .pipe(gulp.dest(paths.styleguide))
  })

gulp.task('js:lint', function () {
  return gulp
    .src(files.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
})

gulp.task('javascript', function () {
  var b = browserify({
    entries: files.js,
    debug: true
  })

  return b.bundle()
    .on('error', function (err) {
      console.log(err.toString());
      this.emit("end");
    })
    .pipe(source(patterns.mainjs))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.jsDest))
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
    .pipe(gulp.dest(paths.sgTheme))
});

gulp.task('cp:ionicons', function () {
  return gulp
    .src(files.ionicons)
    .pipe(gulp.dest(paths.styleguide + '/ionicons'))
})

gulp.task('cp:assets', function () {
  return gulp
    .src(files.assets)
    .pipe(gulp.dest(paths.styleguide + '/assets'))
})

gulp.task('sass', function () {
  return gulp
    .src(files.scss)
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


gulp.task('serve', ['sass', 'theme', 'livingcss', 'js:lint', 'javascript', 'cp:assets', 'cp:ionicons'], function () {
  browserSync.init({
        server: {
          baseDir: "./styleguide"
        }
    })

    gulp.watch(files.scss, {interval:2000}, ['sass', 'livingcss'])
    gulp.watch(files.sgTheme, {interval:2000}, ['theme'])
    gulp.watch(files.hbs, {interval: 2000}, ['livingcss'])
    gulp.watch(files.js, {interval: 2000}, ['js:lint', 'javascript'])
    gulp.watch("./styleguide/*.html").on('change', browserSync.reload)
    gulp.watch("./styleguide/assets/*.css").on('change', browserSync.reload)
  })

gulp.task('default', ['serve'])
