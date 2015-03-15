angular.module('trelloRedmine')
.controller('CrudCardCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'card', 'redmineService', 'filterFilter', '$sce', '$upload', '$localStorage',
    function($scope, $timeout, $rootScope, $modalInstance, widget, card, redmineService, filterFilter, $sce, $upload, $localStorage) {
        $scope.widget = widget;
        $scope.status_val = false;
        $scope.dropAreaState = false;

        var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';

        redmineService.getIssueAttachments(card.id)
        .then(function (result) {
            $scope.attachments = result.data.issue.attachments;
        }, function (error) {
            console.log(error);
        });

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

        $scope.calculateProgress = function () {
            $scope.progress = ( $scope.subTasks.length == 0) ? 0 : parseInt(( $scope.finishedTasks / $scope.subTasks.length ) * 100);
        };

        $scope.calculateProgress();

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.submit = function() {
            widget.cards.push($scope.card);
            $modalInstance.close(widget);
            $scope.updateBackend();
        };

        $scope.changeTaskStatus = function(task, state_val) {
            if(state_val) {
                $scope.finishedTasks++;
                task.status_id = 14;
            } else {
                $scope.finishedTasks--;
                task.status_id = 9;
            }
            $scope.updateTask(task);
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

        $scope.showName = function(task) {
            var selected = filterFilter($scope.projectMembers, {id: task.assigned_to.id});
            return (task.assigned_to.id && selected.length) ? selected[0].name : 'Not set';
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };

        $scope.getTaskColor = function(status_id) {
            switch(status_id) {
                case 8:
                    return "#FF001D";
                case 9:
                    return "#ECA21B";
                case 14:
                    return "#1BEC3D";
            }
        };

        $scope.getlineThroughState = function(status_id) {
            if(status_id == 14) {
                return "text-decoration:line-through";
            } else {
                return "";
            }
        };

        $scope.showDropArea = function() {
            $scope.dropAreaState = !$scope.dropAreaState;
        };

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });

        $scope.upload = function (files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $upload.upload({
                        url: '/redmine/upload/file/' + $scope.card.id + "/" + $localStorage.current_api_key,
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        $scope.attachments = [];
                        redmineService.getIssueAttachments($scope.card.id)
                        .then(function (result) {
                            $scope.attachments = result.data.issue.attachments;
                        }, function (error) {
                            console.log(error);
                        });
                        console.log(JSON.stringify(config))
                        console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                    });
                }
            }
        };
    }
]);