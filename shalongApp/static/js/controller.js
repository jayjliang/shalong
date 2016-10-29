angular.module('App')

.controller('homeCtrl', ['$scope','$ionicPopup','$log','$rootScope','callApi','User','MessageShow','$ionicScrollDelegate','$state', function($scope,$ionicPopup,$log,$rootScope,callApi,User,MessageShow,$ionicScrollDelegate,$state){
	var user = User.getCurrentUser();
	var pagenumber = 1;
	var pagesize=5;
	var scrollState=true;
	$scope.questions = {}; 
	var enroll = function(item){
			if(!User.judgeUser()){
				var confirmPopup = $ionicPopup.show({
	               cssClass:'enroll_popup',
	               title: '提示',
	               scope:$scope,
	               buttons:[
	               		{
	               			text:'取消',
	               			type:'button-clear',
	               			onTap:function(e){
	               				console.log("cancle");
	               			}
	               		},
	               		{
	               			text:'确定',
	               			type:'button-clear',
	               			onTap:function(e){
	               				if(!$scope.questions.question) {
	               					alert("请输入问题")
	               					e.preventDefault();
	               				} else {
	               					newOrder(item);
	               				}
	               			}
	               		}
	               ],
	               template: '<textarea type="text" class="my-input" ng-model="questions.question" placeholder="请输入提问问题"/>'
	             });
			} else {
				MessageShow.MessageShow("请先登录",1000);
				$state.go("login");
			}
	};

	var jianzhi_info = []
	var getList = function(pagenumber,callback,type){
		var token = user.token||null;
		callApi.getData("/item/list","POST",{"pagenumber":pagenumber,"pagesize":pagesize},token)
			.then(function(response){
				if(response.code==200){
					dealdata(response.content);
					$scope.no_content=false;
					if(response.content.length<pagesize){
						$scope.scrollState=false;
						if(response.content.length==0 && pagenumber==1){
							$scope.no_content=true;
						}
					}
					if(type==1){
						$scope.jianzhi_info = $scope.jianzhi_info.concat(response.content);
						if(response.content.length<pagesize){
							MessageShow.MessageShow("没有更多数据",1000);
						}
					} else if(type==0){
						$scope.jianzhi_info = response.content;
						if(response.content.length<1){
							MessageShow.MessageShow("暂时没有沙龙",1000);
						}
					} else {
						$scope.jianzhi_info = response.content;
						MessageShow.MessageShow("刷新成功",1000);
						if(response.content.length<1){
							MessageShow.MessageShow("没有更多数据",1000);
						}
					}
					
				} else {
					MessageShow.MessageShow(response.content,1000);
				}
				callback();
			}, function(error){
				MessageShow.MessageShow("网络错误",2000);
				$scope.scrollState=false;
				callback();
			})
	}

	var dealdata = function(data){
		for(var i=0;i<data.length;i++){
			var start = data[i].start_time.split('-');
			data[i].time = data[i].start_time;
			data[i].state = {'1':true,'0':false}[data[i].state];
		}
	}
	$scope.addItems = function(){
		pagenumber+=1;
		setTimeout(function(){
			getList(pagenumber,function(){
				$scope.$broadcast('scroll.infiniteScrollComplete');
			},1);
		},1000);
	}

	$scope.doRefresh = function(){
		console.log("refresh");
		pagenumber = 1;
		$scope.scrollState=true;
		getList(pagenumber,function(){
			$scope.$broadcast("scroll.refreshComplete");
		},2);
	}

	var newOrder = function(item){
		item.state=false;
		callApi.getData("/record/new","POST",{"iid":item.iid,"questions":$scope.questions.question},user.token)
			.then(function(response){
				if(response.code==200){
					MessageShow.MessageShow("报名成功",1000);
					item.reg_number += 1;
				} else {
					MessageShow.MessageShow(response.content,1000);
					item.state=true;
				}
			}, function(error){
				item.state=true;
				MessageShow.MessageShow("网络错误",2000);
			});
	}
	
	function init(){
		getList(pagenumber,function(){
		},0);

	};
	$scope.jianzhi_info = jianzhi_info;
	$scope.enroll = enroll;
	$scope.scrollState = scrollState;
	init();
}])

