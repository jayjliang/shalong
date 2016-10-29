angular.module('App', ['ionic','App.config','App.services'])

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    // $ionicConfigProvider.tabs.position('bottom');

    $stateProvider
//管理员
    .state(
        "admin",{
            url:"/admin",
            abstract:true,
            templateUrl:"pages/menu.html",
            controller:"MyYCtrl"
        })
    .state(
        "admin.home",
        {
            url:"/home",
            views:{
                "adminjianzhi":{
                    templateUrl:"pages/home.html",
                    controller:"AdminHomeCtrl"
                }
            }
        })
    .state(
        "admin.new",
        {
            url:"/new",
            views:{
                "new":{
                    templateUrl:"pages/new.html",
                    controller:"NewCtrl"
                }
            }
        })
    .state(
        "adminLogin",{
            url:"/login",
            templateUrl:"pages/login.html",
            controller:"adminLoginCtrl"
        })
    .state(
        "comments",{
            url:"/comments",
            templateUrl:"pages/comments.html",
            controller:"MyYCtrl"
        })
    ;
    $urlRouterProvider.otherwise('/admin/home');
})
.controller('MyYCtrl', function($scope,$state) {
     $scope.search = function(){
        console.log("search");
     }
})
;