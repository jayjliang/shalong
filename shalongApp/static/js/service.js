angular.module('App.services',[])

//存储模块，包含set，get，remove函数
.service('Storage',['ENV',function(ENV){
    this.set = function(key,data) {
        return window.localStorage.setItem(key,window.JSON.stringify(data));
    }

    this.get = function(key) {
        return window.JSON.parse(window.localStorage.getItem(key));
    }

    this.remove = function(key) {
        return window.localStorage.removeItem(key);
    }
}])

/*
*用户模块
*/
.service('User', ['Storage','callApi','$q','$log', function(Storage,callApi,$q,$log){
    var storageKey = 'shalonguser';
    var user = Storage.get(storageKey) || {}
    this.login = function(username,password) {
        data = {
            'user_phone':username,
            'password':password
        }
        loginDefer = $q.defer();
        callApi.getData('/auth/login','POST',data)
            .then(function(response){
                if(response.code == 200){
                    user.token = response.content;
                    Storage.set(storageKey,user);
                    loginDefer.resolve(null);
                } else {
                    loginDefer.resolve(response.content);
                }
            },function(response){
                loginDefer.reject(response);
            });

        return loginDefer.promise;
    };

    this.register = function(username,password, cardnum){
        data = {
            'phone': username,
            'password': password,
            'cardnum': cardnum
        }
        registerDefer = $q.defer();
        callApi.getData('/auth/reg','POST',data)
            .then(function(response){
                if(response.code == 200){
                    user.token = response.content;
                    Storage.set(storageKey,user);
                    registerDefer.resolve(null);
                } else {
                    registerDefer.resolve(response.content);
                }
            },function(response){
                registerDefer.reject(response);
            });
        return registerDefer.promise;

    }
    this.logout = function() {
        Storage.remove(storageKey);
        user = {};
    }

    this.judgeUser = function(){
        for(name in user){
            return false;
        }
        return true;
    }
    this.getCurrentUser = function() {
        return user;
    }

    this.refresh_user = function() {
        user = Storage.get(storageKey) || {};
        return user;
    }
}])


/*
*消息显示模块
*/
.service('MessageShow', ['$ionicLoading', function($ionicLoading){
    this.errorShow = function(message){
        $ionicLoading.show({
            template:message,
            noBackdrop:true,
            duration:2000
        });
    }

    this.MessageShow = function(message,time){
        var time = time|2000;
        $ionicLoading.show({
            template:message,
            noBackdrop:true,
            duration:time
        });
    }
    this.show = function(msg){
        $ionicLoading.show({
            template:msg,
            noBackdrop:true,
        });
    }
    this.hide = function(){
        $ionicLoading.hide();
    }
    
}])


.service('EventService', ['$rootScope', function($rootScope){
    var Messenger = {
        broadcast:function(EventName){
            setTimeout(function(){
                $rootScope.$broadcast(EventName);
            },100)
            
        }
    };
    return Messenger;
}])

/*
*调用服务器api模块
*/
.service('callApi', ['$http','ENV','$q','$log', function($http,ENV,$q,$log){
    var i = 1;
    // $log.debug(ionic.Platform)
    this.namedata = function(){
        return i;
    }
    
    // user: 0:用户 1:管理员
    this.getData = function(url,method,data,token,type){
        var deferred = $q.defer();
        var final_url = ENV.api+url;//+'?&callback=JSON_CALLBACK';
        data = data || null;
        type = type || null;
        var config = {
            method:method,
            url:final_url,
            headers:{
                'token':token
            },
            timeout:5000
        }
        // $http.defaults.headers.common['Token'] = token;
        if(method=="GET"){
            config['params'] = data;
        }
        else if(method=="POST"){
            if(!type) {
                config['transformRequest'] = function(obj){
                var str = [];
                for(var p in obj){
                    if(p!="data"){
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    } else {
                        // console.log(JSON.stringify(obj[p]));
                        str.push(encodeURIComponent(p) + "=" + JSON.stringify(obj[p]));
                    }
                }
                return str.join("&");
                }
            }
            config['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
            // config['headers'] = {
            //     'Content-Type':'application/x-www-form-urlencoded',
            //     // 'Token':1
            // };
            config['data'] = data;
        }
        $http(config).success(function(data){
            deferred.resolve(data);
        }).error(function(data,status,headers){
            deferred.reject(data);
        })
        return deferred.promise;
    }
}]);