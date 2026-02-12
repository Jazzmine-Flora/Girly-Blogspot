import { useState, useRef } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Modal, Button, Input, Textarea } from "../ui";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ErrorBanner = styled.div`
  padding: ${theme.spacing.md};
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${theme.radii.md};
  color: ${theme.colors.error};
  font-size: ${theme.typography.sizes.sm};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.sm};
`;

const MediaSection = styled.div`
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.lg};
  text-align: center;
  background: ${theme.colors.background};
`;

const MediaPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const ImagePreview = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const VideoPreview = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  background: #000;

  video {
    width: 100%;
    display: block;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const MediaHint = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.textMuted};
`;

const TabRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const TabBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${({ $active }) => ($active ? theme.colors.primaryLight : "transparent")};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

export function PostComposerModal({ onClose, onSubmit, loading }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [mediaMode, setMediaMode] = useState("image"); // "image" | "video"
  const [error, setError] = useState("");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const hasText = title.trim() || content.trim();
  const hasMedia = images.length > 0 || video;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(
      (f) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    if (valid.length !== files.length) {
      setError("Invalid image type. Use jpg, png, or webp.");
    }
    setVideo(null);
    setImages((prev) => [...prev, ...valid].slice(0, 5));
    setError("");
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && ["video/mp4", "video/webm"].includes(file.type)) {
      setImages([]);
      setVideo(file);
      setError("");
    } else if (file) {
      setError("Invalid video type. Use mp4 or webm.");
    }
    e.target.value = "";
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeVideo = () => setVideo(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!hasText && !hasMedia) {
      setError("Add some text, image(s), or video.");
      return;
    }
    if (images.length > 0 && video) {
      setError("Choose either images or video, not both.");
      return;
    }
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), images, video });
      setTitle("");
      setContent("");
      setImages([]);
      setVideo(null);
      onClose();
    } catch {
      setError("Failed to create post. Please try again.");
    }
  };

  return (
    <Modal title="Create Post" onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Input
          label="Title (optional)"
          placeholder="What's on your mind?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
        />
        <Textarea
          label="Caption (optional)"
          placeholder="Add a caption..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        <MediaSection>
          <TabRow>
            <TabBtn
              type="button"
              $active={mediaMode === "image"}
              onClick={() => setMediaMode("image")}
            >
              Photos
            </TabBtn>
            <TabBtn
              type="button"
              $active={mediaMode === "video"}
              onClick={() => setMediaMode("video")}
            >
              Video
            </TabBtn>
          </TabRow>
          {mediaMode === "image" && (
            <>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
              >
                Add photos (max 5)
              </Button>
              <MediaHint>JPG, PNG, WebP. Max 5MB each.</MediaHint>
              {images.length > 0 && (
                <MediaPreview>
                  {images.map((img, i) => (
                    <ImagePreview key={i}>
                      <img src={URL.createObjectURL(img)} alt={`Preview ${i + 1}`} />
                      <RemoveBtn type="button" onClick={() => removeImage(i)} aria-label="Remove">
                        ×
                      </RemoveBtn>
                    </ImagePreview>
                  ))}
                </MediaPreview>
              )}
            </>
          )}
          {mediaMode === "video" && (
            <>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoChange}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
              >
                Add video
              </Button>
              <MediaHint>MP4, WebM. Max 50MB.</MediaHint>
              {video && (
                <MediaPreview>
                  <VideoPreview>
                    <video src={URL.createObjectURL(video)} controls muted />
                    <RemoveBtn type="button" onClick={removeVideo} aria-label="Remove">
                      ×
                    </RemoveBtn>
                  </VideoPreview>
                </MediaPreview>
              )}
            </>
          )}
        </MediaSection>

        <ButtonRow>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Posting…" : "Post"}
          </Button>
        </ButtonRow>
      </Form>
    </Modal>
  );
}
