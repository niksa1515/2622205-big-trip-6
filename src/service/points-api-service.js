import ApiService from '../framework/api-service.js';

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export default class PointsApiService extends ApiService {
  async getPoints() {
    const response = await this._load({url: 'points'});
    return ApiService.parseResponse(response);
  }

  async getDestinations() {
    const response = await this._load({url: 'destinations'});
    return ApiService.parseResponse(response);
  }

  async getOffers() {
    const response = await this._load({url: 'offers'});
    return ApiService.parseResponse(response);
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(PointsApiService.adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    return ApiService.parseResponse(response);
  }

  async deletePoint(pointId) {
    return this._load({
      url: `points/${pointId}`,
      method: Method.DELETE,
    });
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(PointsApiService.adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    return ApiService.parseResponse(response);
  }

  static adaptToServer(point) {
    return {
      'id': point.id,
      'type': point.type,
      'destination': point.destination,
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'is_favorite': point.isFavorite,
      'offers': point.offers,
    };
  }
}
