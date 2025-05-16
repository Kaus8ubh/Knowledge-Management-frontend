import React, { useState, useEffect } from "react";
import "../css/AddKnowledgeCard.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CancelIcon from "@mui/icons-material/Cancel";
import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const AddKnowledgeCard = ({
  onSave,
  handleStartSaving,
  handleSaved,
  handleSavedFail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLinkValid, setIsLinkValid] = useState(true);

  useEffect(() => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setNote(html);
  }, [editorState]);

  useEffect(() => {
    if (note) {
      const blocksFromHtml = htmlToDraft(note);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      }
    }
  }, [isOpen]);

  const validateLink = (value) => {
    const urlRegex =
      /^(https?:\/\/)(www\.)?([\w\-]+\.)+(com|org|net|in|io|dev|app|info|me|co|ai)(\/[^\s]*)?$/i;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return urlRegex.test(value) || youtubeRegex.test(value);
  };

  const handleLinkChange = (e) => {
    const value = e.target.value;
    setLink(value);
    setIsLinkValid(validateLink(value));
  };

  const handleSave = async () => {
    if (!link) return;

    setIsLoading(true);
    setIsOpen(false);
    handleStartSaving();

    try {
      const token = localStorage.getItem("token");

      const payload = {
        token: token,
        source_url: link,
        note: note || "",
      };

      const response = await axios.post(
        `${backendUrl}/knowledge-card/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      if (onSave) {
        onSave(response.data);
      }

      toast.success("Card Added");
      handleSaved();

      setLink("");
      setNote("");
      setEditorState(EditorState.createEmpty());
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving knowledge card:", error);
      if (error.response && error.response.status === 400) {
        setIsLoading(false);
        toast.error("Card cannot be added! Bad request.");
        handleSavedFail();
      } else {
        toast.error("Something went wrong while saving the card.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setLink("");
    setNote("");
    setEditorState(EditorState.createEmpty());
  };

  const toggleExpand = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          color: "white",
          backgroundColor: "#1f7281",
          "&:hover": {
            backgroundColor: "#065f46", // emerald-800
          },
          textTransform: "none",
          height: 40,
          px: 2,
        }}>
        Add Card
      </Button>

      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full text-black bg-black/60 flex items-center justify-center z-[999] px-4 opacity-0 animate-[fadeOverlay_0.3s_ease-out_forwards]">
          <div
            className="w-full max-w-[90%] sm:max-w-[85%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] bg-white p-4 sm:p-6 rounded-md shadow-md overflow-y-auto
                      transition duration-300 ease-out scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <IconButton onClick={toggleExpand}>
                <CancelIcon></CancelIcon>
              </IconButton>
            </div>
            {/* Link Input */}
            <div className="mb-4 flex justify-center items-center gap-3 flex-col sm:flex-row">
              <input
                type="text"
                value={link}
                onChange={handleLinkChange}
                placeholder="Enter Link: https://example.com/article"
                className={`w-full p-3 rounded-md text-center bg-gray-100 text-black placeholder:text-gray-500 focus:outline-none border ${
                  isLinkValid
                    ? "border-gray-300 focus:border-emerald-500"
                    : "border-red-500 focus:border-red-500"
                }`}
              />
            </div>

            {/* Rich Text Editor */}
            <div className="mb-4">
              <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
                toolbarClassName="sticky top-0 z-10 bg-white border-b border-gray-200"
                wrapperClassName="w-full h-auto"
                editorClassName="p-2 border border-gray-300 overflow-y-auto min-h-[250px] max-h-[250px]"
              />
            </div>
            <div className="flex justify-end">
              {/* Cancel and Save Button */}
              <div>
                <button
                  onClick={() => {
                    resetFields();
                    toggleExpand();
                  }}
                  disabled={isLoading}
                  className="w-24 h-12 mr-2 bg-gray-300 text-white rounded hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={isLoading || !link || !isLinkValid}
                  className="w-24 h-12 bg-[#1f7281] text-white rounded hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Saving" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddKnowledgeCard;
