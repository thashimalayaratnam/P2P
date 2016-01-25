
angular.module('util.firebase.client', [])

.factory('FirebaseClient', function() {

  var daysAgo = function (otherDateStr) {
    return Math.floor((new Date() - new Date(otherDateStr))/1000/60/60/24);
  };

  var currDateStr = function () {
    return new Date().toLocaleDateString();
  };

  var futureDateStr = function (days) {
    var now = new Date().getTime();
    var future = new Date(now + days*24*60*60*1000);
    return future.toLocaleDateString();
  };

  var URL = "https://burning-fire-7355.firebaseio.com/";

  // not hook
  var getUser = function (userId, callback) {
    var rootRef = new Firebase(URL);
    var usersRef = rootRef.child('users');
    var myUserRef = usersRef.child(userId);

    myUserRef.once('value', function (s) {
      callback(s.val());
    });
  };

  // hook
  var getProgressesOfUser = function (userId, callback) {
    var rootRef = new Firebase(URL);
    var usersRef = rootRef.child('users');
    var myUserRef = usersRef.child(userId).child('progresses');

    myUserRef.on('value', function (s) {
      callback(s.val());
    });
  };

  // hook
  var getProgress = function (progressId, callback) {
    var rootRef = new Firebase(URL);
    var progressesRef = rootRef.child('progresses');
    var myProgressRef = progressesRef.child(progressId);

    myProgressRef.on('value', function (s) {
      callback(s.val());
    });
  };

  // not hook
  var getChallenges = function (callback) {
    var rootRef = new Firebase(URL);
    var challengesRef = rootRef.child('challenges');

    challengesRef.once('value', function (s) {
      callback(s.val());
    });
  };

  // hook
  var getChallenge = function (challengeId, callback) {
    var rootRef = new Firebase(URL);
    var challengesRef = rootRef.child('challenges');
    var myChallengeRef = challengesRef.child(challengeId);

    myChallengeRef.on('value', function (s) {
      callback(s.val());
    });
  };

  // not hook
  var getChallengeOnce = function (challengeId, callback) {
    var rootRef = new Firebase(URL);
    var challengesRef = rootRef.child('challenges');
    var myChallengeRef = challengesRef.child(challengeId);

    myChallengeRef.once('value', function (s) {
      callback(s.val());
    });
  };

  var getTodaysTasks = function (startDate, tasks) {
    var index = daysAgo(startDate);
    return tasks[index];
  };

  var incChallenge = function (challengeId) {
    var rootRef = new Firebase(URL);
    var challengesRef = rootRef.child('challenges');
    var myChallengeRef = challengesRef.child(challengeId);

    myChallengeRef.child('completed').transaction(function (currentValue) {
      return (currentValue || 0) + 1;
    }, function (err, committed, s) {
      if (err)
        console.error('NSA IS WATCHING. RUN');
      else if (committed) {
        console.log('committed: ' + s.val());
      }
    });
  };

  var challengeUsers = function (progressId, usersArr) {
    var rootRef = new Firebase(URL);
    var usersRef = rootRef.child('users');

    usersArr.forEach(function (userId) {
      var tempHash = {}
      tempHash[progressId] = true
      usersRef.child(userId).child("progresses").update(tempHash);
    });
  };

  var acceptChallenge = function (progressId, userId) {
    var rootRef = new Firebase(URL);
    var progressesRef = rootRef.child('progresses');
    var myProgressRef = progressesRef.child(progressId);
    var myUserRef = myProgressRef.child('users');

    getUser(userId, function (user) {
      var tempHash = {};
      tempHash[userId] = {
        "current_streak": 0,
        "last_complete": currDateStr(),
        "name": user.name,
        "points": 0
      };
      myUserRef.update(tempHash);
    });

    myProgressRef.child('pending').child(userId).remove();
  };

  var rejectChallenge = function (progressId, userId) {
    console.log("don't be stupid");
    acceptChallenge(progressId, userId);
  };

  var increaseProgress = function(userId, progressId) {
    var rootRef = new Firebase(URL);
    var myProgressRef = rootRef.child('progresses').child(progressId);
    var myUserRef = myProgressRef.child('users').child(userId);

    myUserRef.transaction(function (user) {
      if (user == null) return 1;
      if (daysAgo(user.last_complete) < 2) {
        user.current_streak += 1;
      } else {
        user.current_streak = 1;
      }
      user.last_complete = currDateStr();
      return user;
    }, function (err, committed, s) {
      if (err)
        console.err('streak commit error');
      else if (committed) {
        console.log("INCREASE IN STREAK! (get fire on these bitches)");
        console.log(s.val());
      }
    });
  };

  var createProgress = function (challengeId, challenger, usersArr) {
    var rootRef = new Firebase(URL);
    var progressesRef = rootRef.child('progresses');

    var newProgressRef = progressesRef.push();
    var newKey = newProgressRef.key();

    var usersHash = {};
    usersArr.forEach(function (userId) {
      usersHash[userId] = true;
    });

    getChallengeOnce(challengeId, function (challenge) {
      newProgressRef.set({
        "challenge": challengeId,
        "duration": challenge.duration,
        "name": challenge.name,
        "tasks": challenge.tasks,
        "start_date": currDateStr(),
        "active": false,
        "pending": usersHash,
        "finish_date": futureDateStr(challenge.duration),
        "users": true
      });
      getUser(challenger, function (chlgUser) {
        var innerHash = {};
        innerHash[challenger] = {
          "current_streak": 0,
          "last_complete": currDateStr(),
          "name": chlgUser.name,
          "points": 0
        };
        newProgressRef.update({
          "users": innerHash,
          "challenger_name": chlgUser.name
        });
      });
    });
    challengeUsers(newKey, usersArr);

    return newKey;
  };

  var completeProgress = function (progressId) {

  };


  return {
    getUser: getUser,
    getProgress: getProgress,
    getProgressesOfUser: getProgressesOfUser,
    getChallenges: getChallenges,
    getChallenge: getChallenge,
    getTodaysTasks: getTodaysTasks,
    acceptChallenge: acceptChallenge,
    rejectChallenge: rejectChallenge,
    increaseProgress: increaseProgress,
    createProgress: createProgress,
    incChallenge: incChallenge,
    userId: "thas"
  };
});
