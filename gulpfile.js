var gulp = require('gulp'),
    gutil = require('gulp-util'),
    wrap = require("gulp-wrap"),
    concat = require('gulp-concat'),
    closureCompiler = require('gulp-closure-compiler');


gulp.task('default', function(){
  gulp.src(['./src/physics.js', './src/cssparser.js', './src/pbpl.js'])
      .pipe(closureCompiler({compilation_level: "SIMPLE_OPTIMIZATIONS",}))
      .pipe(concat("./pbpl.min.js"))
      .pipe(wrap('(function(document){\n<%= contents %>}(document));'))
      .pipe(gulp.dest('./'));
});