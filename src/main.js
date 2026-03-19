import TripPresenter from './presenter/board-presenter.js';
import Model from './model/task-model.js';

const tripModel = new Model();
const tripPresenter = new TripPresenter(tripModel);

tripPresenter.init();
