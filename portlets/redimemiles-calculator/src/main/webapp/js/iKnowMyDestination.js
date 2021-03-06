var segments = {};
var cities = {};

MyApp.loadData = function loadData(){
  segments = citySegments;
  cities = earnMilesCities;
}

function setAirportOptions(arr, key, value) {
  var tpl = "<option region='%region%' value='%value%'>%text%</option>";
  return {
    to: function (id, empty) {
      var options = "<option value=''>" + actualLanguage[empty] + "</option>";
      var elem;
      $("#" + id).html("");
      for (var i = 0; i < arr.length; i++) {
        elem = arr[i];
        options += tpl.replace(/%region%/, elem.region)
          .replace(/%value%/, elem[key])
          .replace(/%text%/, (actualLanguage[elem[value]] || elem[value]));
      }
      $("#" + id).append(options);
      return this;
    }
  };
}

function setOptions(arr) {

  return {
    to: function (id, empty) {
      var options = "<option value=''>" + actualLanguage[empty] + "</option>";
      var elem;
      $("#" + id).html("");
      for (var i = 0; i < arr.length; i++) {
        elem = arr[i];
        options += "<option value='" + elem + "'>" + (actualLanguage[elem] || "_" + elem) + "</option>";
      }
      $("#" + id).append(options);
      return this;
    }
  }
}

