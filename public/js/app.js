(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.accordion', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip',
                                    'ui.gravatar', 'xeditable', 'ngSanitize', 'ngStorage'])
		.config(['$routeProvider', '$locationProvider',
			function($routeProvider, $locationProvider) {
				$routeProvider
                    .when('/login', {
                        templateUrl: 'views/templates/login.html',
                        controller: 'AuthCtrl'
                    })
                    .when('/trello/:project_id', {
                        templateUrl: 'views/templates/view.html',
                        controller: 'DashboardCtrl'
                    })
                    .otherwise({
                        redirectTo: '/login'
                    });

                $locationProvider.html5Mode(true);
            }
        ])
        .run(function(editableOptions) {
            editableOptions.theme = 'bs3';
        });
})();