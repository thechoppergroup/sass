const autoprefixer = require('autoprefixer');
const extract = require('gulp-html-extract');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const gulp = require('gulp');
const less = require('gulp-less');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');

var Styles = function () {
  // Plugins
  this.plugins = [autoprefixer({browsers: ['last 2 version', 'ie 10'], remove: false})];

  // Config File
  this.sassLintConfig = path.join(__dirname, '../.sass-lint.yml');

  // Patterns
  this.hbsPattern = '/**/*.hbs';
  this.sassPattern = '/**/*.scss';
  this.lessPattern = '/**/[^_]*.less';

  // Directories
  this.templateDir = path.join(__dirname, '../web/src/main/resources/templates/web');
  this.staticDir = path.join(__dirname, '../web/src/main/resources/static');
  this.sassDir = path.join(__dirname, '../web/src/main/resources/creative/scss');
  this.lessDir = path.join(__dirname, '../web/src/main/resources/static/themes')

  // Paths
  this.hbsFiles = path.join(this.templateDir, this.hbsPattern);
  this.allLessFiles = path.join(this.lessDir, '**/*.less');
  this.allSassFiles = path.join(this.sassDir, this.sassPattern);
  this.criticalSassFiles = this.sassDir + '/base.scss'
  this.mainSassFiles = this.sassDir + '/theme.scss';
  this.themesLessFiles = this.lessDir + this.lessPattern;
};


Styles.prototype.hbsStyles = function () {
  return gulp.src(this.hbsFiles)
    .pipe(plumber())
    .pipe(extract({
      sel: '.scss',
      strip: true
    }))
    .pipe(rename(function(path){
      path.extname = ".scss"
    }))
    .pipe(sassLint({
      configFile: this.sassLintConfig
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: this.sassDir
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss(this.plugins))
    .pipe(sass().on('error', sass.logError))
}

Styles.prototype.hbsStylesInline = function () {
  return gulp.src(this.hbsFiles)
    .pipe(plumber())
    .pipe(extract({
      sel: '.scss-inline',
      strip: true
    }))
    .pipe(rename(function(path){
      path.dirname = '/';
      path.extname = ".scss";
    }))
    .pipe(sassLint({
      configFile: this.sassLintConfig
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: this.sassDir
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss(this.plugins))
    .pipe(sass().on('error', sass.logError))
}

Styles.prototype.buildCritical = function () {
  return gulp.src(this.criticalSassFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: this.sassDir
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss(this.plugins))
}

Styles.prototype.buildMain = function () {
  return gulp.src(this.mainSassFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: this.sassDir
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss(this.plugins))
}

Styles.prototype.mergeStyles = function () {
  return merge(this.buildMain(), this.hbsStyles())
    .pipe(concat('theme.css'))
}

Styles.prototype.buildTheme = function (themeName) {
  var themeName = themeName || 'gotham';
  return gulp.src(path.join(this.lessDir, themeName, this.lessPattern))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(postcss(this.plugins))
}


module.exports = new Styles()
