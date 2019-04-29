"use strict";
import gulp from "gulp";
import sass from "gulp-sass";
import pref from "gulp-autoprefixer";
import browserSync from "browser-sync";
import uglify from "gulp-uglifyjs";
import concat from "gulp-concat";
import nano from "gulp-cssnano";
import rename from "gulp-rename";
import cache from "gulp-cache";
import imagemin from "gulp-imagemin";
import pngquant from "imagemin-pngquant";
import del from "del";

gulp.task("sass", async () => {
  gulp
    .src("src/scss/*.scss")
    .pipe(sass())
    .on("error", function(err) {
      console.log(err.toString());

      this.emit("end");
    })
    .pipe(pref(["last 15 versions", "> 1%", "ie 8", "ie 7"], { cascade: true }))
    .pipe(nano()) // Сжимаем
    .pipe(rename({ suffix: ".min" })) // Добавляем суффикс .min
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("img", () => {
  return gulp
    .src("app/img/**/*") // Берем все изображения из app
    .pipe(
      cache(
        imagemin({
          // Сжимаем их с наилучшими настройками с учетом кеширования
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()],
        }),
      ),
    )
    .pipe(gulp.dest("dist/img")); // Выгружаем на продакшен
});

gulp.task("browser-sync", () => {
  browserSync({
    server: {
      baseDir: "src",
    },
    notify: false,
  });
});

gulp.task("libs", () => {
  return gulp
    .src(["src/libs/*.js", "src/libs/**/*.js"])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("src/js"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("scripts", () => {
  return gulp
    .src(["src/js/*.js", "src/js/**/*.js"])
    .pipe(concat("js.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("src/js"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("code", () => {
  return gulp.src("src/*.html").pipe(browserSync.reload({ stream: true }));
});

gulp.task("watch", async () => {
  gulp.watch("src/scss/*.scss", gulp.parallel("sass"));
  gulp.watch("src/*.html", gulp.parallel("code"));
  gulp.watch("src/js/*.js", gulp.parallel("scripts"));
});

gulp.task('clean', async function() {
  return del.sync('public');
});

gulp.task("prebuild", async () => {
  var buildCss = gulp
    .src([
      // Переносим библиотеки в продакшен
      "src/css/q.css",
      "src/css/q.min.css",
    ])
    .pipe(gulp.dest("public/css"));

  var buildFonts = gulp
    .src("src/fonts/**/*") // Переносим шрифты в продакшен
    .pipe(gulp.dest("public/fonts"));

  var buildJs = gulp
    .src("src/js/**/*") // Переносим скрипты в продакшен
    .pipe(gulp.dest("public/js"));

  var buildHtml = gulp
    .src("src/*.html") // Переносим HTML в продакшен
    .pipe(gulp.dest("public"));
});

gulp.task("clear", (callback) =>{
  return cache.clearAll();
});

gulp.task(
  "default",
  gulp.parallel("sass", "scripts", "libs", "browser-sync", "watch"),
);
gulp.task(
  "build",
  gulp.parallel("clean", "prebuild", "img", "sass", "scripts"),
);
