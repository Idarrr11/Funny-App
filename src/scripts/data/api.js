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

  // Report Comment
  REPORT_COMMENTS_LIST: (storyId) => `${CONFIG.BASE_URL}/stories/${storyId}/stories`,
  STORE_NEW_REPORT_COMMENT: (storyId) => `${CONFIG.BASE_URL}/stories/${storyId}/stories`,

  // Report Comment
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  SEND_REPORT_TO_ME: (storyId) => `${CONFIG.BASE_URL}/stories/${storyId}/notify-me`,
  SEND_REPORT_TO_USER: (storyId) => `${CONFIG.BASE_URL}/stories/${storyId}/notify`,
  SEND_REPORT_TO_ALL_USER: (storyId) => `${CONFIG.BASE_URL}/stories/${storyId}/notify-all`,
  SEND_COMMENT_TO_REPORT_OWNER: (storyId, commentId) => `${CONFIG.BASE_URL}/stories/${storyId}/stories/${commentId}/notify`,
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
export async function getAllCommentsByReportId(storyId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.REPORT_COMMENTS_LIST(storyId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
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
  if (!accessToken) {
    return {
      ok: false,
      message: "Token tidak ditemukan.",
      data: null,
    };
  }

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log("📦 Response dari backend:", result);

    // Validasi: apakah backend mengembalikan story lengkap
    if (!result.story || !result.story.id) {
      return {
        ok: response.ok,
        message: result.message || "Story berhasil dibuat, tapi data tidak lengkap.",
        data: null, // 👈 biar presenter tahu harus fallback
      };
    }

    return {
      ok: response.ok,
      message: result.message || "Berhasil",
      data: result.story,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      data: null,
    };
  }
}

export async function storeNewCommentByStoryId(storyId, { body }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ body });

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_REPORT_COMMENT(storyId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendStoryNotificationToAllUsers({ id, description }) {
  const accessToken = getAccessToken();

  const payload = {
    title: "Story berhasil dibuat",
    options: {
      body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
    },
  };

  const fetchResponse = await fetch(`${CONFIG.BASE_URL}/reports/${id}/notify-all`, {
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

export async function sendStoryToMeViaNotification(storyId) {
  const accessToken = getAccessToken();

  try {
    const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ME(storyId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Response Status:", fetchResponse.status);
    console.log("Response Status Text:", fetchResponse.statusText);

    // Jika status 404, berikan pesan lebih spesifik
    if (!fetchResponse.ok) {
      if (fetchResponse.status === 404) {
        throw new Error(`Cerita dengan ID ${storyId} tidak ditemukan. Periksa kembali ID-nya.`);
      }
      throw new Error(`Gagal fetch: ${fetchResponse.status} - ${fetchResponse.statusText}`);
    }

    const json = await fetchResponse.json();
    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error("Error di sendStoryToMeViaNotification:", error);
    return {
      ok: false,
      message: error.message,
    };
  }
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
