(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip'])
		.config(['$routeProvider', '$locationProvider',
			function($routeProvider, $locationProvider) {
				$routeProvider
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
        .service('redmineService', ['$http', '$q', function ($http, $q){
            var users_url = '/redmine/users/';
            var projects_url = '/redmine/projects/';
            var issues_url = '/redmine/issues/';

            function get (query) {
                var deferred = $q.defer();
                console.log("query .... " + query)
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

            this.getUserInfo = function (user_id) {
                var query = users_url + user_id;
                return get(query);
            };

            this.getUserProjects = function (user_id) {
                var query = users_url + user_id + '/projects';
                return get(query);
            };

            this.getProjectByID = function (project_id) {
                var query = projects_url + project_id;
                return get(query);
            };

            this.getProjectUserStories = function (project_id) {
                var query = projects_url + project_id + '/userstories';
                return get(query);
            };

            this.updateIssue = function (issue_id, updated_data) {
                var query = issues_url + issue_id;
                return put(query, updated_data);
            };

            this.getIssuesStatuses = function () {
                var query = '/redmine/issue_statuses';
                return get(query);
            };

            this.getProjectIssues = function(project_id, issue_id) {
                var query = projects_url + project_id  + '/issues' ;
                return get(query);
            };
        }])
        .controller('RootCtrl', ['$scope', 'redmineService', '$http', function($scope, redmineService, $http) {
            $scope.current_user = {};
            $scope.user_projects = [];
            $scope.current_project = {};
            $scope.widgets = [];
            var allowed_statuses = [8, 9, 10];

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
                        }
                    }
                });
            });
        }]);
})();