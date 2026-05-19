import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate(filterType, currentFilter, count) {
  const label = filterType.charAt(0).toUpperCase() + filterType.slice(1);
  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${filterType}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${filterType}"
        ${filterType === currentFilter ? 'checked' : ''}
        ${count === 0 ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${filterType}">${label}</label>
    </div>
  `;
}

function createFilterTemplate(filters, currentFilter) {
  const filtersTemplate = filters
    .map(({type, count}) => createFilterItemTemplate(type, currentFilter, count))
    .join('');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filtersTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterChange = null;

  constructor({filters, currentFilter, onFilterChange}) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilter);
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterChange(evt.target.value);
  };
}
