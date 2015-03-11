angular.module('trelloRedmine')
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
                $localStorage.first_project_id = result.data.first_project_id;
                $location.path('/trello/' + result.data.first_project_id);
            }, function (error) {
                alert(error.data.msg);
                console.log(error);
            });
        };
    }
]);