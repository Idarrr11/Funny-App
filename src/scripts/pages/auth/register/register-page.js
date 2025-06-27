import RegisterPresenter from "./register-page-proses";
import * as DicodingStoryAPI from "../../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <div class="container">
        <div class="auth-container">
          <!-- Register Card -->
          <section
            class="auth-card register-card"
            aria-labelledby="register-heading"
          >
            <div class="auth-header">
              <h1 id="register-heading">
                <i class="fas fa-user-plus"></i> Buat Akun Baru
              </h1>
              <p class="auth-subtitle">Isi form berikut untuk membuat akun</p>
            </div>

            <form
              id="register-form"
              class="auth-form"
              action="/register"
              method="post"
              novalidate
            >
             

              <!-- Personal Info Section -->
              <fieldset class="form-section">
                <legend>
                  <i class="fas fa-user-circle"></i> Informasi Pribadi
                </legend>

                <div class="form-group">
                  <label for="fullname" class="form-label">
                    <i class="fas fa-user"></i> Nama Lengkap
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      class="form-control"
                      required
                      aria-required="true"
                      autocomplete="name"
                    />
                    <i class="fas fa-user input-icon"></i>
                  </div>
                </div>

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
                      aria-describedby="email-help"
                    />
                    <i class="fas fa-envelope input-icon"></i>
                  </div>
                  <p id="email-help" class="help-text">
                    Contoh: nama@contoh.com
                  </p>
                  <label for="password" class="form-label">
                    <i class="fas fa-key"></i> Kata Sandi
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      class="form-control"
                      required
                      aria-required="true"
                      autocomplete="new-password"
                      aria-describedby="password-requirements"
                    />
                    <i class="fas fa-key input-icon"></i>
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
              <button type="submit" class="submit-btn" >
                <i class="fas fa-user-plus"></i> Daftar Sekarang
              </button>
            </div>
            </form>

            <div class="auth-footer">
              <p>
                Sudah punya akun?
                <a href="#/login" class="text-link">Masuk disini</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: DicodingStoryAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          name: document.getElementById("fullname").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };
        await this.#presenter.getRegistered(data);
      });

    // Show Password
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

  registeredSuccessfully(message) {
    console.log(message);

    location.hash = "/login";
  }

  registeredFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Daftar akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit"><i class="fas fa-user-plus"></i>Daftar akun</button>
    `;
  }
}
