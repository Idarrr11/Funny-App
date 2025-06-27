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

      let storyData = response.data;
      let storyId = storyData?.id;

      // ✅ Fallback: jika ID tidak ditemukan, ambil cerita terbaru
      if (!storyId) {
        console.warn("⚠️ ID tidak ditemukan. Mencoba fallback getAllStories...");

        const fallback = await this.#model.getAllStories({ size: 1 });
        const list = fallback.data?.listStory || fallback.data;

        console.log("📦 Fallback story list:", list); // 👈 Tambahkan ini

        if (Array.isArray(list) && list.length > 0) {
          storyData = list[0];
          storyId = storyData.id;

          console.log("✅ Mengambil storyId dari fallback:", storyId);
        }
      }

      if (!storyId) {
        throw new Error("ID story tidak ditemukan bahkan setelah fallback.");
      }

      this.#view.storeSuccessfully(response.message, storyData);
      window.location.hash = `#/stories/${storyId}`;
    } catch (error) {
      console.error("❌ postNewStory error:", error);
      this.#view.showError("Terjadi kesalahan: " + error.message);
    } finally {
      this.#view.hideSubmitLoading();
    }
  }
}
