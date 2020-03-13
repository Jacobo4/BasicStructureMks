const gulp = require('gulp');
const sass = require('gulp-sass'); // To transpile sass to css
const pug = require('gulp-pug'); // To transpile jade/pug to html
const sourcemaps = require('gulp-sourcemaps'); // To add "maps" when u are inspecting an elemen (sass,js,.min, etc...)

const postcss = require('gulp-postcss'); // To add css suport to diferent browsers and their respective versions
const autoprefixer = require('autoprefixer');
const mq4HoverShim = require('mq4-hover-shim');
const cssnano = require('cssnano');

const rimraf = require('rimraf').sync; // To delete dist folder before build

const browser = require('browser-sync'); // To make a localhost
const port = process.env.SERVER_PORT || 8080;

const concat = require('gulp-concat'); //To minify files

const babel = require("gulp-babel"); //To add js support to diferent browsers and ther respective versions


/*
 * Directories here
 */
const paths = {
  dist: 'dist/',
  src: './src/',
  sass: './src/styles/',
  node: './node_modules/'
};

// Starts a BrowerSync instance
gulp.task('server', () => {
  browser.init({
    server: paths.dist
  });
});

// Watch files for changes
gulp.task('watch', () => {
  // gulp.watch(paths.sass +'**/*', ['transpile-scss', browser.reload]);
  gulp.watch(paths.src + 'assets/js/**/*', gulp.series('compile-js'));
  gulp.watch(paths.src + 'assets/fonts/**/*', gulp.series('copy-fonts'));
  gulp.watch(paths.src + 'assets/css/**/*', gulp.series('copy-css'));
  gulp.watch(paths.src + 'assets/images/**/*', gulp.series('copy-images'));
  gulp.watch(paths.src + 'assets/vendors/**/*', gulp.series('copy-vendors'));
  gulp.watch(paths.sass + '**/*', gulp.series('transpile-sass'));
  gulp.watch(paths.src + 'markup/**/*', gulp.series('transpile-pug'));
});

// Erases the dist folder
gulp.task('reset', () => {
  rimraf(paths.dist + '*');
  return Promise.resolve('the value is ignored');
});

//Theme Sass constiables
const sassOptions = {
  errLogToConsole: true,
  outputStyle: 'compressed'
};

// transpile Theme Sass
gulp.task('transpile-sass', function() {
  const processors = [
    mq4HoverShim.postprocessorFor({
      hoverSelectorPrefix: '.is-true-hover '
    }),
    autoprefixer(),
    cssnano()
  ];
  //Watch me get Sassy

  return gulp.src(paths.sass + '*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dist + 'assets/css/'))
    .on('finish', browser.reload);
});

/**
 * transpile .pug files and pass in data from json file
 */

gulp.task('transpile-pug', () => {
  return gulp.src(paths.src + 'markup/pages/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.dist))
    .on('finish', browser.reload);
});




//Copy Theme css to production site
gulp.task('copy-css', () => {
  return gulp.src(paths.src + 'assets/css/**/*.css')
    .pipe(gulp.dest(paths.dist + 'assets/css/'))
    .on('finish', browser.reload);
});

//Copy Theme fonts to production site
gulp.task('copy-fonts', () => {
  return gulp.src(paths.src + 'assets/fonts/*')
    .pipe(gulp.dest(paths.dist + 'assets/fonts/'))
    .on('finish', browser.reload);
});

//Copy Theme js to production site
gulp.task('compile-js', () => {
  return gulp.src(paths.src + 'assets/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dist + 'assets/js/'))
    .on('finish', browser.reload);
});

// transpile js from node modules
gulp.task('copy-vendors', () => {
  return gulp.src([
      paths.src + 'assets/vendors/**/*'
    ])
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(paths.dist + 'assets/js/'))
    .on('finish', browser.reload);
});

//Copy files to production site
gulp.task('copy-files', () => {
  return gulp.src(paths.src + 'assets/files/**/*')

    .pipe(gulp.dest(paths.dist + 'assets/files/'))
    .on('finish', browser.reload);
});


//Copy images to production site
gulp.task('copy-images', () => {
  return gulp.src(paths.src + 'assets/images/**/*')
    .pipe(gulp.dest(paths.dist + 'assets/images/'))
    .on('finish', browser.reload);
});

gulp.task('build', gulp.parallel('copy-images', 'copy-files', 'copy-css', 'compile-js', 'copy-fonts', 'copy-vendors', 'transpile-sass', 'transpile-pug'),
  () => {
    done()
  });
gulp.task(':)', gulp.series('reset', 'build', gulp.parallel('server', 'watch'),
  () => {
    done()
  }));