//我的兼职页面
.controller('MyCtrl', ['$scope','$ionicPopup','$log','callApi','User','MessageShow','$ionicScrollDelegate','$state', function($scope,$ionicPopup,$log,callApi,User,MessageShow,$ionicScrollDelegate,$state){
	var user = User.getCurrentUser();
	var pagenumber = 1;
	var scrollState=true;
	var jianzhi_info={};
	var pagesize=5;
	$scope.comments = {};

	var enroll = function(item){
		if(!User.judgeUser()){
			if(item.state == 1) {
				var confirmPopup = $ionicPopup.show({
	               cssClass:'enroll_popup',
	               title: '提示',
	               scope:$scope,
	               buttons:[
	               		{
	               			text:'取消',
	               			type:'button-clear',
	               			onTap:function(e){
	               				
	               			}
	               		},
	               		{
	               			text:'确定',
	               			type:'button-clear',
	               			onTap:function(e){
	               				CancleOrder(item);
	               			}
	               		}
	               ],
	               template: '<p>确定取消报名该沙龙?</p>'
	             });
			} else if(item.state ==2) {
				var confirmPopup = $ionicPopup.show({
	               cssClass:'enroll_popup',
	               title: '提示',
	               scope:$scope,
	               buttons:[
	               		{
	               			text:'取消',
	               			type:'button-clear',
	               			onTap:function(e){
	               				console.log("cancle");
	               			}
	               		},
	               		{
	               			text:'确定',
	               			type:'button-clear',
	               			onTap:function(e){
	               				if(!$scope.comments.comment) {
	               					alert("请输入评论")
	               					e.preventDefault();
	               				} else {
	               					newComment(item);
	               				}
	               			}
	               		}
	               ],
	               template: '<textarea type="text" class="my-input" ng-model="comments.comment" placeholder="请输入评论"/>'
	             });
			} else {
			}
        } else {
        	MessageShow.MessageShow("请先登录",1000);
			$state.go("login");
        }
	};


	var getList = function(pagenumber,callback,type){
		var token = user.token||null;
		if(User.judgeUser()){
			MessageShow.MessageShow("请先登录",1000);
			$state.go("login");
		} else {
			callApi.getData("/item/mylist","POST",{"pagenumber":pagenumber,"pagesize":pagesize},token)
				.then(function(response){
					if(response.code==200){
						dealdata(response.content);
						$scope.no_content=false;
						if(response.content.length<pagesize){
							$scope.scrollState=false;
							if(response.content.length==0&&pagenumber==1){
								$scope.no_content=true;
							}
						}
						if(type==1){
							$scope.jianzhi_info = $scope.jianzhi_info.concat(response.content);
							if(response.content.length<pagesize){
								MessageShow.MessageShow("没有更多数据",1000);
							}
						} else if(type==0){
							$scope.jianzhi_info = response.content;
							if(response.content.length<1){//没有兼职
								MessageShow.MessageShow("暂时没有兼职",1000);
							}
						} else {
							$scope.jianzhi_info = response.content;
							if(response.content.length==pagesize){
								$scope.scrollState=true;
							}
							if(type === 2) {
								MessageShow.MessageShow("刷新成功",1000);
							}
						}
						
					} else {
						MessageShow.MessageShow(response.content,1000);
					}
					callback();
				}, function(error){
					MessageShow.MessageShow("网络错误",2000);
					$scope.scrollState=false;
					callback();
				})
			}
	}

	var dealdata = function(data){
		for(var i=0;i<data.length;i++){
			var start = data[i].start_time;
			data[i].time = start;
			data[i].mystate = {'3':"完成",'1':"取消",'2':"评论"}[data[i].state];
			data[i].enable_state = {'3':true,'1':false,'2':false}[data[i].state];
		}
	}
	$scope.addItems = function(){
		pagenumber+=1;
		getList(pagenumber,function(){
			$scope.$broadcast('scroll.infiniteScrollComplete');
		},1000);
	}

	$scope.doRefresh = function(){
		pagenumber = 1;
		getList(pagenumber,function(){
			$scope.$broadcast("scroll.refreshComplete");
		},2);
	}

	var CancleOrder = function(item){
			item.state=false;
			callApi.getData("/record/delete","POST",{"rid":item.rid},user.token)
				.then(function(response){
					if(response.code==200){
						MessageShow.MessageShow("退出报名成功",1000);
						getList(pagenumber,function(){},2);
					} else {
						MessageShow.MessageShow(response.content,1000);
					}
				}, function(error){
					MessageShow.MessageShow("网络错误",2000);
				});
	}
	var newComment = function(item) {
		item.state=false;
		callApi.getData("/comment/new","POST",{"iid":item.iid,"comment":$scope.comments.comment},user.token)
			.then(function(response){
				if(response.code==200){
					MessageShow.MessageShow("评论成功",1000);
					getList(pagenumber,function(){},2);
				} else {
					MessageShow.MessageShow(response.content,1000);
				}
			}, function(error){
				MessageShow.MessageShow("网络错误",2000);
			});
	}
	function init(){
		getList(pagenumber,function(){
		},0);

	};
	$scope.jianzhi_info = jianzhi_info;
	$scope.enroll = enroll;
	$scope.scrollState = scrollState;
	init();

}])


