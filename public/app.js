(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap', 'ngRoute', 'ui.sortable'])
		.config(['$routeProvider',
			function($routeProvider) {
				$routeProvider
                    .when('/trello', {
                        templateUrl: 'templates/trello/view.html',
                        controller: 'DashboardCtrl'
                    })
                    .otherwise({
                        redirectTo: '/trello'
                    });
            }
		])
		.controller('RootCtrl', function($scope) {
			$scope.$on('$locationChangeStart', function(e, next, current) {
				$scope.page = next.split('/').splice(-1);
				$scope.styleUrl = 'templates/' + $scope.page + '/style.css'
			});
		});
})();