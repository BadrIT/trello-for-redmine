angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', 'redmineService', '$localStorage', '$location', '$sce',
    function($scope, $timeout, $modal, $http, redmineService, $localStorage, $location, $sce) {

        $scope.current_user = {};
        $scope.user_projects = [];
        $scope.widgets = [];
        $scope.card = {};
        $scope.card.attachments = [];
        $scope.activities = [];
        $scope.projectMembers = [];

        $scope.styleUrl = 'assets/stylesheets/cards_style.css';
        // TODO: make it dynamic
        $scope.allowed_statuses = [8, 9, 10];

        $scope.setCurrentUser = function (api_key) {
            $localStorage.current_api_key = api_key;
        };

        var project_url = $location.path().split('/');
        $scope.project_id = project_url[2];

        if(!$scope.project_id) return; 

        $scope.priorities = [];

        redmineService.getProjectMembers($scope.project_id)
        .then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(error);
        });

        redmineService.getIssuePriorities()
        .then(function (result) {
            $scope.priorities = result.data.issue_priorities;
        }, function (error) {
            console.log(error);
        });

        /*$scope.allowed_statuses = [8, 9, 10];
        $scope.getUserLists = function() {
            $http.get('/settings/config/lists/' + $localStorage.current_api_key)
            .success(function(data, status){
                console.log(data)
                if(data) {
                    $scope.allowed_statuses = data.split(",");
                } else {
                    $scope.allowed_statuses = [8,9,10,11];
                }
            }).error(function(err, status){
                $scope.allowed_statuses = [8,9,10];
                console.log(err);
            });
        };

        $scope.getUserLists();*/

        redmineService.getUserProjects('current')
        .then(function (result) {
            $scope.current_user = result.data.user;
            $scope.user_projects = result.data.user.memberships;
        });

        redmineService.getIssuesStatuses()
        .then(function (result) {
            $scope.widgets = result.data;
            console.log($scope.widgets)
            // TODO: do it in better way
            for(var i = 0; i < $scope.allowed_statuses.length; i++) {
                $scope.widgets[$scope.allowed_statuses[i] - 1].allowed = true;
            }
        }); 

        /*redmineService.getProjectMembers($scope.project_id)
        .then(function (result) {
            angular.forEach(result.data.memberships, function(membership) {  
                var member = {
                    "id": membership.user.id,
                    "name": membership.user.name
                };
                this.push(member);
            }, $scope.projectMembers);
        }, function (error) {
            console.log(error);
        });*/

        redmineService.getProjectUserStories($scope.project_id)
        .then(function (result) {
            
            for(var i = 0; i < $scope.widgets.length; i++) {
                $scope.widgets[i].cards = [];
            }

            for(var key in result.data) {
                if(result.data.hasOwnProperty(key)) {
                    $scope.widgets[key - 1].cards = result.data[key];
                    
                    //get user data
                    for(var card_key in $scope.widgets[key - 1].cards) {
                        var card = $scope.widgets[key - 1].cards[card_key];
                        card.showDetails = false;

                        var getAttachments = function(card) {
                            redmineService.getIssueAttachments(card.id)
                            .then(function (result) {
                                card.attachments = result.data.issue.attachments;
                                if(card.attachments.length > 0) {
                                    card.hasAttachments = true;
                                } else {
                                    card.hasAttachments = false;
                                }
                                $scope.getLastImage(card)
                            }, function (error) {
                                console.log(error);
                            });
                        }

                        var getSubTasks = function(card){
                            var storyId = card.id;
                            var projectId = card.project.id;
                            var issues = [];                        
                            var subTasks = [];

                            card.finishedTasks = 0;
                            card.subTasks = [];

                            redmineService.getStoryTasks(projectId, storyId)
                            .then(function (result) {
                                issues = result.data.issues;
                                angular.forEach(issues, function(issue) {    
                                    if (issue.parent && issue.parent.id == storyId) {
                                        if (issue.status.id == 14) card.finishedTasks++;
                                        this.push(issue);
                                    }
                                }, subTasks);

                                card.subTasks = subTasks;
                            }, function (error) {
                                console.log(error);
                            });
                        }

                        getSubTasks(card);
                        getAttachments(card);
                    }
                }
            }
        });
      
        $scope.gridsterOptions = {
            margins: [20, 20],
            columns: 3,
            draggable: {
                handle: '.box-header'
            },
            swapping: true,
            resizable: {
                handles: ['s']
            }
        };

        $scope.clear = function() {
            $scope.widgets = [];
        };

        $scope.startIndex = -1;
        $scope.moved = false;

        $scope.editCard = function(widget, card) { 
            // I think it need more restructure to improve performence 
            var storyId = card.id;
            var projectId = card.project.id;
            var subTasks = [];
            var issues = [];
            $scope.subTasks = [];
            $scope.progress = 0;
            $scope.finishedTasks = 0;
         
            $scope.attachments = [];
            
          

            $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/edit_card.html',
                controller: 'CrudCardCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    },
                    card: function() {
                        return card;
                    }
                }
            });
        }

        $scope.sortableTemplates = {
            connectWith: '.connectedSortable',
            dropOnEmpty: true,
            'ui-floating': true,
            stop: function(event, ui) {
            	var index = ui.item.sortable.index;
            	var targetIndex = ui.item.sortable.dropindex;
            	var moved = ui.item.sortable.received;
            	if(moved || targetIndex !== undefined && (targetIndex !== index)) {
            		$scope.updateIssue(ui.item.attr('id'), {
                        status_id: ui.item.sortable.droptarget.attr('widget-status')
                    });
            	}
                $(ui.item).find("#overlay").show();
                setTimeout(function() {
                    $(ui.item).find("#overlay").hide();
                }, 1000);
            }
        };

        $scope.updateIssue = function(issue_id, updated_data, card) {
            redmineService.updateIssue(issue_id, updated_data)
            .then(function (result) {
                if(updated_data.parent) {
                    var task_index = 0;
                    for (var i = 0; i < card.subTasks.length; i++) {
                        if (card.subTasks[i].id == updated_data.id ){
                            task_index = i;
                            break;
                        } 
                    };
                    card.subTasks[task_index] = result.config.data;
                    if(result.config.data.assigned_to_id) getUserInfo(task_index, result.config.data.assigned_to_id);
                    if(result.config.data.status_id) {
                        card.subTasks[task_index].status.id = result.config.data.status_id;
                    }
                }               
            }, function (error) {
                console.log(error);
            });
        };

        $scope.updateBackend = function() {
        	var dashboard = {
				"dashboard": {
					"widgets": $scope.widgets
				}
			};

			$http.post('/dashboard/save', dashboard)
			.success(function(data, status){
				console.log(status)
			}).error(function(err, status){
				console.log(err);
			});

			console.log(dashboard);
			delete dashboard;
        };

        $scope.getConfigData = function() {
            $http.get('/settings/config/' + $localStorage.current_api_key)
            .success(function(data, status){
                console.log(data.host);
                $scope.config = data;
            }).error(function(err, status){
                console.log(err);
            });
        };

       

        $scope.saveUserLists = function() {
            $http.post('/settings/config/lists/' + $localStorage.current_api_key, $scope.allowed_statuses)
            .success(function(data, status){
                console.log(status);
            }).error(function(err, status){
                console.log(err);
            });
        };

        //get config data
        $scope.getConfigData();

        function getUserInfo(index, assign_to_id) {
            redmineService.getUserInfo(assign_to_id)
            .then(function (result) {
                $scope.subTasks[index].assigned_to = result.data;
            });
        };

        function getUserInfoByIssue(issue) {
            if(issue.assigned_to){
                redmineService.getUserInfo(issue.assigned_to.id)
                .then(function (result) {
                    issue.assigned_to = result.data;
                });
            }
        }

        $scope.getImageLink = function(card) {
            if(card.last_image) {
                return card.last_image.content_url;
            } else {
                return "http://blog.no-panic.at/wp-content/uploads/2011/04/redmine_logo_v1.png";
            }
        };

        $scope.getLastImage = function(card) {
            angular.forEach(card.attachments, function(attach) {
                if(attach.content_type.search("image/") >= 0) {
                    card.last_image = attach;
                }
            }, card.last_image);
        };

        $scope.addNewAllowedStatus = function(id, state) {
            if(state) {
                $scope.allowed_statuses.push(id+1);
            } else {
                for (var i = 0; i <  $scope.allowed_statuses.length; i++) {
                    if($scope.allowed_statuses[i]-1 == id){
                        $scope.allowed_statuses.splice(i, 1);
                        break;
                    }
                };
            }
            $scope.saveUserLists();
        }

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };


        redmineService.getActivities($scope.project_id)
        .then(function (result) {
            var data = JSON.parse(result.data);
            angular.forEach(data.activities, function(activity){
                this.push(activity);
            }, $scope.activities)
        });

        $scope.showCardAccordion = function(card) {
            $timeout(function() {
                angular.element("#accord-" + card.id).trigger('click');
            }, 100);
        };

        $scope.changeTaskStatus = function(card, task, state_val) {
            if(state_val) {
                card.finishedTasks++;
                task.status_id = 14;
            } else {
                card.finishedTasks--;
                task.status_id = 9;
            }
            $scope.updateIssue(task.id, task, card);
            $scope.calculateProgress(card);
        };

        $scope.calculateProgress = function (task) {
            task.progress = ( task.subTasks.length == 0) ? 0 : parseInt(( task.finishedTasks / task.subTasks.length ) * 100);
        };
    }
]);