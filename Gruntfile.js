'use strict';

var path = require('path');

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: 'src',
        dist: 'dist',
        demo: 'demo'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            lessDemo: {
                files: ['<%= config.demo %>/styles/{,*/}*.less'],
                tasks: ['newer:less:demo']
            },
            build: {
                files: ['<%= config.app %>/*.{less,css}', '<%= config.app %>/*.js'],
                tasks: ['newer:copy:dist', 'uglify:dist', 'less:dist', 'autoprefixer:dist']
            },
            copyToDemo: {
                files: ['<%= config.dist %>/*.{less,css}', '<%= config.dist %>/*.js'],
                tasks: ['newer:copy:demo']
            },
            livereload: {
                options: {
                    livereload: 35729
                },
                files: [
                    '<%= config.demo %>/{,*/}*.html',
                    '<%= config.demo %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.demo %>/scripts/*.js'
                ]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                reporterOutput: ''
            },
            dist: {
                src: ['<%= config.app %>/{,*/}*.js']
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/{,*/}*',
                        '!<%= config.dist %>/.git{,*/}*'
                    ]
                }]
            },
            demo: {
                src: ['<%= config.demo %>/styles/main.css', '<%= config.demo %>/scripts/zSlider.js']
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: true,
                beautify: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>/',
                    src: '{,*/}*.js',
                    dest: '<%= config.dist %>/',
                    ext: '.min.js'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{less,css}',
                        '*.js'
                    ]
                }]
            },
            demo: {
                files: {
                    '<%= config.demo %>/scripts/zSlider.js': '<%= config.dist %>/zSlider.js',
                    '<%= config.demo %>/styles/zSlider.css': '<%= config.dist %>/zSlider.css'
                }
            }
        },
        less: {
            options: {
                cleancss: false, // Compress output using clean-css.
                compress: false, // Compress output by removing some whitespaces.
                sourceMap: true
            },
            dist: {
                options: {
                    sourceMap: false
                },
                expand: true,
                cwd: '<%= config.dist %>/',
                dest: '<%= config.dist %>/',
                src: '*.less',
                ext: '.css'
            },
            demo: {
                files: {
                    '<%= config.demo %>/styles/main.css': '<%= config.demo %>/styles/less/main.less'
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 9'],
                map: true //source map
            },
            demo: {
                src: '<%= config.demo %>/styles/main.css'
            },
            dist: {
                src: '<%= config.dist %>/*.css'
            }
        },
        connect: {
            options: {
                port: 9999,
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: false,
                    middleware: function(connect) {
                        return [
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.demo),
                            connect.static(appConfig.dist)
                        ];
                    }
                }
            }
        }

    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'express:dist', 'watch:dist']);
        }

        grunt.task.run([
            'build',
            'demo',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('demo', [
        'clean:demo',
        'less:demo',
        'autoprefixer:demo',
        'copy:demo'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint:dist',
        'copy:dist',
        'uglify:dist',
        'less:dist',
        'autoprefixer:dist'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