//菜单也控制器
.controller('menuCtrl', ['$scope','User','MessageShow','$log','$rootScope','$state','callApi', function($scope,User,MessageShow,$log,$rootScope,$state,callApi){
	var user = User.getCurrentUser();
	console.log("state", User.judgeUser())
	var info = {
		'username':"点击登录",
		'state':!User.judgeUser()
	}
	var getUserName = function() {
		if(!User.judgeUser()){
			callApi.getData('/info/get','POST',null,User.getCurrentUser().token)
				.then(function(response){
					if(response.code==200){
						$scope.info.username = response.content.name;
						$scope.info.state=true;
					} else {
						$log.debug(response.content);
						// MessageShow.MessageShow(response.content,1000);
					}
				}, function(error){
					MessageShow.MessageShow("网络错误",1000);
				})
		} else {
			$scope.info = {
				'username':"点击登录",
				'state':false
			};
		}
	}
	function init(){
		getUserName();
	}

	$scope.logout = function(){
		User.logout();
		getUserName();
	}

	var get_picture_click = function(){
		if(User.judgeUser()){
			$state.go("login");
		} else {
			$state.go("index.home");
		}
	}
	$scope.get_picture_click = get_picture_click;
	$rootScope.$on("update",function(){
			getUserName();
	});
	init();
	$scope.info = info;
}])
//登录页控制器
.controller('LoginCtrl', ['User','$scope','$log','MessageShow','$state','$stateParams','EventService',
		function(User,$scope,$log,MessageShow,$state,$stateParams,EventService){
	$scope.formData = {
		'login_username':'',
		'login_password':''
	};
	var laststate = "index.home";

	var check_dormData = function(formData){
		if(formData.login_username.length < 1){
			return "用户名不能为空!";
		} else if(formData.login_password.length < 1){
			return "密码不能为空";
		} else {
			return null;
		}
	}

	var login = function(){
		
		var error = check_dormData($scope.formData);
		if(error){
			$scope.error_message = error;
		} else {
			User.login($scope.formData.login_username,$scope.formData.login_password)
				.then(function(response){
					$log.debug(response)
					if(response){
						$scope.error_message = response;
					} else {
						MessageShow.MessageShow("登录成功",1000);
						EventService.broadcast("update");
						$state.transitionTo(laststate, {},{reload: true, notify:true});
					}
				},function(error){
					MessageShow.MessageShow("网络错误",1000);
				})
		}
	}
	$scope.login = login;
}])

//注册页控制器
.controller('RegCtrl', ['$scope','User','$log','MessageShow','$state','EventService',
		function($scope,User,$log,MessageShow,$state,EventService){
	var laststate = "index.home";
	$scope.formData = {
		'reg_username':'',
		'pwd':'',
		'reg_cardnum':''
	};
	var check_dormData = function(formData){
		if(formData.reg_username.length < 1){
			return "用户名不能为空!";
		} else if(formData.pwd.length < 1){
			return "密码不能为空";
		} else if(formData.reg_cardnum.length < 1) {
			return "一卡通号不能为空";
		} else {
			return null;
		}
	};

	$scope.register = function(isvalid){
		var error = check_dormData($scope.formData);
		if(error){
			$scope.error_message = error;
		} else {
			User.register($scope.formData.reg_username,$scope.formData.pwd, $scope.formData.reg_cardnum)
				.then(function(response){
					$log.debug(response)
					if(response){
						$scope.error_message = response;
					} else {
						MessageShow.MessageShow("注册成功",1000);
						EventService.broadcast("update");
						setTimeout(function(){
							$state.transitionTo(laststate, {},{reload: true, notify:true});
						},1000)
					}
				},function(error){
					MessageShow.MessageShow("网络错误",1000);
				})
		}
	}
}])

;
