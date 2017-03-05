module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.initConfig({
    clean: ["public/js"],
    uglify: {
      my_target: {
        options: {
          mangle: false
        },
        files: {
          'public/js/script.js': ['source_js/script.js'],
          'public/js/app.js': ['source_js/app.js'],
          'public/js/controllers.js': ['source_js/controllers.js'],
          'public/js/services.js': ['source_js/services.js'],
          'public/js/controls.js': ['source_js/controls.js'],
          'public/js/inputHandler.js': ['source_js/inputHandler.js'],
          'public/js/midiHandler.js': ['source_js/midiHandler.js'],
          'public/js/pitchClassMapping.js': ['source_js/pitchClassMapping.js'],
          'public/js/hexcolorUtil.js': ['source_js/hexcolorUtil.js'],
          'public/js/shapes.js': ['source_js/shapes.js'],
            'public/js/gameModel.js': ['source_js/gameModel.js'],
            'public/js/background.js': ['source_js/background.js']
        } //files
      } //my_target
    }, //uglify
    copy: {
      main: {
        files: [
          {
                expand : true,
                dest   : 'public/js',
                cwd    : 'js',
                src    : [
                  '**/*.js'
                ]
          }
        ] //files
      }//main
    },//copy
    compass: {
      dev: {
        options: {
          config: 'compass_config.rb'
        } //options
      } //dev
      // foundation: {
      //   options: {
      //     config: 'compass_foundation_config.rb'
      //   } //options
      // } //foundation

    }, //compass
    watch: {
      options: { livereload: true },
      scripts: {
        files: ['source_js/*.js'],
        tasks: ['clean','uglify'],
        //tasks: ['copy']
      }, //script
      html: {
        files: ['public/*.html']
      }
    }, //watch
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'app.js'
        }
      }
  }
  }); //initConfig
  grunt.registerTask('default', ['express:dev', 'watch', 'copy', 'uglify']);
}; //exports
