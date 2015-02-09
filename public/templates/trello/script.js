angular.module('trelloRedmine')

.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http',
    function($scope, $timeout, $modal, $http) {
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

        $scope.widgets = [];

        $scope.clear = function() {
            $scope.widgets = [];
        };

        $scope.startIndex = -1;
        $scope.moved = false;

  //       $scope.$watch(watchWidgetsList, function(newVal, oldVal) {
		// 	if(!angular.equals(newVal, oldVal)) {
		// 		// only save dashboard if change happened
		// 		var dashboard = {
		// 			"dashboard": {
		// 				"widgets": $scope.widgets
		// 			}
		// 		};

		// 		$http.post('/dashboard/save', dashboard)
		// 		.success(function(data, status){
		// 			console.log(status)
		// 		}).error(function(err, status){
		// 			console.log(err);
		// 		});

		// 		console.log(dashboard);
		// 		delete dashboard;
		// 	}
		// }, true);

		// function watchWidgetsList() {
		//   return $scope.widgets.map(watchCardsList);
		// }

		// function watchCardsList (widget) {
		//   return widget.cards.map(cardValue);
		// }

		// function cardValue(card) {
		// 	return card;
		// }

        $scope.editCard = function(widget, card) {
            $modal.open({
                scope: $scope,
                templateUrl: 'templates/trello/edit_card.html',
                controller: 'EditCardCtrl',
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

        $http.get('/dashboard/load').success(function(data, status) {
            $scope.widgets = data.dashboard.widgets;
        }).error(function(data, status) {
            $scope.widgets.push({
                title: "Error #" + $scope.widgets.length,
                sizeX: 1,
                sizeY: 1,
                cards: [{
                    title: 'my card'
                }, {
                    title: 'another one'
                }]
            });
        });

        $scope.addWidget = function() {
            $scope.widgets.push({
                title: "Userstory #" + $scope.widgets.length,
                sizeX: 1,
                sizeY: 1,
                cards: [{
                    thumb: "http://cssdeck.com/uploads/media/items/2/2v3VhAp.png",
                    title: 'my card'
                }, {
                    thumb: "http://cssdeck.com/uploads/media/items/6/6f3nXse.png",
                    title: 'another one'
                }]
			});
		};

        $scope.sortableTemplates = {
            connectWith: '.connectedSortable',
            dropOnEmpty: true,
            'ui-floating': true,
            stop: function(event, ui) {
            	var index = ui.item.sortable.index;
            	var targetIndex = ui.item.sortable.dropindex;
            	var moved = ui.item.sortable.received;
            	if(moved || targetIndex !== undefined && (targetIndex !== index)) {
            		$scope.updateBackend();
            	}
                $(ui.item).find("#overlay").show();
                setTimeout(function() {
                    $(ui.item).find("#overlay").hide();
                }, 1000);
            }
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
                title: '',
                thumb: ''
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

// .directive('cardWatch', function() {
// 	function link($scope, elem, attributes, ngmodel) {
// 		// link function to watch specific dom element
// 		console.log(ngmodel);
// 		$scope.$watch(ngmodel, function(newVal, oldVal){
// 			console.log('New: ' + newVal);
// 			console.log('Old: ' + oldVal);
// 		});
// 	}

// 	return({
// 		require: 'ngModel',
// 		link: link,
// 		restrict: 'A'
// 	});
// })

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