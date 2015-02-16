(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip'])
		.config(['$routeProvider', '$locationProvider',
			function($routeProvider, $locationProvider) {
				$routeProvider
                    .when('/trello', {
                        templateUrl: 'templates/trello/view.html',
                        controller: 'DashboardCtrl'
                    })
                    .otherwise({
                        redirectTo: '/trello'
                    });

                $locationProvider.html5Mode(true);
            }
        ])
        .controller('RootCtrl', ['$scope', '$http', function($scope, $http) {
            $scope.$on('$locationChangeStart', function(e, next, current) {
                $scope.page = next.split('/').splice(-1);
                if($scope.page) {
                    $scope.styleUrl = 'templates/' + $scope.page + '/style.css';
                }
                $scope.project_id = 'trello-for-redmine';
                $scope.load_project = function () {
                    $http.get('/redmine/projects/' + $scope.project_id).success(function (data) {
                        $scope.project = data;
                    }).error(function (err) {
                        console.log(err);
                    });
                };
            });

            $http.get('/dashboard/load').success(function(data, status) {
                $scope.dashboard = data.dashboard;
            }).error(function(err, status) {
                console.log('error: # ' + status + ', message: ' + err);
            });

        }]);
})();