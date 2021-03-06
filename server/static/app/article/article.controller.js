(function() {
    'use strict';

    angular
        .module('blogapp.article')
        .controller('ArticleController', ArticleController);

    ArticleController.$inject = ['ArticleService', 'Restangular', '$uibModal', 'AuthService'];

    function ArticleController(ArticleService, Restangular, $uibModal, AuthService) {
        var vm = this;

        vm.articleData = null;
        vm.noData = false;
        vm.deleteResource = deleteResource;
        vm.ArticleService = ArticleService;
        vm.openEditArticleDialog = openEditArticleDialog;
        vm.openNewArticleDialog = openNewArticleDialog;
        vm.checkAccess = checkAccess;
        vm.isAuthenticated = AuthService.isAuthenticated;
        vm.getUID = AuthService.getUID;

        vm.ArticleService.getAllArticleData().then(function(response) {
            vm.articleData = response;
            if (response.length == 0) {
                vm.noData = true;
            }
        }, function(error) {
            vm.error = true;
            vm.errorHeading = error.data.error;
            vm.errorDescription = error.data.description;
        });

        function openEditArticleDialog(item, idx) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'static/app/article/edit-article-resource.html',
                controller: ['$uibModalInstance', 'item', 'articleData', 'ArticleService', 'Restangular', '$state', 'idx', EditModalController],
                controllerAs: 'vm',
                resolve: {
                    idx: function() { return idx; },
                    articleData: function() { return vm.articleData; },
                    item: function(Restangular) {
                      return Restangular.one('article', item.id).get();
                    }
                }
            });
        }

        function deleteResource(item, idx) {
            Restangular.one("article", item.id).remove();
            vm.articleData.splice(idx, 1);
        }

        function checkAccess(article_author){
              var result = false;
              var current_user = AuthService.getUser();
              if (current_user !== null) {
                  var current_uid = current_user["id"];
                  var roles = current_user["roles"];
                  if (article_author === current_uid || roles.indexOf("admin") > -1) {
                      result = true;
                  }
                  else {
                      result = false;
                  }
              }
              else { result = false; }
              return result;
        }

        function openNewArticleDialog() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'static/app/article/new-article-resource.html',
                controller: ['$uibModalInstance', 'articleData', 'ArticleService', 'Restangular', '$state', 'create_uid', NewModalController],
                controllerAs: 'vm',
                resolve: {
                    create_uid: function() { return AuthService.getUID(); },
                    articleData: function() { return vm.articleData; },
                }
            });
        }

  }  // <-- ArticleController

    EditModalController.$inject = ['$uibModalInstance', 'item', 'articleData', 'ArticleService', 'Restangular', '$state', 'idx']
    function EditModalController($uibModalInstance, item, articleData, ArticleService, Restangular, $state, idx) {
        var vm = this;
        var original = item;
        vm.item = Restangular.copy(original);
        vm.articleData = articleData;

        vm.updateResource = function() {
            vm.item.put().then(function(updatedItem) {
                vm.articleData[idx] = updatedItem;
                $uibModalInstance.close();
            });
        };

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }  // <-- EditModalController


    NewModalController.$inject = ['$uibModalInstance', 'articleData', 'ArticleService', 'Restangular', '$state', 'create_uid']
    function NewModalController($uibModalInstance, articleData, ArticleService, Restangular, $state, create_uid) {
        var vm = this;
        vm.articleData = articleData;

        vm.addResource = function() {
            var resourceData = {
                title: vm.title,
                text: vm.text,
                author: create_uid
            }
            ArticleService.addArticleData(resourceData).then(function(response) {
                vm.articleData.push(response);
            });

            vm.title = '';
            vm.text = '';

            $uibModalInstance.close();
        };

        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

    } // <-- NewModalController

})();
