import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { toast } from "react-toastify";

const UploadFileForCard = ({
  onSave,
  handleStartSaving,
  handleSaved,
  handleSavedFail,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleSave = async () => {
    if (!file) return toast.error("Please select a file!");

    setIsOpen(false);
    setIsLoading(true);
    handleStartSaving();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("token", token);
      formData.append("file", file);
      formData.append("note", note);

      const response = await axios.post(
        `${backendUrl}/knowledge-card/upload-file`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
        }
      );

      toast.success("Card uploaded from file!");
      handleSaved();
      onSave?.(response.data);
      setFile(null);
      setNote("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      console.log(error.response.data.detail);

      // Check for 406 error (Invalid file type)
      if (error.response && error.response.status === 406) {
        // Display the custom error message from the backend
        toast.error(
          error.response.data.detail ||
            "Invalid file type. Only PDF and DOCX are allowed."
        );
      } else {
        // Handle other errors
        toast.error("Upload failed! Please try again.");
      }

      handleSavedFail();
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setFile(null);
    setNote("");
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => setIsOpen(true)}
        sx={{
          backgroundColor: "#1f7281",
          "&:hover": { backgroundColor: "#065f46" },
          textTransform: "none",
          height: 40,
          px: 2,
          color: "white",
        }}>
        Upload File
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Box>
            <Typography variant="h6">Upload Files</Typography>
            <Typography variant="body2" color="text.secondary">
              Select and upload the file of your choice
            </Typography>
          </Box>
          <IconButton onClick={() => setIsOpen(false)}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Box
            onClick={() => document.getElementById("fileInput").click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: isDragging ? "primary.main" : "grey.400",
              borderRadius: 2,
              px: 4,
              py: 6,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: isDragging ? "grey.100" : "transparent",
              transition: "all 0.2s ease-in-out",
              mb: 2,
            }}>
            <input
              type="file"
              accept=".pdf,.docx"
              id="fileInput"
              hidden
              onChange={handleFileChange}
            />
            <UploadFileIcon sx={{ fontSize: 48, color: "#1f7281", mb: 1 }} />
            <Typography variant="subtitle1">
              Drag and drop a file here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF, DOCX format, up to 50MB
            </Typography>

            {file && (
              <Typography mt={2} variant="body2" color="success.main">
                Selected: {file.name}
              </Typography>
            )}
          </Box>

          <TextField
            label="Add a note (optional)"
            multiline
            fullWidth
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              resetFields();
              setIsOpen(false);
            }}
            disabled={isLoading}
            color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !file}
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#1f7281",
              "&:hover": { backgroundColor: "#16616f" },
            }}>
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadFileForCard;
