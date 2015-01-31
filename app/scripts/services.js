angular.module('TenEightLandlord.services', ['ngResource'])

.factory('LoginService',function($resource){
  return $resource('https://teneight.net/api/v1/login',{},
  {
    login:{
      method:'GET',
      params:{
        llbroker:'true'
      }
    }
  });
})


//create a service to wrap storage services
.factory('StorageService',function($window){

  var appStorages = {};
  var api = undefined;

  //default to local storage
  if($window.localStorage){
    api = {
      set : function(key,value){
        $window.localStorage.setItem(name, JSON.stringify(value));
      },
      get: function(key){
        var str = $window.localStorage.getItem(name);
        var val = {};

        try{
          val = str ? JSON.parse(str) : null;
        }catch(e){
          console.log('Parse error for '+key);
        }
        return val;
      },
      clear : function(){
        $window.localStorage.clear();
      }
    }
  }else{
    throw new Error('Could not create storage API!');
  }

  return {
    set : function(key,value){
      api.set(key,value);
    },
    get : function(key){
      return api.get(key);
    },
    clear : function(){
      api.clear();
    }
  }


})

.factory('TokenService',function(){
  var token = null;
  return {
    getToken: function(){
      return token;
    },
    setToken: function(new_token){
      token = new_token;
    }
  }
})

.factory('SelectedBuildingsService',function(){
  var selectedBuildings = [];
  return {
    get: function(){
      return selectedBuildings;
    },
    set: function(arr){
      selectedBuildings = arr;
    },
    clear: function(){
      selectedBuildings = [];
    }
  }
})

.factory('RSFService',function(){
  var selected = null;
  var sizes = [
    {id:0,title:'0 - 2,500 RSF',sqft_low:'0',sqft_high:'2500'},
    {id:1,title:'2,501 - 5,000 RSF',sqft_low:'2501',sqft_high:'5000'},
    {id:2,title:'5,001 - 10,000 RSF',sqft_low:'5001',sqft_high:'10000'},
    {id:3,title:'10,001 - 20,000 RSF',sqft_low:'10001',sqft_high:'20000'},
    {id:4,title:'20,001 - 50,000 RSF',sqft_low:'20001',sqft_high:'50000'},
    {id:5,title:'50,001 - 100,000 RSF',sqft_low:'50001',sqft_high:'100000'},
    {id:6,title:'100,001 - 200,000 RSF',sqft_low:'100001',sqft_high:'200000'},
    {id:7,title:'200,001 - 500,000 RSF',sqft_low:'200001',sqft_high:'500000'},
    {id:8,title:'> 500,000 RSF',sqft_low:'500001',sqft_high:'2000000'}
  ];

  return {
    all: function(){
      return sizes;
    },
    setSelected: function(id){
      selected = id;
    },
    get: function(id){
      return sizes[id];
    },
    getSelected: function(){
      return sizes[selected];
    }
  }
})

.factory('BuildingsService',function($resource, ENV){
  return $resource(ENV.apiEndpoint + 'buildings' ,{},
  {

    query:{
      method:'GET',
      isArray:true
    }

  });
})

.factory('FloorplansService',function($resource, ENV){
  return $resource(ENV.apiEndpoint + 'floorplans',{},
  {
    query:{
      method:'GET',
      isArray:true
    }
  });
})

.factory('SelectedFloorplansService',function(){
  var selectedFloorplans = [];
  var dirty = false;
  return {
    get: function(){
      return selectedFloorplans;
    },
    set: function(arr){
      selectedFloorplans = arr;
    },
    create: function(obj){//create prechecked list from floorplan obj
      if(!dirty){
        dirty = true;
        for(var i=0; i<obj.length; i++){
          for(var j=0; j<obj[i].floorplans.length; j++){
            selectedFloorplans.push(obj[i].floorplans[j].id);
          }
        }
      }
      return selectedFloorplans;
    },
    dirty: function(){
      return dirty;
    },
    clear : function(){
      selectedFloorplans = [];
      dirty = false;
    }
  }
})

.factory('DealDataService',function($filter){
  var proto = {
    name:null,
    direct:false,
    lldeal:true,
    trbrokeremail:null,
    trbrokername:null,
    trbrokercompany:null,
    contact_email:null,
    contact_name:null,
    client:null,
    building_tokens:null,
    v_sqft_high:null,
    v_sqft_low:null,
    lp:1,
    tourtype:1,
    inquiry_date: $filter('date')(new Date(), 'yyyy-MM-dd')
  };

  var deal = {
    name:null,
    direct:false,
    lldeal:true,
    trbrokeremail:null,
    trbrokername:null,
    trbrokercompany:null,
    contact_email:null,
    contact_name:null,
    client:null,
    building_tokens:null,
    v_sqft_high:null,
    v_sqft_low:null,
    lp:1,
    tourtype:1,
    inquiry_date: $filter('date')(new Date(), 'yyyy-MM-dd')
  };
  return {
    get: function(){
      return deal;
    },
    set: function(obj){
      deal = obj;
    },
    clear : function(){
      deal.name = null;
      deal.direct = false;
      deal.lldeal = true;
      deal.trbrokeremail = null;
      deal.trbrokername = null;
      deal.trbrokercompany = null;
      deal.contact_name = null;
      deal.contact_email = null;
      deal.client = null;
      deal.building_tokens = null;
      deal.v_sqft_high = null;
      deal.v_sqft_low = null;
      deal.lp = 1;
      deal.tourtype = 1;
      deal.inquiry_date = $filter('date')(new Date(), 'yyyy-MM-dd');
    }
  }
})

.factory('DealService',function($resource, ENV){
  return $resource(ENV.apiEndpoint + 'tours',{},
  {
    create:{
      method:'POST',
      headers:{'Content-Type':'application/json'}
    }
  })
})

.factory('UserService',function($resource, ENV){
  return $resource(ENV.apiEndpoint + 'user',{},
  {
    getUser:{
      method:'GET',
      isArray:false
    }

  });
});