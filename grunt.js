module.exports = function(grunt) {

  var staging = 'build/',
      output  = 'output', //fake
      deploy = '../htdocs'; // TODO

  // Project configuration.
  grunt.initConfig({

    // temporary and build directory (required)
    staging: staging,
    output : output,

    // make directory for build
    mkdirs: {
      staging: '.'
    },

    // lint javascript file
    lint: {
      files: [
        'js/main.js'
      ]
    },
    jshint: {
      globals: {
        window: true,
        setTimeout: true,
        setInterval: true
      }
    },
    concat: {
      dist: {
        src: '<config:lint.files>',
        dest: 'js/main-concat.js'
      }
    },
    min: {
      dist: {
        src: ['js/main-concat.js'],
        dest: 'js/main-min.js'
      }
    },
    compass: {
        dev: {
            src: 'sass',
            dest: 'css',
            outputstyle: 'expanded',
            linecomments: true,
            forcecompile: true,
            debugsass: false,
            images: 'img',
            relativeassets: true
        },
        prod: {
            src: 'sass',
            dest: 'css',
            outputstyle: 'compressed',
            linecomments: false,
            forcecompile: true,
            debugsass: false,
            images: 'img',
            relativeassets: true
        }
    },
    usemin: {
      html: ['**/*.html']
    },
    html: {
      files: ['**/*.html']
    },
    img: {
      src: ['img/**/*']
    },
    server: {
      staging: {
        port : 3000,
        base : staging
      },
      output: {
        port : 3001,
        base : output
      }
    },
    growl : {
        defaultTask : {
            title : "Grunt default task",
            message : "Complete Task !!"
        },
        prodTask : {
            title : "Grunt prod task",
            message : "Complete Task !!"
        }
    },
    watch: {
      files: ['js/*.js', 'sass/*.scss'],
      tasks: 'default'
    }
  });

  grunt.task.registerTask('deploy-copy', 'copy for deploy', function(){
    var cb = this.async(),
        dest = deploy,
        ignores = ['.gitignore', '.git', '.buildignore', '.svn', '.svnignore', 'sass'];

    grunt.file.setBase(process.cwd());

    grunt.task.helper('copy', staging, output, ignores, function(e){
      if(e) {
         grunt.log.error(e.stack || e.message);
      } else {
        grunt.log.ok();
      }
      cb(!e);
    });
  });


    //Register Depth building task.
    grunt.registerTask('deps', function () {

        console.log('Start depth building...');

        var exec = require('child_process').exec,

            done = this.async(),
            command = 'python closure-library/closure/bin/build/depswriter.py --root_with_prefix="js ../../../js" --output_file=deps.js',
            callback = function (err, stdout, stderr) {
                if (err) {
                    console.log(stderr);
                    done(false);
                }
                else {
                    console.log(stdout);
                    console.log('End of building.');
                    done();
                }
            };

        exec(command, callback);
    });

    //Register Building task.
    grunt.registerTask('build', function () {

        console.log('Start building...');

        var exec = require('child_process').exec,

            done = this.async(),
            namespace    = 'Hoge.App',
            outputFile   = 'Hoge.min.js',
            compiler_jar = '/Applications/gcc/compiler.jar',

            //To create command.
            command = [
                'python closure-library/closure/bin/build/closurebuilder.py ',
                '--root=./js ',
                '--root=./closure-library ',
                '--namespace="', namespace, '" ',
                '--output_mode=compiled ',
                '--output_file=', outputFile, ' ',
                '--compiler_jar=', compiler_jar, ' ',
                '-f "--define=goog.DEBUG=false"'
            ].join(''),

            //Define the callback function.
            callback = function (err, stdout, stderr) {
                if (err) {
                    console.log(stderr);
                    done(false);
                }
                else {
                    console.log(stdout);
                    console.log('End of building.');
                    done();
                }
            };

        //Exec command.
        exec(command, callback);
    });

  // load Tasks
  grunt.loadNpmTasks('node-build-script');
  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-growl');

  // regist
  grunt.registerTask('deploy', 'deploy-copy');
  grunt.registerTask('default', 'clean mkdirs lint compass:dev growl:defaultTask');
  grunt.registerTask('prod', 'clean mkdirs lint concat min compass:prod usemin html img growl:prodTask');
};
