window.MyApp = window.MyApp || {};

window.MyApp.BuscadorCaminos = (function() {
  var flights = citySegmentsBuscadorCaminos;

  var Trip = function trip(origin, destination, data) {
    this.origin = origin;
    this.destination = destination;
    this.next = null;
    this.data = data;
  };

  var db = {
    airports: {},
    addAirport: function addAirport(name, latLng) {
      if (!this.airports[name]) {
        this.airports[name] = {
          id: name,
          latLng: latLng,
          connections: [],
          distance: {}
        };
      }
    },
    addTwoWayRoute: function (origin, destination, mileage) {
      this.addRoute(origin, destination, mileage);
      this.addRoute(destination, origin, mileage);
    },
    addRoute: function (origin, destination, mileage) {
      if (this.airports[origin].connections.indexOf(destination) == -1) {
        this.airports[origin].connections.push(destination);
        this.airports[origin].distance[destination] = {
          mileage: mileage,
          isDomestic: this.domesticFlights.isDomestic(origin, destination)
        }
      }
    },
    getTrips: function getTrips(origin, destination) {
		//pablo revisa que esto este ok
      if(this.airports[origin] != undefined){
		var realOrigin = this.airports[origin];
		var data = realOrigin.distance[destination];
	  }
	  //
      if (data) {
        return [new Trip(origin, destination, data)];
      } else{
        return this.hubs.filter(function myHubs(hub) {
			//pablo revisa que esto este ok
			if(realOrigin != undefined) return realOrigin.distance[hub.id];
			//
        }).map(function createTrip(destination) {
          return new Trip(origin, destination.id, realOrigin.distance[destination.id]);
        }).map(function (elem) {
          elem.next = this.getTrips(elem.destination, destination);
          return elem;
        }.bind(this));
      }
    }
  };

  db.domesticFlights = {
    isDomestic : function isDomestic(origin, destination){
      if(origin && destination){
        for(var i = 0; i < this.flights.length; i++){
          var vuelo = this.flights[i];
          if(vuelo.indexOf(origin) != -1 && vuelo.indexOf(destination) != -1){
            return true;
          }
        }
      }
      return false;
    },
    flights: domesticFlights
  };

  flights.forEach(function (elem) {
    var origin = elem.cities[0],
      destination = elem.cities[1],
      mileage = elem.mileage;

    db.addAirport(origin, positionCities[origin].latLng);
    db.addAirport(destination, positionCities[destination].latLng);

    db.addTwoWayRoute(origin, destination, mileage);
  });

  db.hubs = [db.airports["BOG"], db.airports["PTY"]];

  function beauty(obj) {
    return JSON.stringify(obj, null, '\t');
  }

  var trip = db.getTrips("EZE", "BOS");
  return db;
}());