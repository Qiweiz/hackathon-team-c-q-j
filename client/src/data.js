define([], function() {
   /*
      Performs data calls to the back-end
   */
   var data = {},
   SERVICE_URI = 'http://10.101.100.182:3000/get_tweets.jsonp',
   SCORE_URI = 'http://10.101.100.182:3000/users/',
   SESSION_ID = getUniqueID(5),
   user = {};

   /*
      Retrieve tweets and associated point values.
      This method is asynchronous
      @arg {String} [query] The search query
      @returns {Promise}
   */
   data.getTweets = function(userName, query1, query2) {
      var dfd = $.Deferred();

      $.jsonp({
         url: SERVICE_URI,
         pageCache: false,
         traditional: true,
         data: {
            username: userName,
            hashtag1: query1,
            hashtag2: query2
         },
         callbackParameter: 'callback',
         callback: 'tweets_' + SESSION_ID
      }).then(function(json) {
         // TO DO validate response
         user = json.user;
         dfd.resolve(json);
      }, function() {
         // Network/server error - Use test data
         dfd.resolve(defaultTweets);
      });

      return dfd.promise();
   };

   data.getUser = function(callback) {
      if (typeof callback !== 'function')
         return;

      callback(user);
   };

   data.postScore = function(score) {
      if (user.id)
         new Image().src = SCORE_URI+user.id+'?score='+score;
   };

   var defaultTweets = {
      tweets: [
         {
            points: '-50',
            name: 'OneScreen',
            username: 'onescreen',
            avatar: 'res/twitter.png',
            content: '#YOLO #YOLO #YOLO #YOLO #YOLO #YOLO asdf zxcv qwer poiu mnb lkj uthg guh u gskas',
            time: 'Just now'
         }
      ]
   };

   /*
      Randomly generate a unique n-digit number
      @arg {Number} n Length of the result
      @returns {String}
   */
   function getUniqueID(n) {
      var num = Math.floor(Math.random()*Math.pow(10,n));
      return new Array(n-String(num).length+1).join(0)+num;
   }

   return data;
});
