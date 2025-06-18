export default class StoryDetailPresenter {
  #srotyId;
  #view;
  #storyModel;

  constructor(id, { view, storyModel }) {
    this.#srotyId = id;
    this.#view = view;
    this.#storyModel = storyModel;
  }

  async showStoryDetailMap() {
    try {
      this.#view.showMapLoading();
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoryDetailMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#storyModel.getStoryById(this.#srotyId);

      if (!response.ok) {
        console.error("showStoryDetailAndMap: response:", response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }

      this.#view.populateStoryDetailAndInitialMap(response.message, response.data);
    } catch (error) {
      console.error("showStoryDetailAndMap: error:", error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }
}
