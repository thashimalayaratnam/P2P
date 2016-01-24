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

var userId = "thas",
    URL = "https://burning-fire-7355.firebaseio.com/";

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

  myProgressRef.transaction(function (progress) {
    // return progress.
  });
};

var rejectChallenge = function (progressId, userId) {
  console.log("don't be stupid");
  acceptChallenge(progressId, userId);
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
};

var updateProgress = function (challengeId, userId) {

};

// ---------------

var getPoints = function (userId, groupId) {
  var userRef = new Firebase(URL + 'users/' + userId);
  var challengesRef = userRef.child('challenges');
  var points;
  challengesRef.once("value", function(snapshot){
    challenges = snapshot.value();
    if (challenges[0].id === groupId) {
      points = challenges[0].points;
    }
    else {
      points = challenges[1].points;
    }
  });
  return points;
};

var getInformation = function (userId, challenge_num) {
  console.log("getinfo called: " + userId);
  var rootRef = new Firebase(URL);
  console.log("rootref: " + rootRef.child('users'));

  // Get the challenge
  var challengesRef = rootRef.child('users/' + userId + '/challenges/' + challenge_num);
  console.log("challengeref:" + challengesRef);
  var challenge;
  challengesRef.once("value", function(snapshot) {
    challenge = snapshot.val();
    console.log("challenge: " + challenge);
    var groupId = challenge.id;
    console.log("group id: " + groupId);
    var points = [];

    // Get the points
    var peopleRef = rootRef.child('groups/' + groupId + '/people');
    console.log("people ref: " + peopleRef);
    peopleRef.once("value", function (snapshot) {
      // Collect points
      people = snapshot.val();
      console.log("people./ ");
      console.log(people);
      people.forEach(function (e) {
        tempHash = {};
        tempHash[e] = 
        points.push(e, getPoints(e, groupId));
      });
    });
    return points;
  });
};

// getInformation(userId, 0);
