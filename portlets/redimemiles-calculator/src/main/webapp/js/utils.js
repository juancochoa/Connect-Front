function find(array, key, value) {
  var resp, i = 0;
  while (!resp && i < array.length) {
    if (array[i][key] == value) {
      resp = array[i];
    }
    i++
  }
  return resp;
}

function transformConnectedRegions(arr, countries) {
  var resp = {};

  function getAllCountriesFromRegion(region) {
    return countries.filter(function filterByTo(elem) {
      return elem.region == region;
    });
  }

  for (var i = 0; i < arr.length; i++) {
    var region = arr[i].to;
    var _countries = getAllCountriesFromRegion(region);
    var country;
    for (var j = 0; j < _countries.length; j++) {
      country = _countries[j];
      if (!resp[country.code]) {
        resp[country.code] = {
          latLng: country.latLng,
          destination: country.code,
          saver: "",
          standard: ""
        };
      }

      if (arr[i].award == "Saver") {
        resp[country.code].saver = arr[i].price;
      } else {
        resp[country.code].standard = arr[i].price;
      }
    }
  }
  return Object.keys(resp).map(function (key) {
    return resp[key];
  })
};

function setLanguage(i18n, locale){
  if (locale == undefined) {
    locale = "es";
  }
  if (locale.toUpperCase().indexOf('ES') != -1) {
    return i18n.ES;
  } else if (locale.toUpperCase().indexOf('PT') != -1) {
    return i18n.PT;
  } else if (locale.toUpperCase().indexOf('EN') != -1) {
    return i18n.EN;
  }
}

