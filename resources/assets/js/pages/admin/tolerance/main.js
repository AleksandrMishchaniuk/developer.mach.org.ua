require('angular');

var app = angular.module('ToleranceApp', [])
                  .constant('API_URL', '/admin/api/v1/');

app.controller('ToleranceAppCtrl', ['$scope', '$http', 'API_URL', function($scope, $http, API_URL){

  resetCurItemForm();

  $scope.updateGrid = function(system, range_id) {
    if (!$scope.fields || !$scope.qualities || !system || !range_id) {
      return false;
    }
    resetCurItemForm();
    $http({
      url: API_URL + 'tolerances',
      method: "GET",
      params: {
        system: system,
        range_id: range_id
      }
    }).success(function(data){
      initGrid();
      angular.forEach(data, function (tolerance, key) {
        toleranceToFloat(tolerance);
        $scope.grid[tolerance.field_id][tolerance.quality_id] = tolerance;
      });
    })
  }

  $http.get(API_URL + 'systems').success(initSystems);
  $http.get(API_URL + 'ranges').success(initRanges);
  $http.get(API_URL + 'qualities').success(initQualities);
  $http.get(API_URL + 'fields').success(initFields);

  var changeCurSystemHendler = function (new_val, old_val, scope) {
      scope.updateGrid(new_val, scope.cur_range);
  };

  var changeCurRangeHendler = function (new_val, old_val, scope) {
      scope.updateGrid(scope.cur_system, new_val);
  };

  $scope.$watch('cur_system', changeCurSystemHendler);
  $scope.$watch('cur_range', changeCurRangeHendler);


  function initSystems(response) {
    $scope.systems = response;
    $scope.cur_system = $scope.systems[1]['title'];
  }

  function initRanges(response) {
    $scope.ranges = response;
    $scope.cur_range_arr_id = 0;
    $scope.prev_range_arr_id = $scope.cur_range_arr_id - 1;
    $scope.cur_range = $scope.ranges[$scope.cur_range_arr_id]['id'];
  }

  function initQualities(response) {
    $scope.qualities = response;
    $scope.updateGrid($scope.cur_system, $scope.cur_range);
    initGrid();
  }

  function initFields(response) {
    $scope.fields = response;
    $scope.updateGrid($scope.cur_system, $scope.cur_range);
    initGrid();
  }

  function initGrid() {
    if (!$scope.fields || !$scope.qualities) {
      return false;
    }
    $scope.grid = {};
    angular.forEach($scope.fields, function (field, key) {
      $scope.grid[field.id] = {};
      angular.forEach($scope.qualities, function (quality, key) {
        $scope.grid[field.id][quality.id] = {};
      });
    });
  }

  $scope.editItem = function(field, quality, f, q){
    $scope.cur_max_val = $scope.grid[field.id][quality.id].max_val;
    $scope.cur_min_val = $scope.grid[field.id][quality.id].min_val;
    $scope.cur_item = $scope.grid[field.id][quality.id];
    $scope.cur_field_name = field.title;
    $scope.cur_quality_name = quality.title;
    $scope.cur_field = field.id;
    $scope.cur_quality = quality.id;
    $scope.cur_field_arr_id = f;
    $scope.cur_quality_arr_id = q;
    $scope.cur_max_val_focus = false;
    $scope.cur_max_val_focus = true;
    fillPrevRangeTolerance();
  };

  $scope.updateField = function(){
    var params = {
      max_val: $scope.cur_max_val,
      min_val: $scope.cur_min_val,
      system: $scope.cur_system,
      range_id: $scope.cur_range,
      field_id: $scope.cur_field,
      quality_id: $scope.cur_quality,
      id: $scope.cur_item.id
    };
    $http({
      method: 'POST',
      url: API_URL + 'tolerances',
      data: $.param(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      $scope.errors = {};
      if (data) {
        toleranceToFloat(data);
      }
      $scope.grid[$scope.cur_field][$scope.cur_quality] = data;
      $scope.cur_item = $scope.grid[$scope.cur_field][$scope.cur_quality];
    }).error(function(data, status){
      console.error(data);
      $scope.errors = data;
    });
  };

  $scope.keyupHandler = function (event) {
    event.stopPropagation();
    switch (event.keyCode) {
      case 38: // up
        var new_q = $scope.cur_quality_arr_id - 1;
        if ($scope.qualities[new_q] !== undefined) {
          $scope.editItem($scope.fields[$scope.cur_field_arr_id], $scope.qualities[new_q], $scope.cur_field_arr_id, new_q);
        }
        break;
      case 40: // down
        var new_q = $scope.cur_quality_arr_id + 1;
        if ($scope.qualities[new_q] !== undefined) {
          $scope.editItem($scope.fields[$scope.cur_field_arr_id], $scope.qualities[new_q], $scope.cur_field_arr_id, new_q);
        }
        break;
      case 37: // left
        var new_f = $scope.cur_field_arr_id - 1;
        if ($scope.fields[new_f] !== undefined) {
          $scope.editItem($scope.fields[new_f], $scope.qualities[$scope.cur_quality_arr_id], new_f, $scope.cur_quality_arr_id);
        }
        break;
      case 39: // right
        var new_f = $scope.cur_field_arr_id + 1;
        if ($scope.fields[new_f] !== undefined) {
          $scope.editItem($scope.fields[new_f], $scope.qualities[$scope.cur_quality_arr_id], new_f, $scope.cur_quality_arr_id);
        }
        break;
      case 32: // space
        if ($scope.prev_range_tolerance) {
          $scope.cur_max_val = $scope.prev_range_tolerance.max_val;
          $scope.cur_min_val = $scope.prev_range_tolerance.min_val;
        }
        break;
      default:

    }
  };

    $scope.toleranceChangeHandler = function (type) {
        if (!$scope.delta) return;
        if (type === 'max') {
            $scope.cur_min_val = $scope.cur_max_val - $scope.delta;
        } else if (type === 'min') {
            $scope.cur_max_val = $scope.cur_min_val + $scope.delta;
        }
    };

  $scope.rangeChangedHandler = function (r, range) {
    $scope.cur_range_arr_id = r;
    $scope.prev_range_arr_id = $scope.cur_range_arr_id - 1;
  };

  $scope.fieldBySystem = function(text){
    return ($scope.cur_system === 'hole')? text.toUpperCase(): text;
  };

  $scope.$watch('cur_min_val', function(new_val){
    $scope.min_input_val = new_val + 0.001;
  });

  function toleranceToFloat (tolerance){
    tolerance.max_val = tolerance.max_val ? parseFloat(tolerance.max_val) : null;
    tolerance.min_val = tolerance.min_val ? parseFloat(tolerance.min_val) : null;
  }

  function resetCurItemForm(){
    $scope.cur_max_val = null;
    $scope.cur_min_val = null;
    $scope.min_input_val = null;
    $scope.cur_item = undefined;
    $scope.cur_field_name = '';
    $scope.cur_quality_name = '';
    $scope.cur_field_arr_id = undefined;
    $scope.cur_quality_arr_id = undefined;
    $scope.prev_range_tolerance = {};
  }
  
  function fillPrevRangeTolerance() {
    if (!$scope.ranges[$scope.prev_range_arr_id]) {
      return;
    }
    $http({
      url: API_URL + 'tolerances',
      method: "GET",
      params: {
        system: $scope.cur_system,
        range_id: $scope.ranges[$scope.prev_range_arr_id].id,
        field_id: $scope.cur_field,
        quality_id: $scope.cur_quality
      }
    }).success(function(data){
        let tolerance = data[0];
        if (tolerance) {
          toleranceToFloat(tolerance);
          $scope.prev_range_tolerance = tolerance;
        } else {
          $scope.prev_range_tolerance = undefined;
        }
    })
  }
}]);

app.directive('focus', ['$parse', '$timeout', function($parse, $timeout){
  return {
    link: function(scope, element, attrs){
      var model = $parse(attrs.focus);
      scope.$watch(model, function(val){
        if(val === true){
          $timeout(function () {
            element[0].focus();
          });
        }
      });
      element.bind('blur', function(){
        scope.$apply(model.assign(scope, false));
      });
    }
  };
}]);
