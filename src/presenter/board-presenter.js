import SortView from '../view/sort-view.js';
import TripPoint from '../view/trip-point-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadView from '../view/failed-load-view.js';
import PointListView from '../view/event-list-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import {render, replace, remove, RenderPosition} from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import {SortType, FilterType, UserAction, UpdateType} from '../const.js';
import {getInfoTitle, getInfoDates, getTotalCost} from '../utils.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const filterPoints = (points, filterType) => {
  const now = new Date();
  switch (filterType) {
    case FilterType.FUTURE:
      return points.filter((p) => new Date(p.dateFrom) > now);
    case FilterType.PRESENT:
      return points.filter((p) => new Date(p.dateFrom) <= now && new Date(p.dateTo) >= now);
    case FilterType.PAST:
      return points.filter((p) => new Date(p.dateTo) < now);
    case FilterType.EVERYTHING:
    default:
      return points;
  }
};

const sortPoints = (points, sortType) => {
  switch (sortType) {
    case SortType.TIME:
      return [...points].sort((a, b) => {
        const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
        const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
        return durationB - durationA;
      });
    case SortType.PRICE:
      return [...points].sort((a, b) => b.basePrice - a.basePrice);
    case SortType.DAY:
    default:
      return [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
  }
};

export default class TripPresenter {
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #sortComponent = null;
  #noPointsComponent = null;
  #tripInfoComponent = null;
  #loadingComponent = new LoadingView();
  #failedLoadComponent = null;
  #pointListComponent = new PointListView();
  #isLoading = true;
  #uiBlocker = new UiBlocker({lowerLimit: TimeLimit.LOWER_LIMIT, upperLimit: TimeLimit.UPPER_LIMIT});

  #pointsModel = null;
  #filterModel = null;
  #newPointPresenter = null;
  #handleNewPointFormClose = null;
  #handleLoadingComplete = null;

  #eventsContainer = null;
  #mainContainer = null;
  #filtersContainer = null;

  constructor({pointsModel, filterModel, onNewPointFormClose = null, onLoadingComplete = null}) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#handleNewPointFormClose = onNewPointFormClose;
    this.#handleLoadingComplete = onLoadingComplete;

    this.#eventsContainer = document.querySelector('.trip-events');
    this.#mainContainer = document.querySelector('.trip-main');
    this.#filtersContainer = document.querySelector('.trip-controls__filters');

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointListComponent.element,
      onDataChange: this.#handleUserAction,
      onDestroy: this.#handleNewPointDestroy,
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filtered = filterPoints(this.#pointsModel.points, this.#filterModel.filter);
    return sortPoints(filtered, this.#currentSortType);
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init(this.#pointsModel.destinations, this.#pointsModel.offers);
  }

  #renderBoard() {
    if (this.#isLoading) {
      render(this.#loadingComponent, this.#eventsContainer);
      return;
    }

    this.#renderTripInfo();

    const points = this.points;

    if (points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    render(this.#pointListComponent, this.#eventsContainer);
    this.#renderPoints(points);
  }

  #renderTripInfo() {
    const {points, destinations, offers} = this.#pointsModel;

    const infoData = {
      title: getInfoTitle(points, destinations),
      dates: getInfoDates(points),
      totalCost: getTotalCost(points, offers),
    };

    const prevTripInfoComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripPoint(infoData);

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#mainContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #renderSort() {
    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    if (prevSortComponent === null) {
      render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    }
  }

  #renderNoPoints() {
    this.#noPointsComponent = new NoPointsView(this.#filterModel.filter);
    render(this.#noPointsComponent, this.#eventsContainer);
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      container: this.#pointListComponent.element,
      onDataChange: this.#handleUserAction,
      onModeChange: this.#handleModeChange,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearBoard({resetSortType = false} = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    this.#sortComponent = null;

    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
      this.#noPointsComponent = null;
    }

    if (this.#failedLoadComponent) {
      remove(this.#failedLoadComponent);
      this.#failedLoadComponent = null;
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #handleUserAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          await this.#pointsModel.updatePoint(updateType, update);
          break;
        case UserAction.ADD_POINT:
          await this.#pointsModel.addPoint(updateType, update);
          break;
        case UserAction.DELETE_POINT:
          await this.#pointsModel.deletePoint(updateType, update);
          break;
      }
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleModelEvent = (updateType, update) => {
    switch (updateType) {
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        if (this.#pointsModel.isFailedLoad) {
          this.#failedLoadComponent = new FailedLoadView();
          render(this.#failedLoadComponent, this.#eventsContainer);
          return;
        }
        this.#handleLoadingComplete?.();
        this.#renderBoard();
        break;
      case UpdateType.PATCH:
        this.#pointPresenters.get(update.id)?.init(update);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleNewPointDestroy = () => {
    this.#handleNewPointFormClose?.();
    if (this.points.length === 0) {
      this.#renderNoPoints();
    }
  };
}
