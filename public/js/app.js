var portfoliosApp = angular.module('portfoliosApp', ['ngResource', 'ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngToast']);


portfoliosApp.config(function($routeProvider) {
     $routeProvider
        .when('/portfolios',{
            templateUrl:'views/portfolios/portfolios.html',
            controller: 'PortfoliosCtrl'
        })
        .when('/login',{
            templateUrl:'views/authentication/login.html',
            controller: 'AuthenticationCtrl'
        })
        .when('/register',{
            templateUrl:'views/authentication/register.html',
            controller: 'AuthenticationCtrl'
        })
        .when('/portfolios/new',{
            templateUrl:'views/portfolios/new.html',
            controller: 'PortfoliosCtrl'
        })
        .when('/portfolios/:portfolioId',{
            templateUrl:'views/portfolios/show.html',
            controller: 'PortfoliosCtrl'
        })
        .when('/portfolios/edit/:portfolioId',{
            templateUrl:'views/portfolios/edit.html',
            controller: 'PortfoliosCtrl'
        })
        .otherwise({redirectTo: '/portfolios'});

});

portfoliosApp.config(['ngToastProvider', function(ngToast) {
    ngToast.configure({
      horizontalPosition: 'center',
    });
}]);


