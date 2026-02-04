import { useState, useEffect } from "react";
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

export function EditProfilePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    profilePicture: "",
  });
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateUserProfile(userId, profileData);
      navigate(userId ? `/profile/${userId}` : "/profile");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", color: theme.colors.textMuted }}>Loading…</p>;

  const profilePic = profileData.profilePicture?.startsWith("data:")
    ? profileData.profilePicture
    : profileData.profilePicture
    ? `/${profileData.profilePicture}`
    : null;

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
              <Avatar src={profilePic} name={profileData.username} size="80px" />
              <div>
                <label
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.medium,
                  }}
                >
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: theme.spacing.xs, display: "block" }}
                />
              </div>
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
