const gulp = require('gulp')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
require('dotenv').config()

const paths = {
  assets: 'src/assets/',
  govukModules: 'govuk_modules/',
  nodeModules: 'node_modules/',
  public: 'public/',
  src: 'src/',
  views: 'src/views/'
}

const clean = () => {
  return del([paths.public, paths.govukModules])
}

const copyGovukToolkit = () => {
  return gulp.src([paths.nodeModules + 'govuk_frontend_toolkit/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_frontend_toolkit/'))
}

const copyGovukTemplate = () => {
  return gulp.src([paths.nodeModules + 'govuk_template_jinja/**/*.*'])
    .pipe(gulp.dest(paths.govukModules + 'govuk_template_jinja/'))
}

const copyGovukElementsSass = () => {
  return gulp.src([paths.nodeModules + 'govuk-elements-sass/public/sass/**'])
    .pipe(gulp.dest(paths.govukModules + '/govuk-elements-sass/'))
}

const copyTemplateAssets = () => {
  return gulp.src(paths.govukModules + '/govuk_template_jinja/assets/{images/**/*.*,javascripts/**/*.*,stylesheets/**/*.*}')
    .pipe(gulp.dest(paths.public))
}

/*
 * Install the govuk (jinja) template files into the public folder of the application
 *gulp.task('install-govuk-files', gulp.series(gulp.parallel(copyGovukToolkit, copyGovukTemplate, copyGovukElementsSass), copyTemplateAssets))
 */

// Build the sass
const buildSass = () => {
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
}

// The default Gulp task builds the resources
gulp.task('default', gulp.series(
  clean,
  gulp.parallel(copyGovukToolkit, copyGovukTemplate, copyGovukElementsSass),
  copyTemplateAssets,
  buildSass
))

gulp.task('watch', gulp.series(() => {
  gulp.watch(paths.assets + 'sass/*.scss', gulp.series(buildSass))
}))
