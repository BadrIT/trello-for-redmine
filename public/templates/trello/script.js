angular.module('trelloRedmine')

.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', 'redmineService',
    function($scope, $timeout, $modal, $http, redmineService) {
        $scope.gridsterOptions = {
            margins: [20, 20],
            columns: 3,
            draggable: {
                handle: '.box-header'
            },
            swapping: true,
            resizable: {
                handles: ['s']
            }
        };

        $scope.clear = function() {
            $scope.widgets = [];
        };

        $scope.startIndex = -1;
        $scope.moved = false;

        $scope.editCard = function(widget, card) {
            $modal.open({
                scope: $scope,
                templateUrl: 'templates/trello/edit_card.html',
                controller: 'EditCardCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    },
                    card: function() {
                        return card;
                    }
                }
            });
        }

        $scope.sortableTemplates = {
            connectWith: '.connectedSortable',
            dropOnEmpty: true,
            'ui-floating': true,
            stop: function(event, ui) {
            	var index = ui.item.sortable.index;
            	var targetIndex = ui.item.sortable.dropindex;
            	var moved = ui.item.sortable.received;
            	if(moved || targetIndex !== undefined && (targetIndex !== index)) {
            		$scope.updateIssue(ui.item.attr('id'), {
                        status_id: ui.item.sortable.droptarget.attr('widget-status')
                    });
            	}
                $(ui.item).find("#overlay").show();
                setTimeout(function() {
                    $(ui.item).find("#overlay").hide();
                }, 1000);
            }
        };

        $scope.updateIssue = function(issue_id, updated_data) {
            redmineService.updateIssue(issue_id, updated_data)
            .then(function (result) {
                console.log(result);
            }, function (error) {
                console.log(error);
            });
        };

        $scope.updateBackend = function() {
        	var dashboard = {
				"dashboard": {
					"widgets": $scope.widgets
				}
			};

			$http.post('/dashboard/save', dashboard)
			.success(function(data, status){
				console.log(status)
			}).error(function(err, status){
				console.log(err);
			});

			console.log(dashboard);
			delete dashboard;
        }
    }
])

.controller('CustomWidgetCtrl', ['$scope', '$modal',
    function($scope, $modal) {

        $scope.remove = function(widget) {
            $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
        };

        $scope.openSettings = function(widget) {
            $modal.open({
                scope: $scope,
                templateUrl: 'templates/trello/widget_settings.html',
                controller: 'WidgetSettingsCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    }
                }
            });
        };

    }
])

.controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget',
    function($scope, $timeout, $rootScope, $modalInstance, widget) {
        $scope.widget = widget;

        $scope.form = {
            name: widget.title,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row
        };

        $scope.sizeOptions = [{
            id: '1',
            name: '1'
        }, {
            id: '2',
            name: '2'
        }, {
            id: '3',
            name: '3'
        }, {
            id: '4',
            name: '4'
        }];

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };

    }
])

.controller('EditCardCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'card',

    function($scope, $timeout, $rootScope, $modalInstance, widget, card) {
        $scope.widget = widget;
        if (card)
            $scope.card = card;
        else
            $scope.card = {
                title: 'New Userstory',
                thumb: '',
                desc: ''
            };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.submit = function() {
            widget.cards.push($scope.card);
            $modalInstance.close(widget);
            $scope.updateBackend();
        };

    }
])

.directive('customPopover', function($popover) {
    return {
        restrict: 'A',
        scope: {
            data: '=',
        },
        link: function(scope, elem, attrs) {
            $popover(elem, {
                title: attrs.title,
                contentTemplate: attrs.contentTemplate,
                autoClose: true
            });
        }
    };
})
// helper code
.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for (i in input) {
            out.push(input[i]);
        }
        return out;
    }
});