import TripPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/task-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './service/points-api-service.js';

const AUTHORIZATION = 'Basic m7t2xq9vj4pk1nw';
const END_POINT = 'https://21.objects.htmlacademy.pro/big-trip';

const newEventButton = document.querySelector('.trip-main__event-add-btn');
newEventButton.disabled = true;

const apiService = new PointsApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel(apiService);
const filterModel = new FilterModel();

const tripPresenter = new TripPresenter({
  pointsModel,
  filterModel,
  onNewPointFormClose: () => {
    newEventButton.disabled = false;
  },
  onLoadingComplete: () => {
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
pointsModel.init();
