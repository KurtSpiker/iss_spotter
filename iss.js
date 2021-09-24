const request = require('request');



const fetchMyIP = function(callback) {
  request.get('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      return callback(error, null);
    }

    if (response.statusCode !== 200) {
      const message = `The Status code is ${response.statusCode} IP: ${body}`;
      return callback(error(message), null);
    }
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};



const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body);

    callback(null, { latitude, longitude });
  });
};


const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if(error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if(error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, runtimes) => {
        if(error) {
          return callback(error, null);
        }
        callback(null, runtimes)
      });
    });
  });
};

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation};