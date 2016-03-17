var CalculatorBuilder = function(segments, categories, statuses, domesticFlights) {

  this.setSegments = function(value){
    return new CalculatorBuilder(value, categories, statuses, domesticFlights);
  };

  this.setCategories = function(value){
    return new CalculatorBuilder(segments, value, statuses, domesticFlights);
  };

  this.setDomestic = function(value){
    return new CalculatorBuilder(segments,categories,statuses, value);
  };

  this.setStatuses = function(value){
    return new CalculatorBuilder(segments, categories, value, domesticFlights);
  };

  this.buildCalculator = function(value){
    if(value === "EarnMiles"){
      return new EarnMilesCalculator(segments, categories, statuses, domesticFlights);
    } else if (value === "UseMiles") {
      return new UseMilesCalculator(segments);
    } else {
      throw new Error("Invalid argument. Only accept 'EarnMiles' or 'UseMiles'");
    }
  };
};

var EarnMilesTrip = function(segment, categories, statuses, domesticFlights, myStatus){
  var minDistance = 500;
  function isDomestic(origin, destination){
    if(origin && destination && domesticFlights){
      for(var i = 0; i < domesticFlights.length; i++){
        var vuelo = domesticFlights[i];
        if(vuelo.indexOf(origin) != -1 && vuelo.indexOf(destination) != -1){
          return true;
        }
      }
    }
    return false;
  }

  function calculateAwardMiles(distance, category){
    var resp = {
      base: distance * category.base,
      bonification: distance * category.bonification,
      status : distance * myStatus.bonus
    };

    resp.total = Math.round(resp.base + resp.bonification + resp.status);
    return resp;
  }

  function calculateTierMiles(distance, category){
    var resp = {
      base: distance * category.base,
      bonification: (distance * category.calification) - distance
    };

    resp.total = Math.round(distance * category.calification);
    return resp;
  }

  function parseCategory(distance, category){
	return {
      "category"                : category.name,
      "class"                   : category.class,
      "segmentsForCalification" : category.segmentsForCalification,
      "awardMiles"              : calculateAwardMiles(distance, category),
      "tierMiles"               : calculateTierMiles(distance, category)
    };
  }

  function calculateTrip (times){
    var selectedCategories;
	
    if(segment[0]) {
      var response = {
        distance: segment[0].distance * times,
        data: []
      };
      if(domesticFlights){
        selectedCategories = isDomestic(segment[0].cities[0], segment[0].cities[1])?  categories.domestic : categories.international;
      } else {
        selectedCategories = categories;
      }

      for(var j = 0; j < selectedCategories.length; j++){
		var distanceCategory = (segment[0].distance > minDistance) ? segment[0].distance * times : minDistance * times;
        response.data.push(parseCategory(distanceCategory, selectedCategories[j]));
      }
      return response
    }

    return null;
  }

  this.getTotalMileage = function (distance, isDomestic, times){
    var response = {
      distance: distance * times,
      data: []
    };
    var selectedCategories;

    if(isDomestic){
      selectedCategories = categories.domestic
    } else {
      selectedCategories = categories.international;
    }

    for(var j = 0; j < selectedCategories.length; j++){
	  var distanceCategory = (distance > minDistance) ? distance * times : minDistance * times;
      response.data.push(parseCategory(distanceCategory, selectedCategories[j]));
    }
    return response;
  };

  this.calculateTrip = function (times){
    return calculateTrip(times);
  };

  this.setStatus = function(value){
    return new EarnMilesTrip(segment,categories,statuses,domesticFlights, value);
  };

  this.oneWay = function(times){
    return calculateTrip(1);

  };

  this.roundtrip = function(){
    return calculateTrip(2);
  };
};

var EarnMilesCalculator = function(segments, categories, statuses, domesticFlights, myStatus){
  this.setStatus = function(value){
    var status = value;

    for(var i = 0; i < statuses.length; i++){
      if(value == statuses[i].name){
        status = statuses[i];
      }
    }

    return new EarnMilesCalculator(segments, categories, statuses, domesticFlights, status);
  };

  this.getTrip = function(from, to){
    var segment = getSegment(from, to);
    return new EarnMilesTrip(segment, categories, statuses, domesticFlights, myStatus);
  };

  this.getTotalMileage = function(mileage, isDomestic, times){
    var trip = new EarnMilesTrip(null,categories,statuses,domesticFlights, myStatus);
    return trip.getTotalMileage(mileage, isDomestic, times);
  };

  function getSegment (from, to){
    var elem;
    var response = [];

    if(from == to){
      return []
    }

    for(var i = 0; i < segments.length; i++){
      elem = segments[i];
      if(elem.cities.indexOf(from) !== -1
        && (to === undefined || elem.cities.indexOf(to) !== -1)){
        response.push(segments[i]);
      }
    }
    return response;
  }
};

var UseMilesTrip = function(actualSegment, cabin, maxMileage){
  this.oneWay = function(){
    return calculateTrip(1);
  };

  this.roundtrip = function(){
    return calculateTrip(2);
  };

  this.setCabin = function(value){
    return new UseMilesTrip(actualSegment, value);
  };

  this.calculateTrip = function (times) {
    return calculateTrip(times);
  };

  function calculateTrip(times){
    var newElement = {
      cities: actualSegment.cities,
      mileage: actualSegment.mileage
    };
    /*for (var j = 0; j < actualSegment.mileages.length; j++) {
      var elem = actualSegment.mileages[j];
      var mileage = elem.mileage * times;
      if(( !cabin || elem.cabin == cabin) &&
        (!maxMileage || maxMileage >= mileage)) {
        newElement.mileages.push({
          cabin: elem.cabin,
          productType: elem.productType,
          mileage: mileage
        });
      }
    }*/
    return newElement;
  }

};

var UseMilesTrips = function(segments, maxMileage) {

  function calculateTrip (times) {
    return segments.filter(function filterByPrice(elem){
      return !maxMileage? true : elem.price * times <= maxMileage;
    }).map(function returnMileage(elem){
      return {
        from: elem.from,
        to: elem.to,
        cabin: elem.cabin,
        award: elem.award,
        price: elem.price * times
      }
    });
  }

  this.calculateTrip = calculateTrip;

  this.setCabin = function(value){
    return new UseMilesTrips(segments.filter(function filterByCabin(elem){
      return elem.cabin == value;
    }), maxMileage);
  };

  this.calculateTrip = function (times){
    return calculateTrip(times);
  };

  this.setMaxMileage = function(value){
    return new UseMilesTrips(segments, value);
  };

  this.oneWay = function(){
    return calculateTrip(1);
  };

  this.roundtrip = function(){
    return calculateTrip(2);
  };
};

var UseMilesCalculator = function(segments){

  this.setFrom = function(value){
    return new UseMilesCalculator(segments.filter(function filterFrom (elem){
        return elem.from == value;
      }
    ));
  };

  this.setTo = function(value){
    return new UseMilesCalculator(segments.filter(function filterTo (elem) {
        return elem.to == value;
      }
    ));
  };

  this.getTrips = function(){
    return new UseMilesTrips(segments);
  };

  this.getTrip = function(){
    return new UseMilesTrip(segments[0]);
  }
};

if(typeof module != 'undefined'){
  module.exports = CalculatorBuilder;
}
