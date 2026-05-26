import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {EVENT_TYPES} from '../const.js';
import {formatEditDate} from '../utils.js';

function createEditPointTemplate(state = {}, destinations = [], offers = {}) {
  const {
    type = EVENT_TYPES[0],
    destination: destinationId = '',
    dateFrom = new Date(),
    dateTo = new Date(),
    basePrice = 0,
    offers: selectedOfferIds = [],
    id,
    isSaving = false,
    isDeleting = false,
  } = state;

  const isDisabled = isSaving || isDeleting;
  const deleteButtonText = isDeleting ? 'Deleting...' : 'Delete';
  const resetButtonText = id ? deleteButtonText : 'Cancel';

  const destination = destinations.find((dest) => dest.id === destinationId) || {name: '', description: '', pictures: []};
  const typeOffers = offers[type] || [];

  const dateTimeFrom = formatEditDate(dateFrom);
  const dateTimeTo = formatEditDate(dateTo);

  const eventTypesTemplate = EVENT_TYPES.map((eventType) => `
    <div class="event__type-item">
      <input
        id="event-type-${eventType}-1"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${eventType}"
        ${eventType === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
        ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
      </label>
    </div>
  `).join('');

  const destinationsTemplate = destinations.map((dest) => `
    <option value="${he.encode(dest.name)}"></option>
  `).join('');

  const offersTemplate = typeOffers.length > 0 ? `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${typeOffers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${offer.id}"
              type="checkbox"
              name="event-offer-${offer.id}"
              value="${offer.id}"
              ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${offer.id}">
              <span class="event__offer-title">${he.encode(offer.title)}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  const destinationDescriptionTemplate = destination.description ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${he.encode(destination.description)}</p>
      ${destination.pictures.length > 0 ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((pic) => `
              <img class="event__photo" src="${he.encode(pic.src)}" alt="${he.encode(pic.description)}">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${he.encode(destination.name)}"
              list="destination-list-1"
              required
              ${isDisabled ? 'disabled' : ''}
            >
            <datalist id="destination-list-1">
              ${destinationsTemplate}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${dateTimeFrom}"
              ${isDisabled ? 'disabled' : ''}
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${dateTimeTo}"
              ${isDisabled ? 'disabled' : ''}
            >
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="number"
              name="event-price"
              value="${basePrice}"
              min="0"
              step="1"
              required
              ${isDisabled ? 'disabled' : ''}
            >
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>${resetButtonText}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${offersTemplate}
          ${destinationDescriptionTemplate}
        </section>
      </form>
    </li>
  `;
}

export default class EditPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #submitCallback = null;
  #deleteCallback = null;
  #arrowCallback = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({point = null, destinations = [], offers = {}, onFormSubmit, onDeleteClick, onArrowClick}) {
    super();
    this._state = EditPointView.parsePointToState(point);
    this.#destinations = destinations;
    this.#offers = offers;
    this.#submitCallback = onFormSubmit;
    this.#deleteCallback = onDeleteClick;
    this.#arrowCallback = onArrowClick;

    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state, this.#destinations, this.#offers);
  }

  removeElement() {
    super.removeElement();
    this.#datepickerFrom?.destroy();
    this.#datepickerTo?.destroy();
    this.#datepickerFrom = null;
    this.#datepickerTo = null;
  }

  setSaving(isSaving) {
    this.updateElement({isSaving});
  }

  setDeleting(isDeleting) {
    this.updateElement({isDeleting});
  }

  _restoreHandlers() {
    this.element.querySelector('.event--edit').addEventListener('submit', this.#handleFormSubmit);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#handleDeleteClick);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#arrowCallback);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#handleTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationChange);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#handlePriceInput);

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#handleOfferChange);
    }

    this.#initDatepickers();
  }

  #initDatepickers() {
    const datePickerConfig = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      ['time_24hr']: true,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...datePickerConfig,
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onChange: ([userDate]) => {
          this._setState({dateFrom: userDate});
          this.#datepickerTo.set('minDate', userDate);
        },
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...datePickerConfig,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: ([userDate]) => {
          this._setState({dateTo: userDate});
          this.#datepickerFrom.set('maxDate', userDate);
        },
      }
    );
  }

  #handleFormSubmit = (evt) => {
    evt.preventDefault();
    this.#submitCallback(EditPointView.parseStateToPoint(this._state));
  };

  #handleDeleteClick = (evt) => {
    evt.preventDefault();
    this.#deleteCallback(EditPointView.parseStateToPoint(this._state));
  };

  #handleTypeChange = (evt) => {
    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #handleDestinationChange = (evt) => {
    const matched = this.#destinations.find((dest) => dest.name === evt.target.value);
    if (matched) {
      this.updateElement({destination: matched.id});
    } else {
      const currentDest = this.#destinations.find((dest) => dest.id === this._state.destination);
      evt.target.value = currentDest ? currentDest.name : '';
    }
  };

  #handlePriceInput = (evt) => {
    const value = parseInt(evt.target.value, 10);
    evt.target.value = isNaN(value) || value < 0 ? 0 : Math.floor(value);
    this._setState({basePrice: Number(evt.target.value)});
  };

  #handleOfferChange = (evt) => {
    if (!evt.target.classList.contains('event__offer-checkbox')) {
      return;
    }
    const offerId = evt.target.value;
    const currentOffers = [...this._state.offers];
    if (evt.target.checked) {
      currentOffers.push(offerId);
    } else {
      const idx = currentOffers.indexOf(offerId);
      if (idx !== -1) {
        currentOffers.splice(idx, 1);
      }
    }
    this._setState({offers: currentOffers});
  };

  static parsePointToState(point) {
    return point
      ? {...point, isSaving: false, isDeleting: false}
      : {
        type: EVENT_TYPES[0],
        destination: '',
        dateFrom: new Date(),
        dateTo: new Date(),
        basePrice: 0,
        offers: [],
        isFavorite: false,
        isSaving: false,
        isDeleting: false,
      };
  }

  static parseStateToPoint(state) {
    return {
      id: state.id,
      type: state.type,
      destination: state.destination,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      basePrice: state.basePrice,
      offers: state.offers,
      isFavorite: state.isFavorite,
    };
  }
}
