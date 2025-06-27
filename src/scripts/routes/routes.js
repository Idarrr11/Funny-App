import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import BookmarkPage from '../pages/bookmark/bookmark-page';
import AddStoryPage from "../pages/addStory/add-story-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRoute,
} from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRoute(new LoginPage()),
  "/register": () => checkUnauthenticatedRoute(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/stories/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/add-story": () => checkAuthenticatedRoute(new AddStoryPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

export default routes;
