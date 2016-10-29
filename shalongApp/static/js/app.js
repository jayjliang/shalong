angular.module('App', ['ionic','App.config','App.services'])

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    // $ionicConfigProvider.tabs.position('bottom');

    $stateProvider
    //index
    .state(
        "index",{
            url:"",
            abstract:true,
            templateUrl:"pages/menu.html",
            controller:"menuCtrl"
        })
    .state(
        "index.home",
        {
            url:"/home",
            views:{
                "home":{
                    templateUrl:"pages/home.html",
                    controller:"homeCtrl"
                }
            }
        })
    //login
    .state(
        "login",{
            url:"/login",
            templateUrl:"pages/login.html",
            controller:"LoginCtrl"
        })
    //register
    .state(
        "register",{
            url:"/register",
            templateUrl:"pages/register.html",
            controller:"RegCtrl"
        })
    //我的兼职
    .state(
        "myshalong",{
            url:"/my",
            templateUrl:"pages/my.html",
            controller:"MyCtrl"
        })
    $urlRouterProvider.otherwise('/home');
})

.controller('MyYCtrl', ['$scope','ENV','callApi','User', function($scope,ENV,callApi,User) {
    
}])
;