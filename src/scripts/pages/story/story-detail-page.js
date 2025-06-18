import { generateLoaderAbsoluteTemplate, generateStoryDetailTemplate, generateStoriesListErrorTemplate } from "../../templates";
import StoryDetailPresenter from "./story-detail-page-proses";
import { parseActivePathname } from "../../routes/url-parser";
import Map from "../../utils/map";
import * as StoryAPI from "../../data/api";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
    <section>
        <div class="story-detail__container">
          <div id="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
    </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      storyModel: StoryAPI,
    });

    await this.#presenter.showStoryDetail();
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

    // Map
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
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 13,
      locate: true,
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
}
