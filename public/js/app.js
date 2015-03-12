(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.accordion', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip',
                                    'ui.gravatar', 'xeditable', 'ngSanitize', 'ngStorage', 'angularFileUpload'])
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
        })
        .run( function($rootScope, $location, $localStorage) {
            // register listener to watch route changes
            $rootScope.$on( "$routeChangeStart", function(event, next, current) {
                if($localStorage.current_api_key) {
                    if(next.templateUrl == "views/templates/login.html" ){
                        $location.path('/trello/' + $localStorage.first_project_id);
                    }
                }     
            });
        })
})();