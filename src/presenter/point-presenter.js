import EditPointView from '../view/edit-point-view.js';
import PointView from '../view/point-view.js';
import {render, replace, remove} from '../framework/render.js';
import {UserAction, UpdateType} from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #container = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #point = null;
  #mode = Mode.DEFAULT;

  #destinations = null;
  #offers = null;

  constructor({container, onDataChange, onModeChange, destinations, offers}) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init(point) {
    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    const destinationObj = this.#destinations.find((d) => d.id === point.destination);
    const typeOffers = this.#offers[point.type] || [];

    this.#pointComponent = new PointView({
      point: this.#point,
      destination: destinationObj,
      typeOffers,
      onArrowClick: this.#handleEditClick,
      onStarClick: this.#handleFavoriteClick,
    });

    this.#pointEditComponent = new EditPointView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      onArrowClick: this.#handleCloseClick,
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevPointEditComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToCard();
    }
  }

  #replaceCardToForm() {
    this.#handleModeChange();
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDITING;
  }

  #replaceFormToCard() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToCard();
    }
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleCloseClick = () => {
    this.#replaceFormToCard();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    ).catch(() => {});
  };

  #handleFormSubmit = async (updatedPoint) => {
    this.#pointEditComponent.setSaving(true);
    try {
      await this.#handleDataChange(
        UserAction.UPDATE_POINT,
        UpdateType.MINOR,
        updatedPoint,
      );
    } catch {
      this.#pointEditComponent.shake(() => this.#pointEditComponent.setSaving(false));
    }
  };

  #handleDeleteClick = async (point) => {
    this.#pointEditComponent.setDeleting(true);
    try {
      await this.#handleDataChange(
        UserAction.DELETE_POINT,
        UpdateType.MINOR,
        point,
      );
    } catch {
      this.#pointEditComponent.shake(() => this.#pointEditComponent.setDeleting(false));
    }
  };
}
