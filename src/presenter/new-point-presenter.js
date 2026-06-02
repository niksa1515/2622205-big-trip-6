import EditPointView from '../view/edit-point-view.js';
import {render, remove, RenderPosition} from '../framework/render.js';
import {UserAction, UpdateType} from '../const.js';
import {isEscKey} from '../utils.js';

export default class NewPointPresenter {
  #pointListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({pointListContainer, onDataChange, onDestroy}) {
    this.#pointListContainer = pointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(destinations, offers) {
    if (this.#pointEditComponent !== null) {
      return;
    }

    this.#pointEditComponent = new EditPointView({
      destinations,
      offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleCancelClick,
      onArrowClick: this.#handleCancelClick,
    });

    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#handleDestroy();
  }

  #handleFormSubmit = async (point) => {
    this.#pointEditComponent.setSaving(true);
    try {
      await this.#handleDataChange(
        UserAction.ADD_POINT,
        UpdateType.MINOR,
        point,
      );
    } catch {
      this.#pointEditComponent.shake(() => this.#pointEditComponent.setSaving(false));
    }
  };

  #handleCancelClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (isEscKey(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };
}
