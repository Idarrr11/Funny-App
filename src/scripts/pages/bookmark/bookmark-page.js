import { generateLoaderAbsoluteTemplate, generateStoryItemTemplate, generateReportsListEmptyTemplate, generateReportsListErrorTemplate } from "../../templates";

import BookmarkProses from "./bookmark-proses.js";
import Database from "../../data/database.js";
import * as StoryId from "../../data/api"; // ✅ pastikan nama benar
import Map from "../../utils/map.js";

export default class BookmarkPage {
  #proses = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita Tersimpan</h1>
        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#proses = new BookmarkProses({
      view: this,
      storyModel: StoryId,
      model: Database,
    });

    await this.#proses.initialGalleryAndMap();
  }

  populateBookmarkedReports(message, stories) {
    if (!stories || stories.length === 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      // Validasi properti wajib
      if (story && story.lat && story.lon && story.name && story.description) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.description || "No description available" };

        if (this.#map) {
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        }
      } else {
        console.error("Story is missing required properties:", story);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          id: story.id || story._id || crypto.randomUUID(), // ✅ pastikan ID aman
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          location: story.location,
          lat: story.lat,
          lon: story.lon,
          reportedBy: story.reportedBy || story.name || "Anonim", // ✅ fallback untuk pelapor
        })
      );
    }, "");

    document.getElementById("reports-list").innerHTML = `
      <div class="reports-list">${html}</div>
    `;
  }

  populateBookmarkedReportsListEmpty() {
    document.getElementById("reports-list").innerHTML = generateReportsListEmptyTemplate();
  }

  populateBookmarkedReportsError(message) {
    document.getElementById("reports-list").innerHTML = generateReportsListErrorTemplate(message);
  }

  showReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML = "";
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
