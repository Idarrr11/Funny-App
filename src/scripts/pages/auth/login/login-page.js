import * as AuthModel from "../../../utils/auth";
import * as StoryAPI from "../../../data/api";
import LoginPresenter from "./login-page-proses";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
    <div class="container">
        <div class="auth-container">
          <!-- Login Card -->
          <section class="auth-card login-card" aria-labelledby="login-heading">
            <div class="auth-header">
              <h1 id="login-heading">
                <i class="fas fa-sign-in-alt"></i> Masuk ke Akun Anda
              </h1>
              <p class="auth-subtitle">
                Silakan masukkan email dan kata sandi Anda
              </p>
            </div>

            <form
              id="login-form"
              class="auth-form"
              action="/login"
              method="post"
            >
              

              <fieldset class="form-section">
                <legend>
                  <i class="fas fa-user-circle"></i> Informasi Login
                </legend>

                <div class="form-group">
                  <label for="email" class="form-label">
                    <i class="fas fa-envelope"></i> Alamat Email
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      class="form-control"
                      required
                      aria-required="true"
                      autocomplete="email"
                    />
                    <i class="fas fa-envelope input-icon"></i>
                  </div>
                </div>

                <div class="form-group">
                  <label for="password" class="form-label">
                    <i class="fas fa-lock"></i> Kata Sandi
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      class="form-control"
                      required
                      aria-required="true"
                      autocomplete="current-password"
                    />
                    <i class="fas fa-lock input-icon"></i>
                    <button
                      type="button"
                      class="password-toggle"
                      id="toggle-password"
                      aria-label="Tampilkan kata sandi"
                      aria-pressed="false"
                    >
                      <i class="far fa-eye"></i>
                    </button>
                  </div>
                </div>
              </fieldset>

              <div id="submit-button-container">
                <button type="submit" class="submit-btn">
                  <i class="fas fa-sign-in-alt"></i> Masuk
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authService: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };
        await this.#presenter.getLogin(data);
      });

    // Fitur show Password
    const togglePasswordButton = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password");

    togglePasswordButton.addEventListener("click", () => {
      const isPasswordVisible = passwordInput.type === "text";
      passwordInput.type = isPasswordVisible ? "password" : "text";
      togglePasswordButton.setAttribute("aria-pressed", !isPasswordVisible);
      togglePasswordButton.innerHTML = isPasswordVisible
        ? '<i class="far fa-eye"></i>'
        : '<i class="far fa-eye-slash"></i>';
    });
  }

  loginSuccess(message) {
    console.log(message);

    location.hash = "/";
  }

  loginFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit"><i class="fas fa-sign-in-alt"></i>Masuk</button>
    `;
  }
}
