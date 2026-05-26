import AbstractView from '../framework/view/abstract-view.js';

function createInfoTemplate(infoData) {
  const {title, dates, totalCost} = infoData;

  const datesTemplate = dates
    ? `${dates.start}&nbsp;&mdash;&nbsp;${dates.end}`
    : '';

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>
        <p class="trip-info__dates">${datesTemplate}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #infoData = null;

  constructor(infoData) {
    super();
    this.#infoData = infoData;
  }

  get template() {
    return createInfoTemplate(this.#infoData);
  }
}
