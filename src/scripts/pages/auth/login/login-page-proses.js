export default class LoginPresenter {
  #view;
  #model;
  #authService;

  constructor({ view, model, authService }) {
    this.#view = view;
    this.#model = model;
    this.#authService = authService;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        this.#view.loginFailed(
          response.message || "Login failed. Please try again."
        );
        return;
      }

      if (!response.loginResult || !response.loginResult.token) {
        this.#view.loginFailed(
          "Invalid response from server. Please try again."
        );
        return;
      }

      this.#authService.saveAccessToken(response.loginResult.token);
      this.#view.loginSuccess(response.message, response.loginResult);
    } catch (error) {
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
