define(['dropper', 'hbt', 'data'], function(dropper, HBT, data) {
   /*
      Manages creation of droppers as well as current time and score
   */

   var game = {},
   START_TIME = 20,
   gameWindow = $('.game'),
   stage = $('.stage'),
   reticle = $('.reticle'),
   timeDisplay = $('.time'),
   scoreDisplay = $('.score'),
   restartButton = $('.restart'),
   modalButton = $('.modal-button'),
   inputUserName = $('#user-name'),
   highScoresDisplay = $('.high-scores'),
   inputHash1 = $('#hash1'),
   inputHash2 = $('#hash2'),
   currentScore = 0,
   currentTime = START_TIME,
   timerID = NaN,
   userName = '',
   query1 = '',
   query2 = '';


   /*
      Reset the score and start dropping new tweets
   */
   game.start = function() {
      updateScore();

      timeDisplay.text('LOADING');

      dropper.start(userName, query1, query2).then(function() {
         hideScores();
         currentTime = START_TIME;
         timerID = setInterval(decreaseTime, 1000);
      });

      dropper.click(function(tweet) {
         updateScore(tweet.points);
      });
   };

   /*
      Stop the current round
   */
   game.stop = function() {
      clearInterval(timerID);
      timerID = NaN;
      dropper.stop();
      currentTime = 0;
      showScores();
   };

   function decreaseTime() {
      timeDisplay.text( formatTime(--currentTime) );
      if (currentTime <= 0) {
         data.postScore(currentScore);
         game.stop();
      }
   }

   function showScores() {
      data.getUser(function(user) {
         $('high-scores-item').remove();
         highScoresDisplay
            .append( HBT['high-score'](user) )
            .fadeIn();
      });
   }

   function hideScores() {
      highScoresDisplay.fadeOut();
   }

   /*
      Add or substract a number of points to the current score
      @arg {number} amt
   */
   function updateScore(amt) {
      if (isNaN(amt))
         currentScore = 0;
      else
         currentScore += parseInt(amt, 10);

      scoreDisplay.text('Score '+currentScore);
   }

   /**
      Transforms a large number into something more readable
      @arg {Number} t The time in seconds
      @return {String} The formatted time in the form: 'hh:mm:ss'
      @memberOf util
   */
   function formatTime(t) {
      if (isNaN(t) || typeof t == 'object')
          return '--:--';
      var sc = Math.floor(t%60), mn = Math.floor(t/60)%60, hr = Math.floor(t/3600);
      var seconds = (sc < 10) ? "0" + sc : sc,
          minutes = (mn < 10) ? "0" + mn : mn,
          hours = (hr < 10) ? "0" + hr : hr;
      return (hours != "00") ? (hours+":"+minutes+":"+seconds) : (minutes+":"+seconds);
   }

   restartButton.click(function() {
      game.stop();
      // game.start();
   });

   modalButton.click(function() {
      userName = inputUserName.val();
      query1 = inputHash1.val();
      query2 = inputHash2.val();
      game.start();
   });

   $.fn.modal({
      trigger: '.restart',
      olay:'.overlay',
      modals:'.modal',
      animationEffect: 'slidedown',
      animationSpeed: 400,
      moveModalSpeed: 'slow',
      background: '000000',
      opacity: 0.8,
      openOnLoad: false,
      docClose: true,
      closeByEscape: true,
      moveOnScroll: true,
      resizeWindow: true,
      close:'.modal-button'
   });

   return game;
});
