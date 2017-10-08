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
     connect = require('gulp-connect-php'),

    delempty = require('delete-empty'),
         del = require('del'),
        exec = require('child_process').exec,

       iswin = /^win/.test(process.platform),
       ismac = /^darwin/.test(process.platform);

var config = {
	port: 8080,
	dir: {
		app: 'app',
		prod: 'build/production',
		dev: 'build/development'
	},
	php: {
		bin: iswin ? 'C:\\php\\php.exe' : '/usr/bin/php',
		ini: iswin ? 'C:\\php\\php.ini' : '/etc/php.ini'
	}
};

function runCommand(command, input) {
  ls = exec(command, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err !== null) console.log(err);
  });

  ls.stdin.write(input);
}

/* Scripts */
gulp.task('scripts', ['clean:scripts'], function() {
	return gulp.src(config.dir.app + '/res/scripts/*.js')
	.pipe(plumber())
	.pipe(gulp.dest(config.dir.dev + '/res'));
});

/* Styles */
gulp.task('styles', ['clean:styles'], function() {
	return gulp.src(config.dir.app + '/res/styles/main.{scss,sass}')
	.pipe(plumber())
	.pipe(sass())
	.pipe(autoprefixer('last 10 versions'))
	.pipe(gulp.dest(config.dir.dev + '/res'));
});

/* Markup */
gulp.task('markup', ['clean:markup'], function() {
	return gulp.src([config.dir.app + '/**/*.{html,php}', '!' + config.dir.app + '/**/_*.{html,php}'])
	.pipe(plumber())
	.pipe(fileinclude())
	.pipe(gulp.dest(config.dir.dev));
});

/* Copy images */
gulp.task('copy:images', ['clean:images'], function() {
	return gulp.src(config.dir.app + '/res/images/*.{png,gif,jpg,jpeg,svg,ico}')
	.pipe(gulp.dest(config.dir.dev + '/res/'));
});

/* Copy raw files */
gulp.task('copy:raw', ['clean:raw'], function() {
	return gulp.src(config.dir.app + '/raw/**/*')
	.pipe(gulp.dest(config.dir.dev + '/raw'));
});

gulp.task('copy:css', ['clean:css'], function() {
	return gulp.src(config.dir.app + '/res/styles/*.css')
	.pipe(gulp.dest(config.dir.dev + '/res'));
});

/* Clean */
gulp.task('clean:scripts', function() {
	del.sync(config.dir.dev + '/res/*.js');
});

gulp.task('clean:styles', function() {
	del.sync(config.dir.dev + '/res/*.css');
});

gulp.task('clean:markup', ['clean:empty'], function() {
	del.sync(config.dir.dev + '/**/*.{html,php}');
});

gulp.task('clean:images', function() {
	del.sync(config.dir.dev + '/res/images/*.{png,gif,jpg,jpeg,svg,ico}');
});

gulp.task('clean:raw', function() {
	del.sync(config.dir.dev + '/raw');
});

gulp.task('clean:css', function() {
	del.sync(config.dir.dev + '/res/*.css');
});

gulp.task('clean:empty', function() {
	delempty.sync(config.dir.dev + '/');
});

gulp.task('clean', function() {
	del.sync(config.dir.dev);
	del.sync(config.dir.prod);
});

/* Build */
gulp.task('build', ['scripts', 'styles', 'markup', 'copy:images', 'copy:raw', 'copy:css']);
gulp.task('build:dev', ['build']);
gulp.task('build:prod', ['build'], function() {
	del.sync(config.dir.prod);

	var condjs = function(file) {
		return gulpmatch(file, '*.js');
	};
	var condcss = function(file) {
		return gulpmatch(file, '*.css');
	};
	var condhtml = function(file) {
		return gulpmatch(file, '*.html');
	};

	gulp.src(config.dir.dev + '/**/*')
	.pipe(plumber())
	.pipe(gulpif(condcss, cssnano()))
	.pipe(gulpif(condjs, uglify()))
	//.pipe(gulpif(condhtml, htmlmin({collapseWhitespace: true})))
	.pipe(gulp.dest(config.dir.prod));
	gulp.src(config.dir.app + '/**/.htaccess').pipe(gulp.dest(config.dir.prod));

});

/* Watch */
gulp.task('watch', ['build'], function() {
	gulp.watch(config.dir.app + '/res/scripts/*.js', ['scripts']);
	gulp.watch(config.dir.app + '/res/styles/*.{scss,sass}', ['styles']);
	gulp.watch(config.dir.app + '/**/*.{html,php}', ['markup']);
	gulp.watch(config.dir.app + '/res/images/*.{png,gif,jpg,jpeg,svg,ico}', ['copy:images']);
	
	gulp.watch(config.dir.app + '/raw/**/*', ['copy:raw']);
	gulp.watch(config.dir.app + '/plugins/**/*', ['copy:plugins']);
});

/* Server */
var server = new connect();
gulp.task('server:start', function() {
	server.server({
		base: config.dir.dev,
		bin: config.php.bin,
		ini: config.php.ini,
		port: config.port
	});
});

gulp.task('server:stop', function() {
	server.closeServer();
});

/* Default */
gulp.task('default', ['watch', 'server:start']);
