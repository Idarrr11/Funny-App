import { reportMapper } from "../../data/api-mapper";

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showReportsListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showReportsListLoading();

    try {
      await this.showReportsListMap();

      const response = await this.#model.getAllStories();
      const listOfReports = response.data;

      if (!Array.isArray(listOfReports)) {
        throw new Error("Data yang diterima bukan array");
      }

      const reports = await Promise.all(listOfReports.map(reportMapper));

      this.#view.populateBookmarkedReports("✅ Berhasil mendapatkan daftar laporan tersimpan.", reports);
    } catch (error) {
      console.error("initialGalleryAndMap: error:", error);
      this.#view.populateBookmarkedReportsError(error.message);
    } finally {
      this.#view.hideReportsListLoading();
    }
  }
}
