import CONFIG from "../config";
import { getAccessToken } from "../utils/auth";
import { reportsWithAddress, getGeocodedAddress } from "../utils";

const ENDPOINTS = {
  // Auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Stories
  STORY_LIST: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  // Notification
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// ✅ Register
export async function getRegistered({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await response.json();
    return { ...json, ok: response.ok };
  } catch (error) {
    return { ok: false, error: true, message: error.message };
  }
}

export async function getLogin({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    return { ...json, ok: response.ok };
  } catch (error) {
    return { ok: false, error: true, message: error.message };
  }
}

export async function getAllStories({ page = 1, size = 10, location = 0 } = {}) {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: "Unauthorized", data: [] };

  const url = new URL(ENDPOINTS.STORY_LIST);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  url.searchParams.append("location", location);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await response.json();

    if (!response.ok) throw new Error(json.message || "Gagal memuat data");

    const data = await reportsWithAddress(json.listStory, getGeocodedAddress);

    return {
      ok: true,
      message: json.message,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      data: [],
    };
  }
}

// ✅ Ambil Story by ID
export async function getStoryById(id) {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: "Unauthorized" };

  try {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await response.json();

    const location = await getGeocodedAddress(json.story.lat, json.story.lon);

    return {
      ...json,
      ok: response.ok,
      data: { ...json.story, location },
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
    };
  }
}

// ✅ Submit Story Baru (Autentikasi)
export async function storeNewStory(formData) {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: "Token tidak ditemukan." };

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    return {
      ok: response.ok,
      message: result.message || "Berhasil",
      data: result.story ?? result, // ✅ pastikan 'data' pasti ada dan memiliki 'id'
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      data: null,
    };
  }
}

export async function sendStoryNotificationToAllUsers({ storyId, description }) {
  const accessToken = getAccessToken();

  const payload = {
    title: "Story berhasil dibuat",
    options: {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
    },
  };

  const fetchResponse = await fetch(`${CONFIG.BASE_URL}/reports/${storyId}/notify-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// ✅ Subscribe Web Push
export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: "Unauthorized" };

  try {
    const response = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ endpoint, keys: { p256dh, auth } }),
    });

    const json = await response.json();
    return { ...json, ok: response.ok };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// ✅ Unsubscribe Web Push
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: "Unauthorized" };

  try {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    const json = await response.json();
    return { ...json, ok: response.ok };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
