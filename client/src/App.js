import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import { Navbar } from "./components/Layout/Navbar";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { HomePage } from "./components/Home/HomePage";
import { FeedPage } from "./components/Feed/FeedPage";
import { SignInPage } from "./components/Auth/SignInPage";
import { SignUpPage } from "./components/Auth/SignUpPage";
import { ProfilePage } from "./components/Profile/ProfilePage";
import { EditProfilePage } from "./components/Profile/EditProfilePage";
import { PostDetailPage } from "./components/Posts/PostDetailPage";

function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId?"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
