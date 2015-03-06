module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'app/js/**/*.js', 'app/test/**/*.js','!app/test/specs.js'],
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
      specs: {
    		src: ["app/test/**/*.test.js"],
    		dest: "test/specs.js",
    		options: {
    			browserifyOptions: {
    				debug: true
    			   }
           }
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
    jasmine: {
    	tests: {
    		src: [],
    		options: {
    			outfile: "test/_SpecRunner.html",
    			//keepRunner: true,
    			specs: "test/specs.js"
    		}
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
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.registerTask('default', ['jshint', /*'browserify:specs','jasmine',*/ 'browserify:dev', 'copy:dev', 'browserSync', 'watch']);
  grunt.registerTask('prod', ['jshint', /*'browserify:specs','jasmine',*/ 'browserify:prod', 'copy:prod']);
  grunt.registerTask('test',['jshint','browserify:specs','jasmine']);
};
