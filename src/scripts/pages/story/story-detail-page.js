import {
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
  generateLoaderAbsoluteTemplate,
  generateRemoveReportButtonTemplate,
  generateStoryItemTemplate,
  generateStoriesDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveReportButtonTemplate,
} from "../../templates";

import StoryDetailProses from "./story-detail-page-proses";
import { parseActivePathname } from "../../routes/url-parser";
import Map from "../../utils/map";
import * as StoryId from "../../data/api";
import Database from "../../data/database";

export default class StoryDetailPage {
  #presenter = null;
  #form = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <hr>
        <div class="report-detail__comments__container">
          <div class="report-detail__comments-form__container">
            <h2 class="report-detail__comments-form__title">Beri Tanggapan</h2>
            <form id="comments-list-form" class="report-detail__comments-form__form">
              <textarea name="body" placeholder="Beri tanggapan terkait laporan."></textarea>
              <div id="submit-button-container">
                <button class="btn" type="submit">Tanggapi</button>
              </div>
            </form>
          </div>
          <hr>
          <div class="report-detail__comments-list__container">
            <div id="report-detail-comments-list"></div>
            <div id="comments-list-loading-container"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { id: storyId } = parseActivePathname();
    console.log("✅ Parsed storyId from URL:", storyId);

    if (!storyId) {
      console.error("❌ ID tidak ditemukan di URL.");
      this.populateStoryDetailError("Cerita tidak ditemukan.");
      return;
    }

    try {
      this.#presenter = new StoryDetailProses(storyId, {
        view: this,
        storyModel: StoryId,
        dbModel: Database,
      });
    } catch (err) {
      console.error("❌ Gagal inisialisasi presenter:", err.message);
      this.populateStoryDetailError("Terjadi kesalahan memuat halaman.");
      return;
    }

    this.#setupForm();

    await this.#presenter.showStoryDetail();
    await this.#presenter.getCommentsList();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    document.getElementById("story-detail").innerHTML = generateStoryDetailTemplate({
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      location: story.location,
      lat: story.lat,
      lon: story.lon,
    });

    console.log("📌 Story ID yang dikirimkan:", story.id);

    await this.#presenter.showStoryDetailMap();

    if (this.#map) {
      const { lat, lon, description } = story;

      const coordinate = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
      const markerOptions = { alt: description };
      const popupOptions = {
        content: description || "No description available",
      };

      this.#map.changeCamera(coordinate);
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    }

    await this.#presenter.showSaveButton();
    this.addNotifyMeEventListener();
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML = generateStoriesDetailErrorTemplate(message);
  }

  populateReportDetailComments(message, stories) {
    if (!stories || stories.length === 0) {
      this.populateCommentsListEmpty();
      return;
    }

    const html = stories.reduce(
      (accumulator, story) =>
        accumulator.concat(
          generateStoryItemTemplate({
            name: story.name,
            description: story.description,
            photoUrl: story.photoUrl,
            createdAt: story.createdAt,
            location: story.location,
            lat: story.lat,
            lon: story.lon,
          })
        ),
      ""
    );

    document.getElementById("report-detail-comments-list").innerHTML = `
      <div class="report-detail__comments-list">${html}</div>
    `;
  }

  populateCommentsListEmpty() {
    document.getElementById("report-detail-comments-list").innerHTML = generateStoriesListEmptyTemplate();
  }

  populateCommentsListError(message) {
    document.getElementById("report-detail-comments-list").innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 13,
      locate: true,
    });
  }

  #setupForm() {
    this.#form = document.getElementById("comments-list-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        body: this.#form.elements.namedItem("body").value,
      };
      await this.#presenter.postNewComment(data);
    });
  }

  postNewCommentSuccessfully(message) {
    console.log(message);
    this.#presenter.showStoryDetail();
    this.clearForm();
  }

  postNewCommentFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  renderSaveButton() {
    document.getElementById("save-actions-container").innerHTML = generateSaveReportButtonTemplate();

    document.getElementById("story-detail-save").addEventListener("click", async () => {
      await this.#presenter.saveStory();
      await this.#presenter.showSaveButton();
    });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById("save-actions-container").innerHTML = generateRemoveReportButtonTemplate();

    document.getElementById("report-detail-remove").addEventListener("click", async () => {
      await this.#presenter.removeStory();
      await this.#presenter.showSaveButton();
    });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }

  addNotifyMeEventListener() {
    document.getElementById("report-detail-notify-me").addEventListener("click", () => {
      this.#presenter.notifyMe();
    });
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById("map-loading-container");
    if (!mapLoadingContainer) {
      console.warn("map-loading-container belum dirender.");
      return;
    }

    mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showCommentsLoading() {
    document.getElementById("comments-list-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideCommentsLoading() {
    document.getElementById("comments-list-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Tanggapi
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Tanggapi</button>
    `;
  }
}
