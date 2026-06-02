import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = {};
  #apiService = null;
  #isFailedLoad = false;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  get isFailedLoad() {
    return this.#isFailedLoad;
  }

  async init() {
    try {
      const [rawPoints, destinations, rawOffers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers(),
      ]);

      this.#points = rawPoints.map(PointsModel.adaptToClient);
      this.#destinations = destinations;
      this.#offers = rawOffers.reduce((result, {type, offers}) => {
        result[type] = offers;
        return result;
      }, {});
      this.#isFailedLoad = false;
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = {};
      this.#isFailedLoad = true;
    }

    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, update) {
    const serverPoint = await this.#apiService.updatePoint(update);
    const adaptedPoint = PointsModel.adaptToClient(serverPoint);

    const index = this.#points.findIndex((point) => point.id === adaptedPoint.id);
    if (index === -1) {
      throw new Error('Can\'t update non-existing point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      adaptedPoint,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, adaptedPoint);
  }

  async addPoint(updateType, update) {
    const serverPoint = await this.#apiService.addPoint(update);
    const adaptedPoint = PointsModel.adaptToClient(serverPoint);
    this.#points = [adaptedPoint, ...this.#points];
    this._notify(updateType, adaptedPoint);
  }

  async deletePoint(updateType, update) {
    await this.#apiService.deletePoint(update.id);
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete non-existing point');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, update);
  }

  static adaptToClient(point) {
    return {
      id: point['id'],
      type: point['type'],
      destination: point['destination'],
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
      offers: point['offers'],
    };
  }
}
