(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap', 'ngRoute', 'ui.sortable', 'ngImg', 'xeditable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip'])
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
                $scope.styleUrl = 'templates/' + $scope.page + '/style.css'
            });

            $http.get('/dashboard/load').success(function(data, status) {
                $scope.dashboard = data.dashboard;
            }).error(function(err, status) {
                console.log('error: # ' + status + ', message: ' + err);
            });

        }]);

    angular.module('trelloRedmine').run(function(editableOptions){
        editableOptions.theme = 'bs3';
    })
})();