var Map = {
  instance: {},
  colors: ['#083f6d', '#aeaeae', '#d8d7d7', '#083f6d', '#d8d7d7', '#aeaeae'],
  markers: [],
  lines: [],
   setTrip: function (RaWtrips, from, to) {
	
	this.selection = {
		from : from,
		to: to
	}
   
    var _this = this;
    var citiesPoints = []
    this.clearMarkers();
    $(".markerCustom").parent().parent().remove();
    var fx = true;

    function getlatLng(place) {
      var selectedPlace = cities.filter(function (data) {
        return data.value.indexOf(place) > -1;
      });
      return selectedPlace[0].latLng.split(",");
    }

    var travelNum = 0;
    this.trips = [];
    var trips = this.trips;

    function findPoints(dataTrips, i, ind) {

      var indX = ind;
      if (trips[ind] == undefined) {

        var newTrip = {};
        newTrip.domestic = {};
        newTrip.internation = {};
        newTrip.complete = {};
        newTrip.complete.millasReal = 0;
        newTrip.complete.millas = 0;
        newTrip.complete.name = [];
        indX = trips.length;
        trips.push(newTrip);


      }
      var temObject = trips[indX];
      var tripType;


      if (dataTrips[i].data.isDomestic) {

        tripType = temObject.domestic;

      } else {

        tripType = temObject.internation;

      }
      if (tripType.segment == undefined) {
        tripType.segment = [];
      }
      if (tripType.origin == undefined) {
        tripType.origin = dataTrips[i].origin;
      }
      if (tripType.millas == undefined) {
        tripType.millas = 0;

      }
      if (tripType.millasReal == undefined) {
        tripType.millasReal = 0;

      }

      var tripMileage = (parseInt(dataTrips[i].data.mileage) < 500) ? 500 : parseInt(dataTrips[i].data.mileage);

      tripType.millas += tripMileage;
      tripType.millasReal += parseInt(dataTrips[i].data.mileage);


      temObject.complete.millas += tripMileage;
      temObject.complete.millasReal += parseInt(dataTrips[i].data.mileage);

      tripType.destination = dataTrips[i].destination;

      if (tripType.name == undefined) {
        tripType.name = [];

      }
      if (temObject.complete.name.length > 1) {

        temObject.complete.name.pop();

      }
      if (tripType.name.length > 1) {

        tripType.name.pop();

      }

      var pointObj = {
        origin: dataTrips[i].origin,
        destination: dataTrips[i].destination
      }

      tripType.name.push(dataTrips[i].origin);
      tripType.name.push(dataTrips[i].destination);
      tripType.segment.push(pointObj);
      temObject.complete.name.push(dataTrips[i].origin);
      temObject.complete.name.push(dataTrips[i].destination);

      if (dataTrips[i].next) {
        findPoints(dataTrips[i].next, 0, i);

      }

    }

    function setlines(type) {
      var seg = type.name;

      for (var j in seg) {
        var Latlng = getlatLng(seg[j]);
        _this.setMarker(Latlng);

      }
      var segm = type.segment;
      for (var l in segm) {
        var LatlngOrigin = getlatLng(segm[l].origin);
        var LatlngDestination = getlatLng(segm[l].destination);
        if (fx) {
          _this.setMarker(LatlngOrigin);
          fx = false;
        }
        var MapLatlngOrigin = new google.maps.LatLng(LatlngOrigin[0], LatlngOrigin[1]);
        var MapLatlngDestination = new google.maps.LatLng(LatlngDestination[0], LatlngDestination[1]);
        var line = _this.drawLine([MapLatlngOrigin, MapLatlngDestination], segm[l].origin, segm[l].destination, _this.colors[i]);
        trips[i].lines.push(line);
      }

    }

    for (var i in RaWtrips) {
      findPoints(RaWtrips, i);
    }
    // draw markers
    for (var i in trips) {
      trips[i].lines = [];
      var segm = trips[i].internation;
      var segm2 = trips[i].domestic;
      setlines(segm);
      setlines(segm2);
    }
    this.showTrip(trips);
  },
  showTrip: function (trips) {

	var _this = this;
    var bounds = new google.maps.LatLngBounds();
    var paths = [];
    for (i = 0; i < _this.markers.length; i++) {
      var position = _this.markers[i].getPosition();
      bounds.extend(position);
      paths.push(position)
    }
    _this.instance.setCenter(bounds.getCenter());
    _this.instance.fitBounds(bounds);

    for (var i in trips) {

      var name = "";
      for (var j in trips[i].complete.name) {

        name += trips[i].complete.name[j] + " ";
      }
      var content = '<div class="markerCustom mark-' + i + '"><div><strong>' + name + '</strong>' + actualLanguage.distance + ': ' + trips[i].complete.millasReal + ' ' + actualLanguage.miles + '</div></div>';
      var centerControlDiv = document.createElement('div');

      var centerControl = new CenterControl(centerControlDiv, _this, content, i);
      centerControlDiv.index = 1;
      _this.instance.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);
    }
    _this.showSingleTrip(0);
  
  
   /* this.clearMarkers();
    for (var i in trips) {
      this.setMarker(trips[i].origin);
      this.setMarker(trips[i].destination);
      this.drawLine([trips[i].origin, trips[i].destination], this.colors[0]);
    }


    var _this = this;
    var bounds = new google.maps.LatLngBounds();
    var paths = [];
    for (i = 0; i < _this.markers.length; i++) {
      var position = _this.markers[i].getPosition();
      bounds.extend(position);
      paths.push(position)
    }
    _this.instance.setCenter(bounds.getCenter());
    _this.instance.fitBounds(bounds);*/
  },
  setMarker: function (Latlng) {
    var image = {
      url: '/sites/all/themes/bootstrap/bootstrap_subtheme_copa/images/marker.png',
      size: new google.maps.Size(24, 34),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 34)
    };

    myLatlng = new google.maps.LatLng(Latlng[0], Latlng[1]);
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: this.instance,
      title: '',
      icon: image
    });

    this.markers.push(marker);
  },
  /*setMarker: function (LatlngS) {
    var image = {
      url: '/sites/all/themes/bootstrap/bootstrap_subtheme_copa/images/marker.png',
      //url: 'images/marker.png',
      size: new google.maps.Size(24, 34),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 34)
    };
    var Latlng = LatlngS.split(",");
    myLatlng = new google.maps.LatLng(Latlng[0], Latlng[1]);
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: this.instance,
      title: '',
      icon: image
    });

    this.markers.push(marker);
  },*/
  drawLine: function (paths, origin, destination, color) {
    _this = this;
    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 2
    };
    var line = new google.maps.Polyline({
      path: paths,
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 20,
      map: this.instance,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '12px'
      }]

    });

    this.lines.push(line);
    google.maps.event.addListener(line, 'click', function () {
      flight = MyApp.BuscadorCaminos.getTrips(origin, destination)
		MyApp.showData(origin,destination);
	  
	  
      /*$tableEarnMiles = $("#earnMilesTable");
      $tableEarnMiles.html("");
      $tableEarnMiles.append('<h4>' + actualLanguage.SegmentosIncluidos + ' ' + origin + "-" + destination + '</h4>')
      $tableEarnMiles.append(EarnMiles.createTable(flight));*/
    });

    google.maps.event.addListener(line, 'mouseover', function () {
      line.setOptions({strokeOpacity: .1, strokeColor: "#be854c"});
    });


    google.maps.event.addListener(line, 'mouseout', function () {
      line.setOptions({strokeOpacity: 0, strokeColor: color});
    });
    return line;
  },
  
  /*drawLine: function (points, color) {

    var paths = [];
    for (var i in points) {
      var Latlng = points[i].split(',');
      paths.push(new google.maps.LatLng(Latlng[0], Latlng[1]));
    }

    _this = this;
    var lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 2
    };
    var line = new google.maps.Polyline({
      path: paths,
      strokeColor: color,
      strokeOpacity: 0,
      strokeWeight: 20,
      map: this.instance,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '12px'
      }]

    });

    this.lines.push(line);
    return line;
  },*/
  
  clearMarkers: function () {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].setMap(null);
    }
    this.markers = [];
    this.lines = [];

  },
  showSingleTrip: function (TripId,from, to) {
    _this = this;
    $(".markerCustom").removeClass("Active");
    $(".markerCustom.mark-" + TripId).addClass("Active");
    for (var i in _this.trips) {
      var lines = _this.trips[i].lines;
      for (var j in lines) {
        if (TripId != i) {
          lines[j].setMap(null);
        } else {
          lines[j].setMap(_this.instance);
          lines[j].setOptions({strokeColor: "#083f6d"});

        }
      }

    }
	
    MyApp.showData(this.selection.from,this.selection.to);
		
  }

};

