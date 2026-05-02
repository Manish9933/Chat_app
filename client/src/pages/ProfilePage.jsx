import { Navigate } from "react-router-dom";

// ProfilePage functionality has been consolidated into SettingsPage
// This redirect ensures existing links/bookmarks continue to work
const ProfilePage = () => <Navigate to="/settings" replace />;

export default ProfilePage;
