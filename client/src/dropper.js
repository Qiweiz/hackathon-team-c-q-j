define(['data', 'hbt'], function(data, HBT) {
   /*
      Drops 'tweets' from the top of the stage
   */
   var dropper = {},
   X_MIN = 0,
   X_MAX = 800-300,
   ANIM_TIME_MIN = 4000,
   ANIM_TIME_MAX = 6000,
   DROP_INTERVAL = 1000,
   ENABLE_LOGGING = false,
   intervalID = NaN,
   clickCallback = null,
   stage = $('.stage');

   // Start dropping tweets
   dropper.start = function(userName, query1, query2) {
      return data.getTweets(userName, query1, query2).then(function(tweetData) {
         if (ENABLE_LOGGING)
            console.log('[dropper]', tweetData);

         var numTweets = tweetData.tweets.length,
         curIndex = 0;

         intervalID = setInterval(function() {
            curIndex = (curIndex+1)%numTweets;
            dropTweet( tweetData.tweets[curIndex] );
         }, DROP_INTERVAL);
      }, function() {
         // Request failed, do nothing
         // TO DO use default tweet data?
      });
   };

   // Stop dropping tweets and clear any existing elements
   dropper.stop = function() {
      clearInterval(intervalID);
      $('.tweet').remove();
   };

   dropper.click = function(callback) {
      clickCallback = callback;
   };

   function dropTweet(tweetData) {
      if (ENABLE_LOGGING)
         console.log('[dropper]', tweetData);

      var element = $(HBT.tweet(tweetData)),
      startX = randomInt(X_MIN, X_MAX),
      animationTime = randomInt(ANIM_TIME_MIN, ANIM_TIME_MAX),
      scaleSize = animationTime/ANIM_TIME_MAX;

      element.css({
         // transform: 'scale('+scaleSize+')',
         left: startX
      });

      stage.append(element);

      element.animate({
        top: '100%'
      }, animationTime, 'linear', function() {
         element.remove();
      });

      element.one('click', function() {
         if (clickCallback) {
            clickCallback(tweetData);
            element.stop(true).fadeOut(function() {
               element.remove();
            });
         }
      });
   }

   /*
      Get a random integer
      @arg {number} [min]
      @arg {number} max
      @returns {number}
   */
   function randomInt(min, max) {
      if (!isNaN(min) && !isNaN(max))
         return min+Math.floor(Math.random()*max);
      else if (!isNaN(min))
         return Math.floor(Math.random()*min);
   }

   return dropper;
});
