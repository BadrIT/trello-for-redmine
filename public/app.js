(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap', 'ngRoute', 'ui.sortable', 'ngImg'])
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
        .controller('RootCtrl', function ($scope) {
            $scope.$on('$locationChangeStart', function (e, next, current) {
                $scope.page = next.split('/').splice(-1);
                $scope.styleUrl = 'templates/' + $scope.page + '/style.css'
            });
        });
})();