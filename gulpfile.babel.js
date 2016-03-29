import babelify from 'babelify';
import browserify from 'browserify';
import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import livereload from 'gulp-livereload';
import minifycss from 'gulp-minify-css';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import gutil from 'gulp-util';
import assign from 'lodash.assign';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import watchify from 'watchify';

const dirs = {
  src: 'app',
  dest: 'public',
};

const files = {
  jsMain: 'application.jsx',
};

const paths = {
  appDest: `${dirs.dest}/`,
  sassSrc: `${dirs.src}/**/*.scss`,
  jsEntryPoints: [
    `${dirs.src}/${files.jsMain}`,
  ],
};

function logger(pluginName) {
  return (data) => {
    gutil.log(`${pluginName}:`, data.toString());
  };
}

/**
 * Styles
 */
gulp.task('styles',
  () => gulp.src(paths.sassSrc)
  .pipe(sourcemaps.init())
  .pipe(sass.sync().on('error', sass.logError))
  .pipe(autoprefixer('last 2 version'))
  .pipe(concat('application.css'))
  .pipe(gulp.dest(paths.appDest))
  .pipe(livereload())
  .pipe(rename({
    suffix: '.min',
  }))
  .pipe(minifycss())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.appDest))
  .pipe(
    notify({
      message: 'Styles task complete',
      onLast: true,
    })
  )
);

gulp.task('clean:styles', () => del(`${paths.appDest}/*.{css,css.map}`));

/**
 * Scripts
 */

function handleBundle(bundle) {
  return bundle
    .on('error', logger(gutil.colors.red('Watchify')))
    .pipe(source(files.jsMain))
    .pipe(rename('application.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
    }))
    .pipe(gulp.dest(paths.appDest))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.appDest))
    .pipe(notify({
      message: 'Scripts task complete',
      onLast: true,
    }))
    .pipe(livereload({
      reloadPage: '',
    }));
}

const cleanScripts = () => del(`${paths.appDest}/*.{js,js.map}`);

gulp.task('clean:scripts', cleanScripts);

/**
 * Clean
 */
gulp.task('clean', [
  'clean:styles',
  'clean:scripts',
]);

/**
 * Watch
 */

gulp.task('watch', () => {
  livereload.listen();

  gulp.watch(paths.sassSrc, ['clean:styles', 'styles']);

  const watcher = watchify(
    browserify(assign({}, watchify.args, {
      entries: paths.jsEntryPoints,
      insertGlobals: true,
      extensions: ['.jsx'],
      debug: true,
    }))
    .transform(babelify, {
      presets: ['es2015', 'react'],
    }), {
      poll: true,
    }
  );

  watcher
    .on('update', () => {
      cleanScripts();
      return handleBundle(watcher.bundle());
    })
    .on('log', logger(gutil.colors.cyan('Watchify')));

  handleBundle(watcher.bundle());
});

/**
 * Default
 */
gulp.task('default', ['clean', 'styles', 'watch']);
