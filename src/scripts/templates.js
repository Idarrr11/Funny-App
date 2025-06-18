import { showFormattedDate } from "./utils";

export function generateLoaderTemplate() {
  return `
      <div class="loader"></div>
    `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
      <li id="push-notification-tools" class="push-notification-tools"></li>
      <li><a id="login-button" href="#/login">Login</a></li>
      <li><a id="register-button" href="#/register">Register</a></li>
    `;
}
export function generateMainNavigationListTemplate() {
  return `
      <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Story</a></li>
    `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
      <li id="push-notification-tools" class="push-notification-tools"></li>
      <li><a id="new-story-button" class="btn new-story-button" href="#/add-story">Buat Story <i class="fas fa-plus"></i></a></li>
      <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada laporan yang tersedia</h2>
      <p>Saat ini, tidak ada laporan kerusakan fasilitas umum yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar laporan</h2>
      <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
    </div>
  `;
}

export function generateStoryItemTemplate({ id, description, photoUrl, Name, createdAt, location }) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="${description}">
      <div class="story-item__body">
        <div class="story-item__main">
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, "id-ID")}
            </div>
            <div class="story-item__location">
              <i class="fas fa-map"></i> ${location || "Lokasi tidak tersedia untuk cerita ini"}
            </div>
          </div>
        </div>
        <div id="story-description" class="story-item__description">
          ${description}
        </div>
        <div class="story-item__more-info">
          <div class="story-item__author">
            Dilaporkan oleh: ${Name}
          </div>
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateStoryDetailImageTemplate(imageUrl = null, alt = "") {
  if (!imageUrl) {
    return `
      <img class="story-detail__image" src="images/placeholder-image.jpg" alt="Placeholder Image">
    `;
  }

  return `
    <img class="story-detail__image" src="${imageUrl}" alt="${alt}">
  `;
}

export function generateStoryDetailTemplate({ name, description, photoUrl, location, createdAt }) {
  const createdAtFormatted = showFormattedDate(createdAt, "id-ID");

  const image = generateStoryDetailImageTemplate(photoUrl, name);

  return `
   <article class="story-detail">
  <!-- Story Image -->
  <div class="story-image-container">
    <div id="images" class="story-detail__images">${image}</div>
  </div>

  <!-- Story Content -->
  <div class="story-content">
    <!-- Heading utama halaman -->
    <header class="story-header">
      <h1 class="story-detail__title">Detail Cerita</h1>
      <div class="story-meta">
        <div class="author">
          <i class="fas fa-user"></i>
          <span>${name}</span>
        </div>
        <div class="date">
          <i class="far fa-calendar-alt"></i>
          <span>${createdAtFormatted}</span>
        </div>
        <div class="location">
          <i class="fas fa-map"></i>
          <span>${location}</span>
        </div>
      </div>
    </header>

    <!-- Deskripsi Cerita -->
    <section class="story-description">
      <h2 class="story-detail__description__title">Informasi Lengkap</h2>
      <div id="description" class="story-detail__description__body">
        ${description}
      </div>
    </section>

    <!-- Peta Lokasi -->
    <section class="story-detail__body__map__container">
      <h2 class="story-detail__map__title">Peta Lokasi</h2>
      <div class="story-detail__map__container">
        <div id="map" class="story-detail__map"></div>
        <div id="map-loading-container"></div>
      </div>
    </section>
  </div>
</article>
  `;
}
