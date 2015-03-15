angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', 'redmineService', '$localStorage', '$location',
    function($scope, $timeout, $modal, $http, redmineService, $localStorage, $location) {
        $scope.current_user = {};
        $scope.user_projects = [];
        $scope.current_project = {};
        $scope.widgets = [];
       
        var allowed_statuses = [8, 9, 10];

        $scope.setCurrentUser = function (api_key) {
            $localStorage.current_api_key = api_key;
        };

        redmineService.getUserProjects('current')
        .then(function (result) {
            $scope.current_user = result.data.user;
            $scope.user_projects = result.data.user.memberships;
        });

        redmineService.getIssuesStatuses()
        .then(function (result) {
            $scope.widgets = result.data;
            // TODO: do it in better way
            for(var i = 0; i < allowed_statuses.length; i++) {
                $scope.widgets[allowed_statuses[i] - 1].allowed = true;
            }
        });

        var project_template = $location.path().split('/');
        $scope.project_id = project_template[2];
        if(!$scope.project_id) return; 
        
        $scope.styleUrl = 'assets/stylesheets/cards_style.css';

        redmineService.getProjectByID($scope.project_id)
        .then(function (result) {
            $scope.current_project = result.data;
        });

        for(var i = 0; i < $scope.widgets.length; i++) {
            $scope.widgets[i].cards = [];
        }

        redmineService.getProjectUserStories($scope.project_id)
        .then(function (result) {
            for(var key in result.data) {
                if(result.data.hasOwnProperty(key)) {
                    $scope.widgets[key - 1].cards = result.data[key];
                    
                    //get user data
                    for(var card_key in $scope.widgets[key - 1].cards) {
                        var card = $scope.widgets[key - 1].cards[card_key];
                        
                        var retrieve_user_info = function(card){
                            if(card.assigned_to) {
                                var assign_to_id = card.assigned_to.id;
                                redmineService.getUserInfo(assign_to_id)
                                .then(function (result) {
                                    card.assigned_to = result.data;
                                });
                            } 
                        }
                        retrieve_user_info(card);
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
            $scope.projectMembers = [];
            $scope.attachments = [];
            
            redmineService.getProjectMembers(projectId)
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
            });

            redmineService.getStoryTasks(projectId, storyId)
            .then(function (result) {
                issues = result.data.issues;
                angular.forEach(issues, function(issue) {    
                    if (issue.parent && issue.parent.id == storyId) {
                        if (issue.status.id == 14) $scope.finishedTasks++;
                        this.push(issue);
                    }
                }, subTasks);

                $scope.subTasks = subTasks;

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
            }, function (error) {
                console.log(error);
            });

            $scope.$watchCollection('subTasks', function(newSubTasks, oldSubTasks) {
                if(newSubTasks.length > 0 ) {
                    for (var i = 0; i < newSubTasks.length; i++) {
                        if(newSubTasks[i].assigned_to) {
                            var assign_to_id = newSubTasks[i].assigned_to.id;
                            getUserInfo(i, assign_to_id);
                        } 
                    };
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

        $scope.updateIssue = function(issue_id, updated_data) {
            redmineService.updateIssue(issue_id, updated_data)
            .then(function (result) {
                var task_index = 0;
                for (var i = 0; i < $scope.subTasks.length; i++) {
                    if ($scope.subTasks[i].id == updated_data.id ){
                        task_index = i;
                        break;
                    } 
                };
                $scope.subTasks[task_index] = result.config.data;
                if(result.config.data.assigned_to_id) getUserInfo(task_index, result.config.data.assigned_to_id);
                if(result.config.data.status_id) {
                     $scope.subTasks[task_index].status.id = result.config.data.status_id;
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

        //get config data
        $scope.getConfigData();

        function getUserInfo(index, assign_to_id) {
            redmineService.getUserInfo(assign_to_id)
            .then(function (result) {
                $scope.subTasks[index].assigned_to = result.data;
            });
        };
    }
]);