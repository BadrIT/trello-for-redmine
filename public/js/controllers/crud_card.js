angular.module('trelloRedmine')
.controller('CrudCardCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'card', 'redmineService', 'filterFilter', '$sce', '$upload', '$localStorage',
    function($scope, $timeout, $rootScope, $modalInstance, widget, card, redmineService, filterFilter, $sce, $upload, $localStorage) {
        
        $scope.widget = widget;
        $scope.status_val = false;
        $scope.dropAreaState = false;
        $scope.estimateSizes = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 60, 100, 200];
        $scope.storySize = 0;
        $scope.businessValue = 0;
        $scope.release = 0;

        var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';
        var priority_to_id = (card.priority_to) ? card.priority.id : '';

        if (card) {
            $scope.card = card;
            $scope.newTask = {
                subject: "",
                description: "",
                priority_id: priority_to_id,
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
        
        $scope.getCustomeFieldValues = function () {
            $scope.card.custom_fields.forEach(function(field){
                if(field.name == "Story-size") $scope.storySize = field.value;
                if(field.name == "Business Value") $scope.businessValue = field.value;
                if(field.name == "Release") $scope.release = field.value;
            });
        };

        $scope.getCustomeFieldValues();

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.submit = function() {
            widget.cards.push($scope.card);
            $modalInstance.close(widget);
            $scope.updateBackend();
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

        $scope.deleteAttachment = function(attachment_id, id) {
            $scope.card.attachments.splice(id, 1); 
            redmineService.deleteAttachment(attachment_id)
            .then(function (result) {
                console.log(result);
                if($scope.card.attachments.length == 0) {
                    $scope.card.last_image = null;
                    $scope.card.hasAttachments = false;
                } else {
                    $scope.getLastImage($scope.card);
                }
                
            }, function (error) {
                console.log(error);
            });
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

                        redmineService.getIssueAttachments($scope.card.id)
                        .then(function (result) {
                            $scope.card.attachments = result.data.issue.attachments;
                            $scope.card.hasAttachments = true;
                            $scope.getLastImage($scope.card);
                        }, function (error) {
                            console.log(error);
                        });
                        console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                    });
                }
            }
        };
    }
]);