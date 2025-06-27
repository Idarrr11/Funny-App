import { getActiveRoute } from "../routes/url-parser";
import CONFIG from "../config";

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
}

export function saveAccessToken(accessToken) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, accessToken);
    return true;
  } catch (error) {
    console.error("Error saving access token:", error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Error removing access token:", error);
    return false;
  }
}

const unauthenticatedRoutes = [
  "/register",
  "/login",
  "/stories",
  "/stories/:id",
];

export function checkUnauthenticatedRoute(page) {
  const url = getActiveRoute();
  const isAuthenticated = !!getAccessToken();

  if (unauthenticatedRoutes.includes(url) && isAuthenticated) {
    location.hash = "/";
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isAuthenticated = !!getAccessToken();

  if (!isAuthenticated) {
    location.hash = "/login";
    return null;
  }
  return page;
}

export function getLogout() {
  removeAccessToken();
}
