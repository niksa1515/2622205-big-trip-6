import {createElement} from '../render.js';
import {capitalizeFirstLetter} from '../utils.js';

const FILTER_TYPES = ['everything', 'future', 'present', 'past'];

const createFilterPanelItemTemplate = (type) => {
  const capitalizedType = capitalizeFirstLetter(type);
  const isChecked = type === 'everything' ? 'checked' : '';

  return `
    <div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${type}" ${isChecked}>
      <label class="trip-filters__filter-label" for="filter-${type}">${capitalizedType}</label>
    </div>
  `;
};

const createFilterPanelTemplate = () => `
    <form class="trip-filters" action="#" method="get"> ${FILTER_TYPES.map((type) => createFilterPanelItemTemplate(type)).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
`;

export default class FilterPanelView {
  getTemplate() {
    return createFilterPanelTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
