'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('TenEightLandlord', ['ionic',
  'config',
  'TenEightLandlord.controllers',
  'TenEightLandlord.services',
  'auth0',
  'angular-storage',
  'angular-jwt'
  ])


.config(function($stateProvider, $urlRouterProvider, $httpProvider, authProvider, jwtInterceptorProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login',{
      url:'/login',
      templateUrl: 'views/login.html',
      controller:'LoginCtrl'
    })

    .state('buildings',{
      url:'/buildings',
      templateUrl: 'views/buildings.html',
      controller:'BuildingCtrl',
      data: {
        requiresLogin: true
      }
    })

    .state('rsfSelection',{
      url:'/rsfselection',
      templateUrl:'views/rsf_selection.html',
      controller:'RSFSelectionCtrl',
      data: {
        requiresLogin: true
      }
    })

    .state('floorplans',{
      url:'/floorplans',
      templateUrl:'views/floorplans.html',
      controller:'FloorplanCtrl',
      data: {
        requiresLogin: true
      }
    })

    .state('deal',{
      url:'/deal',
      templateUrl:'views/deal.html',
      controller:'DealCtrl',
      data: {
        requiresLogin: true
      }
    });



  authProvider.init({
    domain: 'realnex.auth0.com',
    clientID: 'eAFJhV64Q6bydZ7oITbpj54D1GqURI5r',
    loginState: 'login'
  });

  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');

    if (!idToken || !refreshToken) {
      return null;
    }

    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function (idToken) {
        store.set('token', idToken);
        return idToken;
      })
    } else {
      return idToken;
    }
  }

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/buildings');
  $httpProvider.interceptors.push('jwtInterceptor');
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

})

.run(function($ionicPlatform, $rootScope, auth, store, jwtHelper, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $state.go('login');
        }
      }
    }
  })

  auth.hookEvents();
});
