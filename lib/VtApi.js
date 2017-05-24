export default class VasttrafikAPI {
  KEY = 'fRJUFeL5KXN_sCV6nuY51eUD844a';
  SECRET = 'twdD20wDNdpfQnpkmxCH2DKAO1ka';

  accessToken = null;

  getToken = () => {
    return fetch('https://api.vasttrafik.se/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.KEY}:${this.SECRET}`)}`
      },
      body: `grant_type=client_credentials&scope=device_id`
    })
      .then(response => response.json())
      .then(({ access_token }) => access_token);
  };

  async fetchApiResult(query, init = {}) {
    if (!this.accessToken) this.accessToken = await this.getToken();
    if (!init.headers) init.headers = {};
    init.headers.Authorization = `Bearer ${this.accessToken}`;
    return fetch(
      `https://api.vasttrafik.se/bin/rest.exe/v2/${query}&format=json`,
      init
    ).then(async response => {
      if (response.status === 401) {
        this.accessToken = await this.getToken();
        return this.fetchApiResult(query, init);
      }
      return response.json();
    });
  }

  getStop(searchString) {
    return this.fetchApiResult(
      `location.name?input=${encodeURIComponent(searchString)}`
    ).then(({ LocationList: { StopLocation: stops } = {} }) => {
      return Array.isArray(stops) ? stops[0] : stops;
    });
  }

  getNearbyStop({ lat, lng }) {
    return this.fetchApiResult(
      `location.nearbystops?maxNo=1&maxDist=10000&originCoordLat=${lat}&originCoordLong=${lng}`
    ).then(({ LocationList: { StopLocation: stop } = {} }) => stop);
  }

  async getTrip(fromId, toId) {
    let fromName, toName;
    if ((fromId && !toId) || (!fromId && toId)) {
      if (fromId) toId = fromId;
      ({ id: fromId, name: fromName } = await this.getNearbyStop(
        await this.fetchGeoLocation()
      ));
    }
    const rNumber = /^\d+$/;
    if (!rNumber.test(fromId))
      ({ id: fromId, name: fromName } = await this.getStop(fromId));
    if (!rNumber.test(toId))
      ({ id: toId, name: toName } = await this.getStop(toId));

    return this.fetchApiResult(
      `trip?numTrips=1&originId=${fromId}&destId=${toId}`
    ).then(({ TripList: { Trip, errorText: error } = {} }) => {
      if (!Trip)
        return {
          success: false,
          from: fromName || fromId,
          to: toName || toId,
          error
        };

      const trip = Array.isArray(Trip) ? Trip[0] : Trip;
      const legs = (Array.isArray(trip.Leg) ? trip.Leg : [trip.Leg]).filter(
        ({ type }) => type !== 'WALK'
      );
      const {
        name: fromBy,
        Origin: {
          name: from,
          rtime: fromRTime,
          time: fromTime,
          fromAt = fromRTime || fromTime
        } = {}
      } = legs[0];
      const {
        Destination: {
          name: to,
          rtime: toRTime,
          time: toTime,
          toAt = toRTime || toTime
        } = {}
      } = legs[legs.length - 1];

      return {
        success: true,
        from: from.split(',').shift(),
        fromAt,
        fromBy,
        to: to.split(',').shift(),
        toAt,
        changes: legs.length - 1
      };
    });
  }

  fetchGeoLocation() {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        maximumAge: 3600 * 1000
      })
    ).then(({ coords: { latitude: lat, longitude: lng } }) => ({ lat, lng }));
  }
}
