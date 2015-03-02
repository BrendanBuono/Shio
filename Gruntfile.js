module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'app/js/**/*.js', 'app/test/**/*.js'],
      options: {
        globals: {
          jQuery: false
        }
      }
    },
    'browserify': {
      dev: {
        options: {
          browserifyOptions: {
            debug : true
          }
        },
        src: ['app/js/main.js'],
        dest: './debug/app/js/bundle.js'
      },
      prod: {
        options: {
          debug: false
        },
        src: '<%= browserify.dev.src %>',
        dest: './prod/js/bundle.js'
      }
    },
    copy: {
      dev: {
        src: 'app/index.html',
        dest: 'debug/',
      },
      prod: {
        src: 'app/index.html',
        dest: 'prod/',
      }
    },
    browserSync: {
      dev: {
        src: ['*.html', 'js/**/*/js']

      },
      options: {
        watchTask: true,
        server: './debug/app/'
      }

    },
    watch: {
      files: ['<%= jshint.files %>', 'app/*.html'],
      tasks: ['jshint', 'browserify:dev','copy','browserSync']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['jshint', 'browserify:dev', 'copy:dev', 'browserSync', 'watch']);
  grunt.registerTask('prod', ['jshint', 'browserify:prod', 'copy:prod']);
};
