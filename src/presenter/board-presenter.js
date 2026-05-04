import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import TripPoint from '../view/trip-point-view.js';
import NoPointsView from '../view/no-points-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import { SortType } from '../const.js';

import {
  getInfoTitle,
  getInfoDates,
  getTotalCost,
  countFuturePoints,
  countPresentPoints,
  countPastPoints,
} from '../utils.js';

const sortPoints = (points, sortType) => {
  switch (sortType) {
    case SortType.DAY:
      return [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    case SortType.TIME:
      return [...points].sort((a, b) => {
        const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
        const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
        return durationB - durationA;
      });
    case SortType.PRICE:
      return [...points].sort((a, b) => b.basePrice - a.basePrice);
  }
  return points;
};

export default class TripPresenter {
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #sortComponent = null;

  constructor(tripModel) {
    this.model = tripModel;

    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.mainContainer = document.querySelector('.trip-main');
  }

  init() {
    const { points, destinations, offers } = this.model;

    const infoData = {
      title: getInfoTitle(points, destinations),
      dates: getInfoDates(points),
      totalCost: getTotalCost(points, offers),
    };

    const filtersInfo = {
      future: countFuturePoints(points),
      present: countPresentPoints(points),
      past: countPastPoints(points),
    };

    render(new TripPoint(infoData), this.mainContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView(filtersInfo), this.filtersContainer);

    if (!points || points.length === 0) {
      render(new NoPointsView(), this.eventsContainer);
      return;
    }

    this.#renderSort();
    this.#clearPoints();
    this.#renderPoints(sortPoints(points, this.#currentSortType), destinations, offers);
  }

  #renderSort() {
    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    if (prevSortComponent === null) {
      render(this.#sortComponent, this.eventsContainer, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderSort();
    this.#clearPoints();
    this.#renderPoints(
      sortPoints(this.model.points, this.#currentSortType),
      this.model.destinations,
      this.model.offers,
    );
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    const index = this.model.points.findIndex((p) => p.id === updatedPoint.id);
    this.model.points[index] = updatedPoint;
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPoints(points, destinations, offers) {
    points.forEach((point) => {
      const pointPresenter = new PointPresenter({
        container: this.eventsContainer,
        onDataChange: this.#handlePointChange,
        onModeChange: this.#handleModeChange,
        destinations,
        offers,
      });

      pointPresenter.init(point);
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }
}
