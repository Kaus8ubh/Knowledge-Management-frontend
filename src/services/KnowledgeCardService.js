import axios from "axios";
import { jwtDecode } from "jwt-decode";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem("token");

// API call for fetching all knowledge cards
const handleFetchKnowledgeCards = async (pageNum) => {
  try {
    const response = await axios.get(`${backendUrl}/knowledge-card/`, {
      params: { token, skip: (pageNum - 1) * 4, limit: 4 },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge cards", error);
  }
};

// API call for fetching favourite knowledge cards
const handleFetchFavouriteKnowledgeCards = async (pageNum) => {
  try {
    const response = await axios.get(`${backendUrl}/knowledge-card/favourite`, {
      params: { token, skip: (pageNum - 1) * 4, limit: 4 },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge cards", error);
  }
};

// API call for fetching archived knowledge cards
const handleFetchArchiveKnowledgeCards = async (pageNum) => {
  try {
    const response = await axios.get(`${backendUrl}/knowledge-card/archive`, {
      params: { token, skip: (pageNum - 1) * 4, limit: 4 },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching knowledge cards", error);
  }
};

// API call for fetching user-defined and default categories
const handleFetchCategories = async (userId) => {
  try {
    const response = await axios.get(
      `${backendUrl}/knowledge-card/${userId}/categories`
    );
    return response;
  } catch (error) {
    console.error("Error fetching categories", error);
  }
};

// Create a knowledge Card
const handleCreateKnowledgeCard = async (payload) => {
  try {
    const response = await axios.post(
            `${backendUrl}/knowledge-card/`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 60000,
            }
          );
          return response;
  } catch (error) {
    console.error("Error creating knowledge card", error);
  }
}

// API call to Toggle favourite
const handlefavourite = async (cardData) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/favourite/`
    );
    return res.data;
  } catch (error) {
    console.error("Error updating favourite status:", error);
  }
};

// API call to like a knowledge card
const handleLike = async (cardData, userId) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/like`,
      {},
      {
        params: {
          card_id: cardData.card_id,
          user_id: userId,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating Like status:", error);
    console.error("Server response:", error.response?.data);
  }
};

// API call to copy a public knowlegde card (of other users ONLY)
const handleCopy = async (cardData, userId) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/copy-card`,
      {},
      {
        params: {
          card_id: cardData.card_id,
          user_id: userId,
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Error Copying to Home:", error);
    console.error("Server response:", error.response?.data);
  }
};

// API call to download a knowledge card
const handleDownload = async (cardData, fileFormat) => {
  const res = await axios.get(
    `${backendUrl}/knowledge-card/${cardData.card_id}/download`,
    {
      params: { format: fileFormat },
      responseType: "blob",
      validateStatus: () => true,
    }
  );

  // + Errors from backend
  const isJson = res.headers["content-type"]?.includes("application/json");
  if (res.status !== 200) {
    let errorMessage = "Download failed";
    if (isJson) {
      const reader = new FileReader();
      return new Promise((_, reject) => {
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            reject(new Error(json.detail || errorMessage));
          } catch {
            reject(new Error(errorMessage));
          }
        };
        reader.readAsText(res.data);
      });
    }
    throw new Error(errorMessage);
  }

  return res.data;
};

// API call to archive a knowledge card
const handleArchive = async (cardData) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/archive`
    );
    return res.data;
  } catch (error) {
    console.error("Error in moving to archive", error);
  }
};

// API call to delete a knowledge card
const handleDelete = async (cardData) => {
  try {
    const res = await axios.delete(
      `${backendUrl}/knowledge-card/${cardData.card_id}/delete`,
      {
        params: {
          card_id: cardData.card_id,
          user_id: cardData.user_id,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Couldn't delete card", error);
  }
};

// API call to update the summary and note content of a knowledge card
const handleEdit = async (cardData, summaryContent, noteContent) => {
  try {
    const res = await axios.put(`${backendUrl}/knowledge-card/`, {
      card_id: cardData.card_id,
      user_id: cardData.user_id,
      summary: summaryContent,
      note: noteContent,
    });
    return res.data;
  } catch (error) {
    console.error("Error editing card:", error.response?.data || error.message);
  }
};

// API call to toggle a knowledge card to public or private
const handlePublic = async (cardData) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/public`
    );
    return res;
  } catch (error) {
    console.log("Operation failed", error);
  }
};

// API call to view a shared knowledge card
const handleSharedCard = async (token) => {
  try {
    const res = await axios.get(`${backendUrl}/knowledge-card/shared/${token}`);
    return res.data;
  } catch (error) {
    console.log("Operation failed", error);
  }
};

// API call to generate the sharing link for a knowledge card
const handleShareLink = async (cardData) => {
  try {
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/generate-share-link`,
      {}, // Empty body
      {
        params: {
          user_id: cardData.user_id, // Sent as a query parameter
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error sharing link:", error);
  }
};

// API call to Bookmark a public knowlegde card (of other users ONLY)
const handleBookmark = async (cardData, userId) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/bookmark`,
      null,
      {
        params: { user_id: userId },
      }
    );
    console.log(cardData.card_id);
    // console.log(userId)
    return res;
  } catch (err) {
    console.error("Bookmark failed:", err);
  }
};

//API call to generate Questions and Answers for Q&A tab
const handleQuestionAnswers = async (cardData) => {
  try {
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/generate-qna`,
      {},
      {
        params: {
          user_id: cardData.user_id,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching question answers:", error);
  }
};

//API call to generate Knowledge Map for Knowledge Map tab
const handleKnowledgeMap = async (cardData) => {
  try {
    const res = await axios.get(
      `${backendUrl}/knowledge-card/${cardData.card_id}/knowledge-map`
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching question answers:", error);
  }
};

//API call to Add a new tag
const handleAddTag = async (cardData, tag, userId) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/add-tag`,
      { tag },
      {
        params: {
          user_id: userId,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error adding tag:", error);
    throw error;
  }
};

//API call to remove a tag
const handleRemoveTag = async (cardData, tag, userId) => {
  try {
    const res = await axios.delete(
      `${backendUrl}/knowledge-card/${cardData.card_id}/remove-tag`,
      {
        data: { tag },
        params: {
          user_id: userId,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error removing tag:", error);
    throw error;
  }
};

// Function to get userId from token in local storage
const getUserId = async (token) => {
  try {
    const decode = jwtDecode(token);
    return decode.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
  }
};

export default {
  handleFetchKnowledgeCards,
  handleFetchFavouriteKnowledgeCards,
  handleFetchArchiveKnowledgeCards,
  handleFetchCategories,
  handleCreateKnowledgeCard,
  handlefavourite,
  handleLike,
  handleDownload,
  handleArchive,
  handleDelete,
  handleEdit,
  handleCopy,
  handlePublic,
  handleShareLink,
  handleSharedCard,
  handleBookmark,
  handleQuestionAnswers,
  handleKnowledgeMap,
  handleAddTag,
  handleRemoveTag,
  getUserId,
};
