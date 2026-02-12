import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { getUserProfile, updateUserProfile } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Input, Textarea, Button } from "../ui";
import { Card, CardBody } from "../ui";
import { Avatar } from "../ui";

const Page = styled.main`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.xl};
  font-size: ${theme.typography.sizes["2xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const AvatarPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImageActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ImageButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${theme.colors.primary};
  }
`;

const RemoveButton = styled(ImageButton)`
  color: ${theme.colors.error};
  border-color: transparent;
  background: transparent;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};

  &:hover {
    background: ${theme.colors.error}10;
  }
`;

export function EditProfilePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    profilePicture: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    const fetchProfile = async () => {
      try {
        const user = await getUserProfile(userId);
        setProfileData({
          username: user.username || "",
          bio: user.bio || "",
          profilePicture: user.profilePicture || "",
        });
        // Set initial preview from existing profile picture
        if (user.profilePicture) {
          if (user.profilePicture.startsWith("data:")) {
            setPreviewImage(user.profilePicture);
          } else {
            setPreviewImage(`/${user.profilePicture}`);
          }
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, navigate, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image too large. Max 5MB allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreviewImage(result);
        setProfileData((prev) => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileData((prev) => ({ ...prev, profilePicture: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateUserProfile(userId, profileData);
      navigate(userId ? `/profile/${userId}` : "/profile");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", color: theme.colors.textMuted }}>Loading…</p>;

  return (
    <Page>
      <Card>
        <CardBody>
          <Title>Edit Profile</Title>
          <Form onSubmit={handleSubmit}>
            {error && (
              <p style={{ margin: 0, color: theme.colors.error, fontSize: theme.typography.sizes.sm }}>
                {error}
              </p>
            )}
            <AvatarPreview>
              <AvatarWrapper>
                <Avatar 
                  key={previewImage || "no-image"} 
                  src={previewImage} 
                  name={profileData.username} 
                  size="80px" 
                />
              </AvatarWrapper>
              <ImageActions>
                <label
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.medium,
                    marginBottom: theme.spacing.xs,
                    display: "block",
                  }}
                >
                  Profile Picture
                </label>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <ImageButton type="button" onClick={handleImageClick}>
                  {previewImage ? "Change Photo" : "Upload Photo"}
                </ImageButton>
                {previewImage && (
                  <RemoveButton type="button" onClick={handleRemoveImage}>
                    Remove Photo
                  </RemoveButton>
                )}
              </ImageActions>
            </AvatarPreview>
            <Input
              label="Username"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              required
            />
            <Textarea
              label="Bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Page>
  );
}
