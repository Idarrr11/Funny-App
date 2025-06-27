import { reportMapper } from "../../data/api-mapper";

export default class StoryDetailProses {
  #storyId;
  #view;
  #storyModel;
  #dbModel;

  constructor(id, { view, storyModel, dbModel }) {
    this.#storyId = id;
    this.#view = view;
    this.#storyModel = storyModel;
    this.#dbModel = dbModel;

    if (!id) {
      console.warn("❗ Constructor: Story ID tidak ditemukan.");
    }
  }

  async notifyMe() {
    try {
      const response = await this.#storyModel.sendStoryToMeViaNotification(this.#storyId);
      if (!response.ok) {
        console.error("notifyMe: response:", response);
        return;
      }

      console.log("notifyMe:", response.message);
    } catch (error) {
      console.error("notifyMe: error:", error);
    }
  }

  async showStoryDetailMap() {
    try {
      if (!document.getElementById("map-loading-container")) {
        console.warn("map-loading-container belum dirender.");
        return;
      }

      this.#view.showMapLoading();
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoryDetailMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#storyModel.getStoryById(this.#storyId);

      if (!response.ok) {
        console.error("showStoryDetailAndMap: response:", response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }

      const storyData = response.data;
      if (!storyData?.id || !storyData.lat || !storyData.lon) {
        console.error("Incomplete data received:", storyData);
        this.#view.populateStoryDetailError("Data tidak lengkap atau story ID hilang.");
        return;
      }

      const story = await reportMapper(storyData);
      this.#view.populateStoryDetailAndInitialMap(response.message, story);
    } catch (error) {
      console.error("showStoryDetailAndMap: error:", error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async getCommentsList() {
    this.#view.showCommentsLoading();
    try {
      const response = await this.#storyModel.getAllStories(this.#storyId);
      if (!response.ok || !response.data) {
        console.error("Failed to fetch comments:", response);
        this.#view.populateCommentsListError("Failed to load comments");
        return;
      }

      this.#view.populateReportDetailComments(response.message, response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      this.#view.populateCommentsListError(error.message);
    } finally {
      this.#view.hideCommentsLoading();
    }
  }

  async postNewComment({ body }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#storyModel.storeNewCommentByStoryId(this.#storyId, { body });
      if (!response.ok) {
        console.error("postNewComment: response:", response);
        this.#view.postNewCommentFailed(response.message);
        return;
      }

      this.notifyStoryOwner(response.data.id);
      this.#view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      console.error("postNewComment: error:", error);
      this.#view.postNewCommentFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async notifyStoryOwner(commentId) {
    try {
      const response = await this.#storyModel.sendCommentToStoryOwnerViaNotification(this.#storyId, commentId);
      if (!response.ok) {
        console.error("notifyStoryOwner: response:", response);
        return;
      }

      console.log("notifyStoryOwner:", response.message);
    } catch (error) {
      console.error("notifyStoryOwner: error:", error);
    }
  }

  async saveStory() {
    try {
      const response = await this.#storyModel.getStoryById(this.#storyId);
      if (!response.ok || !response.data?.id) {
        throw new Error("Story tidak ditemukan atau tidak memiliki ID, tidak bisa disimpan.");
      }

      const story = {
        ...response.data,
        reportedBy: response.data.name, // ✅ Tambahan: pelapor
      };

      await this.#dbModel.putStory(story);
      this.#view.saveToBookmarkSuccessfully(`✅ Disimpan ke bookmark. Dilaporkan oleh: ${story.reportedBy}`);
    } catch (error) {
      console.error("saveStory error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.removeFromBookmarkSuccessfully("✅ Berhasil dihapus dari bookmark");
    } catch (error) {
      console.error("removeStory error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
    } else {
      this.#view.renderSaveButton();
    }
  }

  async #isStorySaved() {
    const saved = await this.#dbModel.getStoryById(this.#storyId);
    return !!saved?.id;
  }
}
