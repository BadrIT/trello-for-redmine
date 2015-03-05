
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
            // I think it need more restructure to improve performence 
            var storyId = card.id;
            var projectId = card.project.id;
            var subTasks = [];
            var issues = [];
            $scope.subTasks = [];
            $scope.progress = 0;
            $scope.finishedTasks = 0;

            redmineService.getStoryTasks(projectId, storyId)
            .then(function (result) {
                issues = result.data.issues;
                angular.forEach(issues, function(issue) {    
                    if (issue.parent && issue.parent.id == storyId) {
                        if (issue.status.id == 14) $scope.finishedTasks++;
                        this.push(issue);
                    }
                }, subTasks);

                $scope.subTasks = subTasks;
                $scope.calculateProgress();

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
            }, function (error) {
                console.log(error);
            });

            $scope.$watchCollection('subTasks', function(newSubTasks, oldSubTasks) {
                if(newSubTasks.length > 0 ) {
                    for (var i = 0; i < newSubTasks.length; i++) {
                        if(newSubTasks[i].assigned_to) {
                            var assign_to_id = newSubTasks[i].assigned_to.id;
                            getUserInfo(i, assign_to_id);
                        } 
                    };
                }
            });

            function getUserInfo(index, assign_to_id) {
                redmineService.getUserInfo(assign_to_id)
                .then(function (result) {
                    console.log(index)
                    $scope.subTasks[index].assigned_to = result.data;
                    console.log(JSON.stringify($scope.subTasks[index].assigned_to.mail))
                });
            };
        }

        $scope.calculateProgress = function () {
            $scope.progress = ( $scope.subTasks.length == 0) ? 0 : parseInt(( $scope.finishedTasks / $scope.subTasks.length ) * 100);
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
        };

        $scope.getConfigData = function() {
            $http.get('/settings/config')
            .success(function(data, status){
                console.log(data.host);
                $scope.config = data;
            }).error(function(err, status){
                console.log(err);
            });
        };

        //get config data
        $scope.getConfigData();
    }
])

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

.controller('EditCardCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'card', 'redmineService',

    function($scope, $timeout, $rootScope, $modalInstance, widget, card, redmineService) {
        $scope.widget = widget;
        $scope.status_val = false;
        var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';

        if (card) {
            $scope.card = card;
            $scope.newTask = {
                subject: "",
                project_id: card.project.id,
                parent_issue_id: card.id,
                tracker_id: 4,
                assigned_to_id: assigned_to_id
            };
        } else {
            $scope.card = {
                title: 'New Userstory',
                thumb: '',
                desc: ''
            };
        }

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.submit = function() {
            widget.cards.push($scope.card);
            $modalInstance.close(widget);
            $scope.updateBackend();
        };

        $scope.changeTaskStatus = function(id, state_val) {
            if(state_val) {
                $scope.finishedTasks++;
                $scope.updateIssue(id, {status_id: 14});
            } else {
                $scope.finishedTasks--;
                $scope.updateIssue(id, {status_id: 9});
            }
            $scope.calculateProgress();
        };

        $scope.createNewTask = function() {
            redmineService.createTask($scope.newTask)
            .then(function (result) {
                var issue = result.data.issue;
                $scope.subTasks.push(issue);
                $scope.calculateProgress();
            }, function (error) {
                console.log(error);
            });
        };

        $scope.updateTask = function(task) {
            $scope.updateIssue(task.id, task);
        };

        $scope.deleteTask = function(task) {
            // TODO: find way to handle success and error
            var task_index = $scope.subTasks.indexOf(task);
            $scope.subTasks.splice(task_index, 1);
            redmineService.deleteTask(task.id);
            $scope.calculateProgress();   
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
.directive('inline', function () {
  return {
    template: '<span ng-switch on="edit" >' +
              '<span ng-switch-default>{{value || "insert text"}}<i class="fa fa-pencil-square-o"></i></span>' +
              '<input ng-switch-when="true" type="text" ng-model="$parent.value" placeholder/>' +
              '</span>',
    restrict: 'A',
    scope: {
      inline: '='
    },
    link: function (scope, element, attribs) {
      scope.value = scope.inline;
 
      /* watch for changes from the controller */
      scope.$watch('inline', function (val) {
        scope.value = val;
      });
 
      /* enable inline editing functionality */
      var enablingEditing = function () {
        scope.edit = true;
 
        setTimeout(function () {
          console.log(element.children().children('input'));
          element.children().children('input')[0].focus();
          element.children().children('input').bind('blur', function (e) {
            scope.$apply(function () {
              disablingEditing();
            });
          });
        }, 100);
      };
 
 
      /* disable inline editing functionality */
      var disablingEditing = function () {
        scope.edit = false;
        scope.inline = scope.value;
      };
 
 
      /* set up the default */
      disablingEditing();
 
 
      /* when the element with the inline attribute is clicked, enable editing */
      element.bind('click', function (e) {
 
        if ((e.target.nodeName.toLowerCase() === 'span') || (e.target.nodeName.toLowerCase() === 'img')) {
          scope.$apply(function () { // bind to scope
            enablingEditing();
          });
        }
      });
 
      /* allow editing to be disabled by pressing the enter key */
      element.bind('keypress', function (e) {
 
        if (e.target.nodeName.toLowerCase() != 'input') return;
 
        var keyCode = (window.event) ? e.keyCode : e.which;
 
        if (keyCode === 13) {
          scope.$apply(function () { // bind scope
            disablingEditing();
          });
        }
      });
    }
  }
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
})
.directive('ngConfirmClick', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
}]);