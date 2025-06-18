export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async postNewStory(formData) {
    this.#view.showSubmitLoading();
    this.#view.clearError();

    try {
      const response = await this.#model.storeNewStory(formData);

      if (!response.ok) {
        this.#view.showError(response.message);
        return;
      }

      const storyData = response.data;

      // Tampilkan sukses di view
      this.#view.storeSuccessfully(response.message, storyData);
    } catch (error) {
      console.error("postNewStory error:", error);
      this.#view.showError("Terjadi kesalahan: " + error.message);
    } finally {
      this.#view.hideSubmitLoading();
    }
  }
}
