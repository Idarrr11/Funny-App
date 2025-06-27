import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";

import Map from "../../utils/map";
import HomeProses from "./home-page-proses";
import * as SrotyAPI from "../../data/api";

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title"><i class="fas fa-newspaper"></i> Cerita Lucu Terbaru</h1>

        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomeProses({
      view: this,
      model: SrotyAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    const storiesListElement = document.getElementById("stories-list");
    if (!storiesListElement) {
      console.warn("Stories list element not found.");
      return;
    }

    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((acc, story) => {
      if (this.#map) {
        const { lat, lon, description } = story;

        // Validate coordinates
        if (lat == null || lon == null) {
          return acc;
        }

        const coordinate =
          lat != null && lon != null ? [lat, lon] : [-6.2, 106.816666];
        const markerOptions = { alt: description };
        const popupOptions = { content: description };

        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }
      return acc.concat(
        generateStoryItemTemplate({
          ...story,
          Name: story.name,
          location: story.location || "Lokasi tidak tersedia",
        })
      );
    }, "");

    storiesListElement.innerHTML = `
      <div class="stories-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    const storiesListElement = document.getElementById("stories-list");
    if (!storiesListElement) {
      console.warn("Stories list element not found.");
      return;
    }

    storiesListElement.innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    const storiesListElement = document.getElementById("stories-list");
    if (!storiesListElement) {
      console.warn("Stories list element not found.");
      return;
    }

    storiesListElement.innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    if (this.#map) {
      this.#map.eachLayer((layer) => this.#map.removeLayer(layer));
      this.#map.off();
      this.#map.remove();
      this.#map = null;
    }

    this.#map = await Map.build("#map", {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container"
    );
    if (!mapLoadingContainer) {
      console.warn("Map loading container not found.");
      return;
    }

    mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container"
    );
    if (!mapLoadingContainer) {
      console.warn("Map loading container not found.");
      return;
    }

    mapLoadingContainer.innerHTML = "";
  }

  showLoading() {
    const storiesListLoadingContainer = document.getElementById(
      "stories-list-loading-container"
    );
    if (!storiesListLoadingContainer) {
      console.warn("Stories list loading container not found.");
      return;
    }

    storiesListLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    const storiesListLoadingContainer = document.getElementById(
      "stories-list-loading-container"
    );
    if (!storiesListLoadingContainer) {
      console.warn("Stories list loading container not found.");
      return;
    }

    storiesListLoadingContainer.innerHTML = "";
  }
}
