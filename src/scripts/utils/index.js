import CONFIG from "../config";

export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function setupSkipToContent(element, mainContent) {
  element.addEventListener("click", (event) => {
    event.preventDefault();

    if (mainContent) {
      mainContent.focus();
    } else {
      console.error("Main content element not found");
    }
  });
}

export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(
      () => undefined
    );

    return {
      ready: Promise.reject(Error("View transitions unsupported")),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return document.startViewTransition(updateDOM);
}

export async function reportsWithAddress(listStory, getGeocodedAddress) {
  return Promise.all(
    listStory.map(async (story) => {
      const address =
        story.lat && story.lon
          ? await getGeocodedAddress(story.lat, story.lon)
          : "Lokasi tidak tersedia";

      return {
        ...story,
        location: address,
      };
    })
  );
}

export async function getGeocodedAddress(lat, lon) {
  const API_KEY = `${CONFIG.MAP_SERVICE_API_KEY}`;
  const url = `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }

    return "Alamat tidak ditemukan";
  } catch (error) {
    console.error("getGeocodedAddress: error:", error);
    return "Gagal mendapatkan alamat";
  }
}

export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export function convertBase64ToBlob(
  base64Data,
  contentType = "",
  sliceSize = 512
) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
