module.exports = function(grunt) {
   grunt.loadNpmTasks('grunt-contrib-less');
   grunt.loadNpmTasks('grunt-contrib-handlebars');
   grunt.loadNpmTasks('grunt-contrib-requirejs');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   var fs = require('fs'),
   glob = require('glob'),
   log = function(msg) { grunt.log.writeln(msg); },
   x = 'empty:',
   options = require('argv').option([
      // List of unix style options
      { name: 'log-tweets', short: 'l', type: 'boolean' },
      { name: 'nomin', short: 'n', type: 'boolean'}
   ]).run().options;

   var config = {
      min: !options.nomin,
      buildDir: 'dist'
   };

   /*
      Translate LESS files & concatenate all CSS
   */
   config.less = {
      options: {
         strictImports: true,
         yuicompress: '<%=min%>'
      },
      main: {
         files: { '<%=buildDir%>/main.css': ['src/**/*.{less,css}'] }
      }
   };

   /*
      Precompile HTML templates
   */
   config.handlebars = {
      options: {
         // Don't try to globally expose templates
         namespace: false,
         // We need to use commonjs since AMD mode
         // doesn't handle multiple templates in a single module
         commonjs: true,
         // Trims whitespace
         processContent: function(content) {
            content = content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '');
            content = content.replace(/^[\r\n]+/, '').replace(/[\r\n]*$/, '\n');
            return content;
         },
         // Remove path & file ext from template names
         processName: function(filePath) {
            return filePath.replace(/^(?:.*\/)([^\/\.]+)(?:\..+)?$/, '$1');
         }
      },
      main: {
         dest:'<%=buildDir%>/hbt.js',
         src:['src/**/*.hbt']
      }
   };

   /*
      Copy all static resources & plain javascript to the build directory
   */
   config.copy = {
      main: {
         expand: true,
         cwd: 'src',
         src: ['./**/*.{png,jpg,gif,js,html}'],
         dest: '<%=buildDir%>/'
      }
   };

   config.requirejs = {
      main: {
         options: {
            has: {
               // Enable debugging code enclosed by `if (has('option')) {}`
            },
            optimize: '<%= min? "uglify":"none" %>',
            removeCombined: true,
            skipModuleInsertion: true,
            baseUrl: '<%=buildDir%>/',
            out: '<%=buildDir%>/main.js',
            include: ['main.js'],
            paths: {}
         }
      }
   };

   config.clean = {
      main: ['<%=buildDir%>/']
   };

   grunt.initConfig(config);

   grunt.registerTask(
      'build',
      'Please check the "How to Build" section of readme.md',
      ['clean:main', 'less:main', 'copy:main', 'handlebars:main', 'wrap-hbt', 'requirejs:main']
   );

   grunt.registerTask(
      'wrap-hbt',
      'Convert commonjs modules into AMD format',
      function() {
         var files, content, globPath, numTargets, newContent,
         cjsRegex = /(?:module.exports = function\(Handlebars\) {([\s\S]*)};)/,
         replacementStr = "define(['handlebars'], function(Handlebars) {$1});",
         targets = [].splice.call(arguments, 0);

         if (!targets.length)
            targets = ['player', 'thumbs', 'tabs'];

         numTargets = targets.length;

         targets = targets.join(',');

         globPath = config.buildDir+'/hbt.js';

         log('Glob path: '+globPath);

         files = glob(globPath, {sync:true});

         for (var k=0, len=files.length; k<len; ++k) {
            content = fs.readFileSync(files[k]).toString();
            newContent = content.replace(cjsRegex, replacementStr);
            fs.writeFileSync(files[k], newContent);
            log('Wrapped: '+files[k]);
         }
      }
   );

   grunt.registerTask('default', ['build']);
};
