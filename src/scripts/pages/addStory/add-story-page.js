import AddStoryPresenter from "./add-story-page-proses";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Camera from "../../utils/camera";
import Map from "../../utils/map";

export default class AddStoryPage {
  #presenter = null;
  #form = null;
  #camera = null;
  #map = null;
  #draggableMarker = null;

  #takenPhoto = null;

  async render() {
    return `
        <div class="container">
          <section class="add-story-section" aria-labelledby="add-story-heading">
            <div class="section-header">
              <h1 id="add-story-heading">
                <i class="fas fa-plus-circle"></i> Tambah Story Baru
              </h1>
              <p class="section-subtitle">Bagikan pengalaman menarik Anda</p>
            </div>

            <form
              id="add-story-form"
              class="story-form"
              enctype="multipart/form-data"
            >
              <div
                role="alert"
                id="form-error"
                class="error-message"
                aria-live="assertive"
              ></div>
              <div
                role="alert"
                id="form-success"
                class="success-message"
                aria-live="assertive"
              ></div>

              <div class="form-group">
                <label for="description" class="form-label">
                  <i class="fas fa-align-left"></i> Deskripsi Story
                </label>
                <textarea
                  id="description"
                  name="description"
                  class="form-control"
                  rows="5"
                  required
                  aria-required="true"
                  placeholder="Ceritakan pengalaman Anda..."
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-camera"></i> Sumber Foto
                </label>
                <div class="photo-options-tabs">
                  <button
                    type="button"
                    class="tab-btn active"
                    data-tab="upload-tab"
                  >
                    <i class="fas fa-upload"></i> Unggah
                  </button>
                  <button type="button" class="tab-btn" data-tab="camera-tab">
                    <i class="fas fa-camera"></i> Kamera
                  </button>
                </div>
              </div>

              <div id="upload-tab" class="photo-option-tab active">
                <div class="file-upload-wrapper">
                  <input
                    type="file"
                    id="photo-upload"
                    name="photo"
                    class="file-upload"
                    accept="image/*"
                    aria-label="Unggah foto"
                  />
                  <label for="photo-upload" class="file-upload-label">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span id="file-name">Pilih file gambar (max 1MB)</span>
                  </label>
                  <p class="help-text">
                    Format: JPG, PNG, atau GIF (Maksimal 1MB)
                  </p>
                </div>
              </div>

              <div id="camera-tab" class="photo-option-tab">
                <div class="camera-preview-wrapper">
                  <video
                    id="camera-preview"
                    class="camera-preview"
                    autoplay
                    playsinline
                  ></video>
                  <canvas id="photo-canvas" class="photo-canvas"></canvas>
                  <div id="camera-loading-container"></div>
                </div>
                <div class="camera-controls">
                  <button type="button" id="start-camera" class="btn-outline">
                    <i class="fas fa-video"></i> Hidupkan Kamera
                  </button>
                  <button
                    type="button"
                    id="capture-btn"
                    class="btn-primary"
                    disabled
                  >
                    <i class="fas fa-camera"></i> Ambil Foto
                  </button>
                  <button
                    type="button"
                    id="retake-btn"
                    class="btn-outline"
                    disabled
                  >
                    <i class="fas fa-redo"></i> Ulangi
                  </button>
                </div>
                <select id="camera-select" class="form-control"></select>
              </div>

              <div id="image-preview" class="image-preview"></div>

              <div id="location-fields" class="location-fields">
                <div class="new-form__location__map__container" id="map">      
                  <div id="map-loading-container"></div> 
                </div>
                
                <div class="form-group">
                  <label for="lat" class="form-label">
                    <i class="fas fa-map-marker-alt"></i> Latitude
                  </label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    class="form-control"
                    step="any",
                    value="-6.200000"
                    placeholder="Contoh: -6.914744",
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label for="lon" class="form-label">
                    <i class="fas fa-map-marker-alt"></i> Longitude
                  </label>
                  <input
                    type="number"
                    id="lon"
                    name="lon"
                    class="form-control"
                    step="any",
                    value="106.816666"
                    placeholder="Contoh: 107.609810",
                    disabled
                  />
                </div>

                <div class="form-group">
                  <button type="button" id="get-location" class="btn-outline">
                    <i class="fas fa-location-arrow"></i> Gunakan Lokasi Saat Ini
                  </button>
                </div>
              </div>

              <div id="submit-button-container">
                <button type="submit" class="submit-btn">
                  <i class="fas fa-paper-plane"></i> Upload Story
                </button>
              </div>
            </form>
          </section>
        </div>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#setupForm();
    this.#setupCamera();
    this.#setupTabs();
    this.#setupLocationToggle();

    await this.initialMap();
  }

  #setupForm() {
    this.#form = document.getElementById("add-story-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(this.#form);

      for (const key of formData.keys()) {
        if (key.startsWith("leaflet-base-layers_")) {
          formData.delete(key);
        }
      }

      const description = document.getElementById("description").value.trim();
      if (!description) {
        this.showError("Deskripsi tidak boleh kosong.");
        return;
      }
      formData.set("description", description);

      const lat = document.getElementById("lat").value ? parseFloat(document.getElementById("lat").value) : null;
      const lon = document.getElementById("lon").value ? parseFloat(document.getElementById("lon").value) : null;

      if (document.getElementById("lat").value && isNaN(lat)) {
        this.showError('"lat" harus berupa angka.');
        return;
      }
      if (document.getElementById("lon").value && isNaN(lon)) {
        this.showError('"lon" harus berupa angka.');
        return;
      }

      if (lat !== null) formData.set("lat", lat);
      if (lon !== null) formData.set("lon", lon);

      if (this.#takenPhoto) {
        formData.set("photo", this.#takenPhoto.blob, "camera-photo.jpg");
      }

      try {
        await this.#presenter.postNewStory(formData);
        this.redirectToHome();
      } catch (error) {
        this.showError(error.message || "Gagal mempublikasikan story.");
      }
    });

    const photoUploadInput = document.getElementById("photo-upload");
    const imagePreview = document.getElementById("image-preview");

    photoUploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      // Hapus preview gambar kalo ngga ada yang dipilih
      if (!file) {
        this.#takenPhoto = null;
        imagePreview.innerHTML = "";
        return;
      }

      // Validasi ukuran file
      if (file.size > 1024 * 1024) {
        this.showError("Ukuran file terlalu besar. Maksimal 1MB.");
        event.target.value = "";
        this.#takenPhoto = null;
        imagePreview.innerHTML = "";
        return;
      }

      // Jika file valid, simpan dan tampilkan preview gambar
      this.#takenPhoto = {
        id: "uploaded",
        blob: file,
      };

      this.#showImagePreview(file);
    });

    // Hapus gambar saat gambar di-klik
    imagePreview.addEventListener("click", () => {
      this.#takenPhoto = null;
      photoUploadInput.value = "";
      imagePreview.innerHTML = "";
    });
  }

  async initialMap() {
    const mapLoadingContainer = document.getElementById("map-loading-container");

    try {
      if (!mapLoadingContainer) {
        return;
      }

      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();

      const mapElement = document.getElementById("map");
      if (mapElement._leaflet_id) {
        map.remove(mapElement);
      }

      this.#map = await Map.build("#map", {
        zoom: 15,
        locate: true,
        layersControl: false,
      });

      const center = this.#map.getCenter();

      this.#draggableMarker = this.#map.addMarker([center.lat, center.lon], {
        draggable: true,
        autoPan: true,
      });

      this.#draggableMarker.on("move", (e) => {
        const coord = e.target.getLatLng();
        this.#updateLatLngInput(coord.lat, coord.lng);
      });

      this.#map.addMapEventListener("click", (e) => {
        this.#draggableMarker.setLatLng(e.latlng);
        this.#map.changeCamera(e.latlng, 15);
      });
    } catch (error) {
      this.showError("Gagal memuat peta. Silakan refresh halaman.");
    } finally {
      if (mapLoadingContainer) {
        mapLoadingContainer.innerHTML = "";
      }
    }
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem("lat").value = latitude;
    this.#form.elements.namedItem("lon").value = longitude;
  }
  #setupCamera() {
    this.#camera = new Camera({
      video: document.getElementById("camera-preview"),
      cameraSelect: document.getElementById("camera-select"),
      canvas: document.getElementById("photo-canvas"),
    });

    document.getElementById("start-camera").addEventListener("click", async () => {
      if (this.#camera.isStreaming()) {
        this.#camera.stop();
        document.getElementById("start-camera").innerHTML = '<i class="fas fa-video"></i> Hidupkan Kamera';
        document.getElementById("capture-btn").disabled = true;
      } else {
        this.showCameraLoading();
        try {
          await this.#camera.launch();
          document.getElementById("start-camera").innerHTML = '<i class="fas fa-video-slash"></i> Matikan Kamera';
          document.getElementById("capture-btn").disabled = false;
        } catch (error) {
          this.showError("Gagal mengakses kamera: " + error.message);
        } finally {
          this.hideCameraLoading();
        }
      }
    });

    document.getElementById("capture-btn").addEventListener("click", async () => {
      this.showCameraLoading();
      try {
        const photoBlob = await this.#camera.takePicture();
        this.#takenPhoto = {
          id: "camera",
          blob: photoBlob,
        };
        this.#showImagePreview(photoBlob);
        this.#camera.stop();
        document.getElementById("start-camera").innerHTML = '<i class="fas fa-video"></i> Hidupkan Kamera';
        document.getElementById("capture-btn").disabled = true;
      } catch (error) {
        this.showError("Gagal mengambil foto: " + error.message);
      } finally {
        this.hideCameraLoading();
      }
    });

    document.getElementById("retake-btn").addEventListener("click", () => {
      this.#takenPhoto = null;
      document.getElementById("image-preview").innerHTML = "";
      document.getElementById("retake-btn").disabled = true;
    });
  }

  #setupTabs() {
    const tabs = document.querySelectorAll(".photo-option-tab");
    const tabBtns = document.querySelectorAll(".tab-btn");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const tabId = btn.getAttribute("data-tab");
        tabs.forEach((tab) => tab.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");

        if (tabId !== "camera-tab" && this.#camera.isStreaming()) {
          this.#camera.stop();
          document.getElementById("start-camera").innerHTML = '<i class="fas fa-video"></i> Hidupkan Kamera';
          document.getElementById("capture-btn").disabled = true;
        }
      });
    });
  }

  #setupLocationToggle() {
    document.getElementById("get-location").addEventListener("click", () => {
      this.showLocationLoading();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            document.getElementById("lat").value = latitude;
            document.getElementById("lon").value = longitude;

            // Pindahkan marker ke lokasi saat ini
            if (this.#draggableMarker) {
              this.#draggableMarker.setLatLng([latitude, longitude]);
              this.#map.changeCamera([latitude, longitude]);
            }

            this.hideLocationLoading();
          },
          (error) => {
            this.showError("Gagal mendapatkan lokasi: " + error.message);
            this.hideLocationLoading();
          }
        );
      } else {
        this.showError("Browser tidak mendukung geolocation");
        this.hideLocationLoading();
      }
    });
  }

  #showImagePreview(imageBlob) {
    const imagePreview = document.getElementById("image-preview");
    imagePreview.innerHTML = "";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(imageBlob);
    img.alt = "Preview gambar";
    img.classList.add("preview-image");
    img.title = "Klik untuk menghapus gambar";
    imagePreview.appendChild(img);

    document.getElementById("retake-btn").disabled = false;
  }

  showSuccess(message) {
    const successElement = document.getElementById("form-success");
    successElement.textContent = message;
    successElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  showError(message) {
    const errorElement = document.getElementById("form-error");
    errorElement.textContent = message;
    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  clearError() {
    document.getElementById("form-error").textContent = "";
  }

  clearSuccess() {
    document.getElementById("form-success").textContent = "";
  }

  clearForm() {
    this.#form.reset();
    this.#takenPhoto = null;
    document.getElementById("image-preview").innerHTML = "";
    document.getElementById("retake-btn").disabled = true;
    this.clearError();
    this.clearSuccess();
  }

  showSubmitLoading() {
    const container = document.getElementById("submit-button-container");
    if (container) {
      container.innerHTML = `
        <button class="btn" type="submit" disabled>
          <i class="fas fa-spinner fa-spin"></i> Memproses...
        </button>
      `;
    } else {
      console.warn("Submit button container not found.");
    }
  }

  hideSubmitLoading() {
    const container = document.getElementById("submit-button-container");
    if (container) {
      container.innerHTML = `
        <button class="btn" type="submit">
          <i class="fas fa-paper-plane"></i> Publikasikan Story
        </button>
      `;
    } else {
      console.warn("Submit button container not found.");
    }
  }

  showCameraLoading() {
    const container = document.getElementById("camera-loading-container");
    if (container) {
      container.innerHTML = generateLoaderAbsoluteTemplate();
    } else {
      console.warn("Camera loading container not found.");
    }
  }

  hideCameraLoading() {
    const container = document.getElementById("camera-loading-container");
    if (container) {
      container.innerHTML = "";
    }
  }

  showLocationLoading() {
    const getLocationBtn = document.getElementById("get-location");
    if (getLocationBtn) {
      getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengambil lokasi...';
      getLocationBtn.disabled = true;
    } else {
      console.warn("Get location button not found.");
    }
  }

  hideLocationLoading() {
    const getLocationBtn = document.getElementById("get-location");
    if (getLocationBtn) {
      getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Gunakan Lokasi Saat Ini';
      getLocationBtn.disabled = false;
    }
  }

  storeSuccessfully(message, storyData) {
    // Misalnya tampilkan notifikasi sukses
    alert(`✅ ${message}`);

    // Atau redirect, atau update UI:
    console.log("Story berhasil disimpan:", storyData);
  }

  redirectToHome() {
    window.location.hash = "#/";
  }
}
