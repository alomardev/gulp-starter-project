    var gulp = require('gulp'),
      gulpif = require('gulp-if'),
   gulpmatch = require('gulp-match'),
     plumber = require('gulp-plumber'),
        sass = require('gulp-sass'),
 fileinclude = require('gulp-file-include'),
autoprefixer = require('gulp-autoprefixer'),
     htmlmin = require('gulp-htmlmin'),
     cssnano = require('gulp-cssnano'),
      uglify = require('gulp-uglify'),
     connect = require('gulp-connect'),
    delempty = require('delete-empty'),
         del = require('del');

var dir = {
	app: 'app',
	prod: 'build/production',
	dev: 'build/development'
};

/* Scripts */
gulp.task('scripts', ['clean:scripts'], function() {
	return gulp.src(dir.app + '/res/scripts/*.js')
	.pipe(plumber())
	.pipe(gulp.dest(dir.dev + '/res'))
	.pipe(connect.reload());
});

/* Styles */
gulp.task('styles', ['clean:styles'], function() {
	return gulp.src(dir.app + '/res/styles/main.{scss,sass}')
	.pipe(plumber())
	.pipe(sass())
	.pipe(autoprefixer())
	.pipe(gulp.dest(dir.dev + '/res'))
	.pipe(connect.reload());
});

/* HTMLs */
gulp.task('htmls', ['clean:htmls'], function() {
	return gulp.src([dir.app + '/**/*.html', '!' + dir.app + '/**/_*.html'])
	.pipe(plumber())
	.pipe(fileinclude(/* Default: {prefix: '@@', path: '@file'} */))
	.pipe(gulp.dest(dir.dev))
	.pipe(connect.reload());
});

/* Copy images */
gulp.task('copy:images', ['clean:images'], function() {
	return gulp.src(dir.app + '/res/images/*.{png,gif,jpg,jpeg}')
	.pipe(gulp.dest(dir.dev + '/res/'));
});

/* Copy raw files */
gulp.task('copy:raw', ['clean:raw'], function() {
	return gulp.src(dir.app + '/raw/**/*')
	.pipe(gulp.dest(dir.dev + '/raw'));
});

/* Server setup */
gulp.task('connect', function() {
	connect.server({
		root: './' + dir.dev + '/',
		livereload: true
	});
});

/* Clean */
gulp.task('clean:scripts', function() {
	del.sync(dir.dev + '/res/*.js');
});

gulp.task('clean:styles', function() {
	del.sync(dir.dev + '/res/main.min.css');
});

gulp.task('clean:htmls', ['clean:empty'], function() {
	del.sync(dir.dev + '/**/*.html');
});

gulp.task('clean:images', function() {
	del.sync(dir.dev + '/res/images/*.{png,gif,jpg,jpeg}');
});

gulp.task('clean:raw', function() {
	del.sync(dir.dev + '/raw');
});

gulp.task('clean:empty', function() {
	delempty.sync(dir.dev + '/');
});

gulp.task('clean', function() {
	del.sync(dir.dev);
	del.sync(dir.prod);
});

/* Build */
gulp.task('build', ['scripts', 'styles', 'htmls', 'copy:images', 'copy:raw']);
gulp.task('build:dev', ['build']);
gulp.task('build:prod', ['build'], function() {
	del.sync(dir.prod);

	var condjs = function(file) {
		return gulpmatch(file, '*.js');
	};
	var condcss = function(file) {
		return gulpmatch(file, '*.css');
	};
	var condhtml = function(file) {
		return gulpmatch(file, '*.html');
	};

	gulp.src(dir.dev + '/**/*')
	.pipe(plumber())
	.pipe(gulpif(condcss, cssnano()))
	.pipe(gulpif(condjs, uglify()))
	.pipe(gulpif(condhtml, htmlmin({collapseWhitespace: true})))
	.pipe(gulp.dest(dir.prod));

});

/* Watch */
gulp.task('watch', ['build'], function() {
	gulp.watch(dir.app + '/res/scripts/*.js', ['scripts']);
	gulp.watch(dir.app + '/res/styles/*.{scss,sass}', ['styles']);
	gulp.watch(dir.app + '/**/*.html', ['htmls']);
	gulp.watch(dir.app + '/res/images/*.{png,gif,jpg,jpeg}', ['copy:images']);
	gulp.watch(dir.app + '/raw/**/*', ['copy:raw']);
});

/* Default */
gulp.task('default', ['watch', 'connect']);