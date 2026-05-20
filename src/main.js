import TripPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/task-model.js';
import FilterModel from './model/filter-model.js';

const pointsModel = new PointsModel();
const filterModel = new FilterModel();

const newEventButton = document.querySelector('.trip-main__event-add-btn');

const tripPresenter = new TripPresenter({
  pointsModel,
  filterModel,
  onNewPointFormClose: () => {
    newEventButton.disabled = false;
  },
});

const filterPresenter = new FilterPresenter({
  filterContainer: document.querySelector('.trip-controls__filters'),
  filterModel,
  pointsModel,
});

newEventButton.addEventListener('click', () => {
  tripPresenter.createPoint();
  newEventButton.disabled = true;
});

filterPresenter.init();
tripPresenter.init();
