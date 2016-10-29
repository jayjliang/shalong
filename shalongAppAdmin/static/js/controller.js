angular.module('App')


.controller('AdminHomeCtrl', ['$scope','$ionicPopup','$log','$ionicModal','$rootScope','callApi','Admin','MessageShow','$ionicScrollDelegate','$state', function($scope,$ionicPopup,$log,$ionicModal,$rootScope,callApi,Admin,MessageShow,$ionicScrollDelegate,$state){
	var user = Admin.getCurrentUser();
	var pagenumber = 1;
	var pagesize=5;
	var scrollState=true;

	var jianzhi_info = []
	var getList = function(pagenumber,callback,type){
		var token = user.token;
		callApi.getData("/item/admin/list","POST",{"pagenumber":pagenumber,"pagesize":pagesize},token)
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
				} else if(response.code==401){
					$state.go('adminLogin');
					MessageShow.MessageShow(response.content,1000);
				} else {
					$scope.scrollState=false;
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
			var start = data[i].start_time;
			data[i].time = start;
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
		pagenumber = 1;
		$scope.scrollState=true;
		getList(pagenumber,function(){
			$scope.$broadcast("scroll.refreshComplete");
		},2);
	}

	$scope.down = function(item){
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
           				callApi.getData("/item/admin/down","POST",{"iid":item.iid},user.token)
							.then(function(response){
				                if(response.code==200){
				                	item.state=0;
				                	MessageShow.MessageShow("下线成功",1000);
				                } else {
				                	MessageShow.MessageShow(response.content,1000);
				                }
							}, function(error){
								MessageShow.MessageShow("网络错误",1000);
							})
           			}
           		}
           ],
           template: '<p>确定下线该兼职?</p>'
         });
		
	}
	var get_detail = function(iid){
		callApi.getData("/comment/admin/list","POST",{"iid":iid},user.token)
			.then(function(response){
				if(response.code==200){
					$scope.current_item_record = response.content;
					$scope.current_item_record.number = response.content.length || 0;
					if(response.content.length<1){
						$scope.current_item_record.is_empty=true;
					}
				} else {
					MessageShow.MessageShow("获取评论详细失败",1000);
				}
			},function(error){
				MessageShow.MessageShow("获取评论详细失败",1000);
			})
	}

	$scope.operate_record = function(item,state){
		callApi.getData("/record/admin/change","POST",{"rid":item.rid,"state":state},user.token)
			.then(function(response){
					if(response.code==200){
						MessageShow.MessageShow("操作成功",1000);
						item['state'] = state;
					} else {
						MessageShow.MessageShow(response.content,1000);
					}
				}, function(error){
					MessageShow.MessageShow("网络错误",1000);
				})
	}
	$scope.detail = function(item){
		$scope.current_item = item;
		get_detail(item.iid);
		$scope.modal.show();

	}

	$scope.quit = function(){
		$scope.modal.hide();
	}


	function init(){
		console.log(Admin.judgeUser());
		if(Admin.judgeUser()){
			MessageShow.MessageShow("请先登录",1000);
			$state.go("adminLogin");
		} else {
			getList(pagenumber,function(){
			},0);
			$ionicModal.fromTemplateUrl('detail.html',{
				scope:$scope,
				animation:'slide-in-up'
			}).then(function(modal){
				$scope.modal = modal;
			});
			

		}
	};
	$rootScope.$on("update",function(){
			console.log('update');
			$scope.scrollState=true;
			getList(pagenumber,function(){
			},0);

		});
	$scope.jianzhi_info = jianzhi_info;
	$scope.scrollState = scrollState;
	init();
}])


.controller('adminLoginCtrl', ['Admin','$scope','$log','MessageShow','$state','$stateParams','EventService',
		function(Admin,$scope,$log,MessageShow,$state,$stateParams,EventService){
	$scope.formData = {
		'login_username':'',
		'login_password':''
	};
	var laststate = "admin.jianzhi";

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
			Admin.login($scope.formData.login_username,$scope.formData.login_password)
				.then(function(response){
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

.controller('NewCtrl', ['$scope','Admin','MessageShow','callApi','$state','EventService','$rootScope', function($scope,Admin,MessageShow,callApi,$state,EventService,$rootScope){
	console.log("start");
	var user = Admin.getCurrentUser();
	var info = {
		'wanted_number':'',
		'location':'',
		'detail':'',
		'start_time':'',
		'topic':''
	}
	
	var check_info = function(){
		for(i in info){
				if(info[i].length<1){
					return "基础信息不能为空";
				}
		}
		return null;
	}
	var new_info = function(){
		var error = check_info();
		if(error){
			$scope.error_message =error;
		} else {
			callApi.getData("/item/admin/new","POST",info,user.token)
				.then(function(response){
					if(response.code!=200){
	                    MessageShow.MessageShow(response.content,2000);
	                } else {
	                	$state.go("admin.home");
	                    MessageShow.MessageShow("发布成功",1000);
	                }
				},function(error){
					MessageShow.MessageShow("网络错误",2000);
				})
			}
	}

    $scope.info = info;
    $scope.newJianzhi = new_info;
    
    function init () {
    	if(Admin.judgeUser()){
    		MessageShow.MessageShow("请先登录",1000);
    		$state.go("adminLogin");
    	}
    }
    init();
}])


;