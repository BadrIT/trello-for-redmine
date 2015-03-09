(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.accordion', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip',
                                    'ui.gravatar', 'xeditable', 'ngSanitize', 'ngStorage'])
		.config(['$routeProvider', '$locationProvider',
			function($routeProvider, $locationProvider) {
				$routeProvider
                    .when('/login', {
                        templateUrl: 'templates/trello/login.html',
                        controller: 'AuthCtrl'
                    })
                    .when('/trello/:project_id', {
                        templateUrl: 'templates/trello/view.html',
                        controller: 'DashboardCtrl'
                    })
                    .otherwise({
                        redirectTo: '/trello/trello-for-redmine'
                    });

                $locationProvider.html5Mode(true);
            }
        ])
        .service('redmineService', ['$http', '$q', '$localStorage', function ($http, $q, $localStorage){
            var users_url = '/redmine/users/';
            var projects_url = '/redmine/projects/';
            var issues_url = '/redmine/issues/';
            var current_api_key = $localStorage.current_api_key;

            function get (query) {
                var deferred = $q.defer();
                $http.get(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function put (query, body) {
                var deferred = $q.defer();

                $http.put(query, body)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function post (query, body) {
                var deferred = $q.defer();

                $http.post(query, body)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            function remove (query) {
                var deferred = $q.defer();

                $http.delete(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            this.getUserInfo = function (user_id) {
                var query = users_url + user_id + "/" + current_api_key;
                console.log(query);
                return get(query);
            };
            
            this.getUserProjects = function (user_id) {
                var query = users_url + user_id + '/projects' + "/" + current_api_key;
                return get(query);
            };

            this.getProjectByID = function (project_id) {
                var query = projects_url + project_id + "/" + current_api_key;
                return get(query);
            };

            this.getProjectUserStories = function (project_id) {
                var query = projects_url + project_id + '/userstories' + "/" + current_api_key;
                return get(query);
            };

            this.updateIssue = function (issue_id, updated_data) {
                var query = issues_url + issue_id + "/" + current_api_key;
                return put(query, updated_data);
            };

            this.getIssuesStatuses = function () {
                var query = '/redmine/issue_statuses' + "/" + current_api_key;
                return get(query);
            };

            this.getStoryTasks = function(project_id, issue_id) {
                var query = projects_url + project_id  + '/issues/' + issue_id + "/" + current_api_key;
                return get(query);
            };

            this.createTask = function (data) {
                var query = '/redmine/create/issue' + "/" + current_api_key;
                return post(query, data);
            };

            this.deleteTask = function (issue_id) {
                var query = issues_url + issue_id + "/" + current_api_key;
                return remove(query);
            };

            this.getProjectMembers = function (project_id) {
                var query = projects_url + project_id + '/memberships' + "/" + current_api_key;
                return get(query);
            };

            this.authUser = function (data) {
                var query = '/redmine/login/user';
                return post(query, data);
            };
        }])
        .controller('RootCtrl', ['$scope', 'redmineService', '$http', '$localStorage', function($scope, redmineService, $http, $localStorage) {
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

            $scope.$on('$locationChangeStart', function(e, next, current) {
                var project_template = next.split('/').splice(-2);
                $scope.page = project_template[0];
                $scope.project_id = project_template[1];

                if(!$scope.page && !$scope.project_id) return; 
                
                $scope.styleUrl = 'templates/' + $scope.page + '/style.css';

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
                
            });
        }])
        .controller('AuthCtrl', ['$scope', 'redmineService', '$location', '$localStorage',
            function($scope, redmineService, $location, $localStorage) {
                $scope.username = "";
                $scope.password = "";
                $scope.login = function() {
                    var user ={
                        "username" : $scope.username,
                        "password" : $scope.password
                    };

                    redmineService.authUser(user)
                    .then(function(result){
                        console.log(JSON.stringify(result))
                        $localStorage.current_api_key =  result.data.user.api_key;
                        $location.path('/trello/' + result.data.first_project_id);
                    }, function (error) {
                        alert(error.data.msg);
                        console.log(error);
                    });
                };
            }
        ])
        .run(function(editableOptions) {
            editableOptions.theme = 'bs3';
        });
})();