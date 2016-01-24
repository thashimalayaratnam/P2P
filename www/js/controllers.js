angular.module('starter.controllers', ['Tek.progressBar', 'util.firebase.client'])

.controller('LoginCtrl', function($scope, $location){
    $scope.go = function(hash){
        $location.path(hash)
    }
})
.controller('AppCtrl', ["$scope", "$timeout", "$location", "FirebaseClient", function($scope, $timeout, $location, FirebaseClient) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  $scope.go = function(hash) {
    $location.path(hash)
  }

  $scope.userId = "thas";

  $scope.trending = [
      {name: 'Lose 5 pounds in 2 Weeks', people: '151'},
      {name: 'Do 100 push-ups in 4 Weeks', people: '131'},
      {name: 'Do 100 burpees in 5 Weeks', people: '673'}
  ];

    FirebaseClient.getChallenges(function(challenges){
        for (var key in challenges) {
            var _name = challenges[key].name;
            var _completed = challenges[key].completed;

            $scope.trending.push({name: _name, people: _completed});
        }
    });

  $scope.users = [
      {name: 'Jeel', point: '1578', value: '100'},
      {name: 'Thas', point: '999', value: '70'}
  ];

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

    $scope.fields = [{'id': 'name1'}];

    $scope.addTextField = function() {
        if($scope.fields.length !== 3){
            var newItem = $scope.fields.length + 1;
            $scope.fields.push({'id':'name'+newItem});
        }
    };
}])

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
