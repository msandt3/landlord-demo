angular.module('TenEightLandlord.controllers', [])

.controller('LoginCtrl',function($scope, $state, store, auth){
  $scope.username = '';
  $scope.password = '';

  $scope.login = function() {
    auth.signin({
      authParams: {
        scope: 'openid profile offline_access',
        device: 'Mobile Device'
      }
    }, function (profile, token, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $state.go('buildings');
    });
  }
})

.controller('BuildingCtrl',function($scope,$ionicLoading,$ionicPopup,$state,BuildingsService,
  store,SelectedBuildingsService,SelectedFloorplansService,DealDataService, auth){

  $scope.selectedBuildings = SelectedBuildingsService.get();

  $ionicLoading.show({
    content:'Loading'
  });


  BuildingsService.query().$promise.then(
    function(result){
      $ionicLoading.hide();
      $scope.buildings = result;
    },function(error){
      $ionicLoading.hide();
    });

  $scope.toggleSelection = function(bid){
    var index = $scope.selectedBuildings.indexOf(bid);
    //currently selected
    if(index > -1){
      $scope.selectedBuildings.splice(index,1);
    }else{
      $scope.selectedBuildings.push(bid);
    }
    SelectedBuildingsService.set($scope.selectedBuildings);
    SelectedFloorplansService.clear();

  }

  $scope.next = function(){

    if($scope.selectedBuildings.length == 0 || $scope.selectedBuildings === undefined){
      //show a popup
      $ionicPopup.alert({
        title:'Error!',
        content:'Please Select One or More Buildings'
      }).then(function(res){

      });
    }else{
      $state.go('rsfSelection');
    }
  }

  $scope.logout = function(){
    $ionicPopup.confirm({
      title: 'Log Out',
      content: 'Are you sure you want to log out?'
    }).then(function(res){
      if (res) {
        auth.signout();
        store.remove('profile');
        store.remove('token');
        SelectedBuildingsService.clear();
        SelectedFloorplansService.clear();
        DealDataService.clear();
        $state.go('login');
      }
    });
  }
})

.controller('RSFSelectionCtrl',function($scope, $state, RSFService, SelectedFloorplansService){
  $scope.sizes = RSFService.all();

  SelectedFloorplansService.clear();

  $scope.setSelected = function(index){
    RSFService.setSelected(index);
    $state.go('floorplans');
  }
})

.controller('FloorplanCtrl',function($scope, $ionicLoading, $stateParams, $location, RSFService, TokenService,
  StorageService, SelectedBuildingsService, FloorplansService, SelectedFloorplansService){

  $scope.range = RSFService.getSelected();
  $scope.token = StorageService.get('api_token');
  $scope.buildings = SelectedBuildingsService.get().toString();

  $scope.selectedFloorplans = SelectedFloorplansService.get();

  $ionicLoading.show({
    content:'Loading'
  });


  FloorplansService.query({token:$scope.token,
    building_ids:$scope.buildings,
    sqft_low:$scope.range.sqft_low,
    sqft_high:$scope.range.sqft_high})
    .$promise.then(function(result){
      //precheck all of the floorplans
      $scope.selectedFloorplans = SelectedFloorplansService.create(result);
      //set floorplans obj
      $scope.floorplans = result;
      $ionicLoading.hide();
    },function(error){
      $ionicLoading.hide();
    });

  $scope.toggleSelection = function(id){
    var index = $scope.selectedFloorplans.indexOf(id);

    if(index > -1){
      $scope.selectedFloorplans.splice(index, 1);
    }else{
      $scope.selectedFloorplans.push(id);
    }
    SelectedFloorplansService.set($scope.selectedFloorplans);
  }

  $scope.next = function(){
    $location.path('/deal');
  }

  $scope.rightButtons = [
        {
            type: 'button-clear icon-right ion-ios7-arrow-forward',
            tap: function (e) {
                $scope.next();
            }
        }
    ];
})


.controller('DealCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup,
  $filter, $location, RSFService, SelectedBuildingsService, StorageService,
  SelectedFloorplansService, DealService, DealDataService, UserService){

  $scope.id = $stateParams.id;
  $scope.range = $stateParams.range;

  $scope.formdata = {
    deal_name: null,
    direct: false,
    tenant_info: {
      tenant_rep_broker_name:null,
      tenant_rep_broker_email:null,
      tenant_rep_broker_company:null,
      tenant_name:null
    },
    contact_info:{
      contact_name:null,
      contact_email:null,
      tenant_name:null
    },
    type:"lease",
    start_date:null,
    end_date:null
  }

  $scope.tour = DealDataService.get();

  $scope.floor_plan_ids = null;


  //populate the building & floorplan ids -- toString to prevent array notation
  var floorplans = SelectedFloorplansService.get();
  var buildings = SelectedBuildingsService.get();



  $scope.tour.building_tokens = buildings.toString();
  $scope.floor_plan_ids = floorplans.toString();


  $scope.tour.v_sqft_low = RSFService.getSelected().sqft_low;
  $scope.tour.v_sqft_high = RSFService.getSelected().sqft_high;



  //watch the model for changes
  $scope.$watch('tour',function(newval,oldval){
    DealDataService.set(newval);
    if(newval.trbrokeremail){
      $scope.findUser(newval.trbrokeremail);
    }
  },true);



  $scope.submit = function(){
    //submit the tour data for creation
    $scope.loading = $ionicLoading.show({
      content:'Loading'
    });

    var user_token = StorageService.get('api_token');
    DealService.create({tour:$scope.tour,floor_plan_ids:$scope.floor_plan_ids})
    .$promise.then(function(result){
      $scope.loading.hide();
      $ionicPopup.alert({
            title: 'Tour Creation Succeeded!',
            content: 'Click okay to return to the home screen'
          }).then(function(res) {

        SelectedBuildingsService.clear();
        SelectedFloorplansService.clear();
        DealDataService.clear();
        $location.path('/home');
          });
    },function(error){
      $scope.loading.hide();
      $ionicPopup.alert({
            title: 'Tour Creation Failed!',
            content: error.data
          }).then(function(res) {

          });
    });
  }

  $scope.findUser = function(user_email){
    UserService.getUser({email:user_email})
    .$promise.then(function(result){
      $scope.tour.trbrokercompany = result.company;
      $scope.tour.trbrokername = result.name;
    },function(error){
    });
  }
});