window.MyApp = window.MyApp || {};
MyApp.mainCalculator = new CalculatorBuilder()
  .setSegments(regionSegments)
  .buildCalculator("UseMiles");
MyApp.load = function (i18n, from, to, type, cabin, execute, result) {
  this.loadData();
  var $from = $("#" + from),
    $to = $("#" + to),
    $type = $("#" + type),
    $cabin = $("#" + cabin),
    $result = $("#" + result),
    $execute = $("#" + execute),
    locale = $("html").attr("lang");
  
  this.fields = {
	  to		: $to,
	  type		: $type,
	  cabin		: $cabin,
	  result	: $result,
	  execute	: $execute
  }
  
  actualLanguage = setLanguage(i18n, locale);

  setAirportOptions(countries, "code", "code").to(from, "EmptyValue_Origin"); //.to(to);
  setAirportOptions(countries, "code", "code").to(to, "EmptyValue_Destination"); //.to(to);
  setOptions(["1", "2"]).to(type, "EmptyValue_FligthType");
  setOptions(["Economy", "Business"]).to(cabin, "EmptyValue_Cabin");

  $execute.html(actualLanguage['viewMiles']);
  this.addMap();

  $execute.click(function () {
	MyApp.showData($from.val(),$to.val());
   	var recorrido = MyApp.BuscadorCaminos.getTrips($from.val(),$to.val());
	Map.setTrip(recorrido,$from.val(),$to.val());
  });


  $from.on("change", function fromChanged() {
    var element = $from.val();
    $to.removeAttr("disabled");
    setAirportOptions(countries.filter(function (country) {
      return country.code != element;
    }), "code", "code").to(to, "EmptyValue_Destination");
  });
  $to.on('change', function () {
    $type.removeAttr("disabled");
  });
  $type.on('change', function () {
    $execute.removeAttr("disabled");
  });

};
MyApp.showData = function (from, to) { 
	var origin = find(countries, "code", from);
    var destination = find(countries, "code", to);
	
	var flight = {
      to: to,
      from: from
    };
	MyApp.createTable(MyApp.mainCalculator
			.setFrom(origin.region)
			.setTo(destination.region)
			.getTrips()
			.calculateTrip(MyApp.fields.type.val() || 1)
		, flight);
}
MyApp.createTable = function (Data, flight) { 
  var container = $('<div class="col-md-12 results"></div>');
  var wrapper = $('<div class="resultFull"></div>');
  var descriptionCel = '<div class="col-md-4"><h4>' + actualLanguage[flight.from] + ' - ' + actualLanguage[flight.to] + '</h4></div>'
  wrapper.append(descriptionCel);
  for (var i in Data) {
    var dat = Data[i];
    var htlmObject = '<div class="col-md-2"><h5>' + dat.cabin + '<br/>' + dat.award + '</h5><span>' + formatNumber(dat.price) + '</span></div>';
    wrapper.append(htlmObject);

  }


  container.append(wrapper);
  MyApp.fields.result.html(container);


}

MyApp.addMap = function () {

  var mapOptions = {
    zoom: 2,
    maxZoom: 8,
    disableDefaultUI: true,
    center: new google.maps.LatLng(17.7118239, -64.125807),
    styles: [{
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#444444"}]
    }, {"featureType": "landscape", "elementType": "all", "stylers": [{"color": "#f2f2f2"}]}, {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{"visibility": "off"}]
    }, {
      "featureType": "road",
      "elementType": "all",
      "stylers": [{"saturation": -100}, {"lightness": 45}]
    }, {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{"visibility": "simplified"}]
    }, {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    }, {"featureType": "transit", "elementType": "all", "stylers": [{"visibility": "off"}]}, {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{"color": "#276fa3"}, {"visibility": "on"}]
    }]
  };
  var mapElement = document.getElementById('map');
  Map.instance = new google.maps.Map(mapElement, mapOptions);

};

function formatNumber(a) {
  a = a.toString();
  var numL = a.length / 3;
  var output;
  var fixvalue = 0;
  for (var i = 1; i < numL; i++) {
    var position = a.length - 3 * i;
    position -= fixvalue;
    a = a.substr(0, position) + "," + a.substr(position);
    fixvalue++
  }
  return a;

}
  //Google maps ui element
function CenterControl(controlDiv, MapV, content, ind) {


  $(controlDiv).css({padding: '10px'});
  var controlUI = document.createElement('div');
  controlDiv.appendChild(controlUI);
  $(controlUI).append(content);

  google.maps.event.addDomListener(controlUI, 'click', function () {
    MapV.showSingleTrip(ind);
  });
}