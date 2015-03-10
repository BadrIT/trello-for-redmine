angular.module('trelloRedmine')
.controller('CustomWidgetCtrl', ['$scope', '$modal', 'redmineService',
    function($scope, $modal, redmineService) {

        $scope.newCard = {
            subject: "",
            project_id: $scope.project_id,
            tracker_id: 5,
            status_id: ''
        };

        $scope.remove = function(widget) {
            $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
        };

        $scope.openSettings = function(widget) {
            $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/widget_settings.html',
                controller: 'WidgetSettingsCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    }
                }
            });
        };

        $scope.addNewCard = function(widget) {
            $scope.newCard.status_id = widget.status_id;
            redmineService.createTask($scope.newCard)
            .then(function (result) {
                var issue = result.data.issue;
                var widget_index = $scope.widgets.indexOf(widget);
                $scope.widgets[widget_index].cards.push(issue);
            }, function (error) {
                console.log(error);
            });
        };

    }
]);
