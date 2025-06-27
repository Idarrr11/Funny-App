export default class Camera {
  #currentStream;
  #streaming = false;
  #width = 640;
  #height = 0;

  #videoElement;
  #selectCameraElement;
  #canvasElement;
  #takePictureButton;

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
      return;
    }

    window.currentStreams = [...window.currentStreams, stream];
  }

  static stopAllStreams() {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];
      return;
    }
    window.currentStreams.forEach((stream) => {
      if (stream.active) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  constructor({ video, cameraSelect, canvas, options = {} }) {
    if (!video || !canvas) {
      throw new Error("Video and Canvas elements are required");
    }

    this.#videoElement = video;
    this.#selectCameraElement = cameraSelect;
    this.#canvasElement = canvas;

    this.#initialListener();
  }

  #initialListener() {
    this.#videoElement.addEventListener("canplay", () => {
      if (this.#streaming) return;

      this.#height =
        (this.#videoElement.videoHeight * this.#width) /
        this.#videoElement.videoWidth;

      this.#canvasElement.setAttribute("width", this.#width);
      this.#canvasElement.setAttribute("height", this.#height);

      this.#streaming = true;
    });

    if (this.#selectCameraElement) {
      this.#selectCameraElement.addEventListener("change", async () => {
        await this.stop();
        await this.launch();
      });
    }
  }

  async #populateDeviceList(stream) {
    try {
      if (!(stream instanceof MediaStream)) {
        throw new Error("MediaStream not found");
      }

      const { deviceId } = stream.getVideoTracks()[0].getSettings();
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (this.#selectCameraElement) {
        this.#selectCameraElement.innerHTML = videoDevices
          .map(
            (device, index) => `
            <option value="${device.deviceId}" 
                    ${deviceId === device.deviceId ? "selected" : ""}>
              ${device.label || `Camera ${index + 1}`}
            </option>
          `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error populating device list:", error);
      throw error;
    }
  }

  async #getStream() {
    try {
      const deviceId = this.#selectCameraElement?.value
        ? { exact: this.#selectCameraElement.value }
        : undefined;

      const constraints = {
        video: {
          width: { ideal: this.#width },
          aspectRatio: 4 / 3,
          deviceId,
          ...(this.#selectCameraElement ? {} : { facingMode: "environment" }),
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.#populateDeviceList(stream);
      return stream;
    } catch (error) {
      console.error("Error getting media stream:", error);
      throw error;
    }
  }

  async launch() {
    try {
      if (this.isStreaming()) {
        console.warn("Camera is already streaming");
        return;
      }

      this.#currentStream = await this.#getStream();
      Camera.addNewStream(this.#currentStream);

      this.#videoElement.srcObject = this.#currentStream;
      await this.#videoElement.play();
      this.#clearCanvas();
      this.#streaming = true;
    } catch (error) {
      this.stop();
      throw new Error(`Failed to launch camera: ${error.message}`);
    }
  }

  stop() {
    try {
      if (this.#videoElement) {
        this.#videoElement.srcObject = null;
      }

      if (this.#currentStream) {
        this.#currentStream.getTracks().forEach((track) => track.stop());
      }

      this.#clearCanvas();
      this.#streaming = false;
      this.#currentStream = null;
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  }

  #clearCanvas() {
    const context = this.#canvasElement.getContext("2d");
    context.fillStyle = "#AAAAAA";
    context.fillRect(
      0,
      0,
      this.#canvasElement.width,
      this.#canvasElement.height
    );
  }

  async takePicture(mimeType = "image/jpeg", quality = 0.8) {
    if (!this.isStreaming()) {
      throw new Error("Camera is not streaming");
    }

    const context = this.#canvasElement.getContext("2d");
    this.#canvasElement.width = this.#width;
    this.#canvasElement.height = this.#height;

    context.drawImage(this.#videoElement, 0, 0, this.#width, this.#height);

    return new Promise((resolve, reject) => {
      this.#canvasElement.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Failed to create blob")),
        mimeType,
        quality
      );
    });
  }

  addCheeseButtonListener(selector, callback) {
    this.#takePictureButton = document.querySelector(selector);
    if (this.#takePictureButton) {
      this.#takePictureButton.addEventListener("click", callback);
    }
  }

  isStreaming() {
    return this.#streaming && this.#currentStream?.active;
  }

  getVideoElement() {
    return this.#videoElement;
  }

  getCanvasElement() {
    return this.#canvasElement;
  }
}
