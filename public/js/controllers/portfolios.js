
portfoliosApp.controller('PortfoliosCtrl', ['$scope', '$rootScope', '$http', '$location', '$uibModal', '$route', '$httpParamSerializerJQLike', '$routeParams', '$resource', 'ngToast', function($scope, $rootScope, $http, $location, $uibModal, $route, $httpParamSerializerJQLike, $routeParams, $resource, ngToast) {
    // Check if user is logged in
     $scope.isLoggedIn = function(){
        var successCallback = function(response) {
            console.log("LOGGED");
            console.log(response.data);
            $rootScope.currentUser =  response.data.username;
        };
        var errorCallback = function(err) {
            console.dir(err);
        };        
        $http.get('/isLoggedIn').then(successCallback,errorCallback);
    };
    
    // Get all portfolios
    $scope.getAllPortfolios = function(){
        //console.log("GetAll was initiated");
        var successCallback = function(response) {
            //console.dir(response.data);
            $scope.isLoggedIn();
            $scope.portfolios = response.data;
            console.dir(response.data);
            $scope.portfolio = "";
            if(response.data.length == 0){
                $scope.noPortfolios = true;
            }
        };
        var errorCallback = function(err) {
            ngToast.create({
               className: 'danger',
               content: err,
               horizontalPosition: 'center',
               dismissButton: 'true',
               timeout: 10000
            });
            console.log("There was a problem with get portfolio request : " + err);
        };        
        
        $scope.error = null;
        $http.get('/api/portfolios').then(successCallback,errorCallback);
    };
    

    // Add new portfolio
    $scope.newPortfolio = function(){
        var successCallback = function(response) {
            var res = response.data;
            //console.dir(response.data);
            $scope.closeModal();
            $location.url("/portfolios/" + res._id);
        };
        var errorCallback = function(err) {
            console.log(err);
            if(err.status == 401){
                $scope.closeModal();
                ngToast.create({
                    className: 'danger',
                    content: "Please login first",
                    horizontalPosition: 'center',
                    dismissButton: 'true',
                    timeout: 5000
                });
                $location.url("/login");
            } else {
                $scope.closeModal();
                ngToast.create({
                    className: 'danger',
                    content: "There was a problem with the request " + err.data,
                    horizontalPosition: 'center',
                    dismissButton: 'true',
                    timeout: 5000
                });
            }
        };
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        $http.post('/api/portfolios', $httpParamSerializerJQLike($scope.portfolio), config).then(successCallback,errorCallback);
    };
    
    // Get specific portfolio
     $scope.getSpecificPortfolio = function(){
        $scope.portfoliosId = $routeParams.portfolioId;
        $scope.error = null;
        $scope.isLoggedIn();
        
        var successCallback = function(response) {
            $scope.portfolio = response.data;
            //console.dir($scope.portfolio);
        };
        var errorCallback = function() {
            $scope.portfolioError = "Portfolio cannot be found";
            console.log("Portfolio cannot be found");
        };
         
        //console.log('Get specific req to - /api/portfolios/' + $routeParams.portfolioId )
        $http.get('/api/portfolios/' + $routeParams.portfolioId).then(successCallback,errorCallback);
    };
    
    // Update specific portfolio value data
     $scope.getSpecificPortfolioValue = function(){
         $scope.portfoliosId = $routeParams.portfolioId;
         $scope.error = null;
         
        $http.get('/api/portfolios/' + $routeParams.portfolioId + '/value').then();
    };
      
    // Remove specific portfolio
    $scope.removePortfolio = function(portfolioId){
        var successCallback = function(response) {
            // console.log($routeParams.portfolioId);
            $scope.getAllPortfolios();
            ngToast.create({
                className: 'info',
                content: "Portfolio was deleted succefully",
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };
        var errorCallback = function(err) {
            
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
        
        $http.delete('/api/portfolios/' + portfolioId, $httpParamSerializerJQLike($scope.stock), config).then(successCallback,errorCallback);
    };
    
    // Get stock from specific portfolio for edit
    $scope.editStock = function(stockId){
        $scope.editFlag = true;
        var successCallback = function(response) {
            //console.dir(response.data);
            $scope.stock = response.data;
        };
        var errorCallback = function(err) {
            //console.log("There was a problem when get (edit) stock : " + err);
            ngToast.create({
                className: 'danger',
                content: "Stock data could not be retrieved - " + err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };
         
        $http.get('/api/portfolios/' + $routeParams.portfolioId + '/stocks/' + stockId).then(successCallback,errorCallback);
    };
    
    // Add stock to specific portfolio
    $scope.addStock = function(){
        //console.log("Stock to be added - " + $scope.stock)
        var successCallback = function(response) {
            $scope.stock = "";
            $scope.getSpecificPortfolio();
          //  $scope.getSpecificPortfolioValue();
        };
        var errorCallback = function(err) {
            $scope.error = err;
            //console.log("There was a when post new stock : - " + err);
            ngToast.create({
                className: 'danger',
                content: "Stock could not be added - " + err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        $http.post('/api/portfolios/' + $routeParams.portfolioId + '/stocks', $httpParamSerializerJQLike($scope.stock), config).then(successCallback,errorCallback);
    };
    
    // Update stock in specific portfolio
    $scope.updateStock = function(stockId){
        //console.log("Will put to here - /api/portfolios/" + $routeParams.portfolioId + '/stocks/' + $scope.stock._id);
        var successCallback = function(response) {
            // console.dir(response.data);
            $scope.stock = "";
            $scope.getSpecificPortfolio();
            $scope.editFlag = false;
        };
        var errorCallback = function(err) {
            //$scope.error = err;
            ngToast.create({
                className: 'danger',
                content: "Stock could not be updated - " + err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
        };
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        $http.put('/api/portfolios/' + $routeParams.portfolioId + '/stocks/' + $scope.stock._id, $httpParamSerializerJQLike($scope.stock), config).then(successCallback,errorCallback);
    };
    
    // Remove stock from specific portfolio
    $scope.removeStock = function(stockId){
        //console.log("Stock to be deleted - " + $scope.stock);
        var successCallback = function(response) {
            //console.dir(response.data);
            $scope.stock = "";
            $scope.getSpecificPortfolio();
        };
        var errorCallback = function(err) {
            ngToast.create({
                className: 'danger',
                content: "Stock could not be removed - " + err.data,
                horizontalPosition: 'center',
                dismissButton: 'true',
                timeout: 5000
            });
            //console.log("There was a when post new stock : " + err);
        };
         var config = {
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        $http.delete('/api/portfolios/' + $routeParams.portfolioId + '/stocks/' + stockId, $httpParamSerializerJQLike($scope.stock), config).then(successCallback,errorCallback);
        //$scope.closeModal();
    };
    
    // Deselect a stock in show page
    $scope.deselectStock = function() {
      $scope.stock = "";
      $scope.editFlag = false;
    }

    // Modal functions
    $scope.openModal = function(){
        $scope.openmodal = $uibModal.open({
                scope: $scope,
                templateUrl: "views/portfolios/new.html",
                controller: "PortfoliosCtrl"
        });
    };
    
     $scope.closeModal = function(){
         //$scope.getAllPortfolios();
         $scope.openmodal.close();  
     };
}]);
