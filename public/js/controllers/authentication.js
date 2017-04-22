
portfoliosApp.controller('AuthenticationCtrl', ['$scope', '$rootScope', '$http', '$location', '$httpParamSerializerJQLike', 'ngToast', '$route', function($scope, $rootScope, $http, $location, $httpParamSerializerJQLike, ngToast, $route) {
    $scope.isLoggedIn;
    if($rootScope.currentUser){
        $location.url("/portfolios");
        ngToast.create({
                className: 'info',
                content: 'User is already logged in',
                dismissButton: 'true',
                timeout: 5000
            });
    }
    
    $scope.login = function(user){
        var successCallback = function(response) {
            $rootScope.currentUser =  response.data.username;
            ngToast.create({
                className: 'info',
                content: 'Hello ' + response.data.username,
                dismissButton: 'true',
                timeout: 5000
            });
            $location.url("/portfolios");
        };
        
        var errorCallback = function(err) {
            console.log(err);
            ngToast.create({
                className: 'danger',
                content: '' + err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };        
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        
        $scope.error = null;
        $http.post('/login', $httpParamSerializerJQLike($scope.user), config).then(successCallback,errorCallback);
        console.log(user);
    };
    
    // Check if user is logged in
     $scope.isLoggedIn = function(){
        var successCallback = function(response) {
            $rootScope.currentUser =  response.data.username;
        };
        var errorCallback = function(err) {
            console.dir(err);
        };        
        $http.get('/isLoggedIn').then(successCallback,errorCallback);
    };
    
    
    $rootScope.logout = function(user){
        console.log("Logoutfor = " + user);
        var successCallback = function(response) {
            console.log(response);
            $rootScope.currentUser =  null;
            $route.reload();
            $location.url("/portfolios");
        };
        
        var errorCallback = function(err) {
            console.log("There was a problem with logout - ");
            console.dir(err);
        };        

        $scope.error = null;
        $http.post('/logout').then(successCallback,errorCallback);
        console.log(user);
    };
    
    $scope.register = function(user){
        
        var successCallback = function(response) {
            console.log(response);
            ngToast.create({
                className: 'info',
                content: 'Hello ' + response.data.username,
                horizontalPosition: 'center',
                dismissButton: 'flase',
                timeout: 5000
            });
            
            $rootScope.currentUser =  response.data.username;
            $location.url("/portfolios");
        };
        var errorCallback = function(err) {
            console.dir(err);
            ngToast.create({
                className: 'danger',
                content: ''+err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };        
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        
        $scope.error = null;
        $http.post('/register', $httpParamSerializerJQLike($scope.user), config).then(successCallback,errorCallback);
        console.log(user);
    };
    
}]);
