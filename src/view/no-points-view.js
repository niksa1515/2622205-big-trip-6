import AbstractView from '../framework/view/abstract-view.js';
import { NoPointsMessage } from '../const.js';

function createNoPointsTemplate(filterType) {
  return `<p class="trip-events__msg">${NoPointsMessage[filterType]}</p>`;
}

export default class NoPointsView extends AbstractView {
  #filterType = null;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointsTemplate(this.#filterType);
  }
}
