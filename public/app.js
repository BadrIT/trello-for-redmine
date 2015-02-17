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

            this.getUserInfo = function (user_id) {
                var query = users_url + user_id;
                var deferred = $q.defer();

                $http.get(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            this.getUserProjects = function (user_id) {
                var query = users_url + user_id + '/projects';
                var deferred = $q.defer();

                $http.get(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            this.getProjectByID = function (project_id) {
                var query = projects_url + project_id;
                var deferred = $q.defer();

                $http.get(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            this.getProjectUserStories = function (project_id) {
                var query = projects_url + project_id + '/userstories';
                var deferred = $q.defer();

                $http.get(query)
                .then(function (result) {
                    deferred.resolve(result);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };
        }])
        .controller('RootCtrl', ['$scope', 'redmineService', '$http', function($scope, redmineService, $http) {
            $scope.current_user = {};
            $scope.user_projects = [];
            $scope.current_project = {};
            $scope.widgets = [];

            redmineService.getUserProjects('current')
            .then(function (result) {
                $scope.current_user = result.data.user;
                $scope.user_projects = result.data.user.memberships;
            });

            $scope.$on('$locationChangeStart', function(e, next, current) {
                var project_template = next.split('/').splice(-2);
                $scope.page = project_template[0];
                $scope.project_id = project_template[1];

                if($scope.page) {
                    $scope.styleUrl = 'templates/' + $scope.page + '/style.css';
                }

                redmineService.getProjectByID($scope.project_id)
                .then(function (result) {
                    $scope.current_project = result.data;
                });

                redmineService.getProjectUserStories($scope.project_id)
                .then(function (result) {
                    $scope.widgets = result.data;
                });
            });
        }]);
})();