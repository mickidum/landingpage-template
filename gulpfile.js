var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		// del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		notify         = require("gulp-notify");
		rimraf         = require("rimraf");

// scripts

var sassPaths = [
  'app/libs/normalize.scss/sass',
  'app/libs/foundation-sites/scss',
  'app/libs/motion-ui/src'
];

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('js',  function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/what-input/dist/what-input.min.js',
		'app/libs/foundation-sites/dist/js/foundation.min.js',
		'app/libs/sweetalert2/dist/sweetalert2.min.js',
		// 'app/js/common.min.js', 
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('code', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.scss')
	.pipe(sass({
		includePaths: sassPaths,
		outputStyle: 'expand'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS()) // Опционально, закомментировать при отладке
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function() {
	gulp.watch('app/scss/**/*.scss', gulp.parallel('sass'));
	gulp.watch('libs/**/*.js', gulp.parallel('js'));
	gulp.watch('app/js/common.js', gulp.parallel('common-js'));
	gulp.watch('app/*.html', gulp.parallel('code'))
});
	

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

// gulp.task('removedist', function(cb) { del.sync('dist');cb(); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', gulp.parallel('watch', 'browser-sync'));

function files(cb) {
	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		],{allowEmpty: true}).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/app.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		'app/js/common.min.js',
		'app/js/common.js',
		]).pipe(gulp.dest('dist/js'));

	var buildApi = gulp.src([
		'app/api/**/*'
		]).pipe(gulp.dest('dist/api'));
	cb();
}

function remDist(cb) {
	rimraf('dist', cb);
}


exports.build = gulp.series(remDist, gulp.parallel(gulp.task('imagemin'), gulp.task('sass'), gulp.task('js')), files);
