'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const runSequence = require('run-sequence')
const del = require('del')
const browserSync = require('browser-sync')
const reload = browserSync.reload
require('dotenv').config()

const paths = {
  assets: 'src/assets/',
  govukModules: 'govuk_modules/',
  nodeModules: 'node_modules/',
  public: 'public/',
  src: 'src/',
  views: 'src/views/'
}

gulp.task('clean', () => {
  return del([paths.public, paths.govukModules])
})

gulp.task('copy-govuk-toolkit', () => {
  return gulp.src([paths.nodeModules + 'govuk_frontend_toolkit/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_frontend_toolkit/'))
})

gulp.task('copy-govuk-template', () => {
  return gulp.src([paths.nodeModules + 'govuk_template_jinja/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_template_jinja/'))
})

gulp.task('copy-govuk-elements-sass', () => {
  return gulp.src([paths.nodeModules + 'govuk-elements-sass/public/sass/**'])
    .pipe(gulp.dest(paths.govukModules + '/govuk-elements-sass/'))
})

// Copy the GOV.UK toolkit into a ./govuk_modules directory
gulp.task('copy-govuk-files', [], (done) => {
  runSequence(
    'copy-govuk-toolkit',
    'copy-govuk-template',
    'copy-govuk-elements-sass',
    done)
})

gulp.task('copy-template-assets', () => {
  gulp.src(paths.govukModules + '/govuk_template_jinja/assets/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public))
})

// Install the govuk (jinja) template files into the public folder of the application
gulp.task('install-govuk-files', [], (done) => {
  runSequence(
    'copy-template-assets',
    done)
})

// Build the sass
gulp.task('sass', () => {
  return gulp.src(paths.assets + 'sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        paths.govukModules + 'govuk_frontend_toolkit/stylesheets',
        paths.govukModules + 'govuk_template_jinja/assets/stylesheets',
        paths.govukModules + 'govuk-elements-sass/'
      ]
    }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(paths.public + 'stylesheets/'))
    .pipe(reload({
      stream: true
    }))
})

// Build task
gulp.task('build', ['clean'], (done) => {
  runSequence(
    'copy-govuk-files',
    'install-govuk-files',
    'sass',
    done)
})

// The default Gulp task builds the resources
gulp.task('default', ['build'])
