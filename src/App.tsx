import "./App.css";
import { useAuth } from "@/hooks/useAuth";
import { ChatInterface } from "@/components/chat-interface";
import { LoginComponent } from "@/components/login-component";
import { UserProfile } from "@/components/user-profile";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // Show profile if requested
  if (showProfile && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => setShowProfile(false)}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Back to Chat
          </button>
          <UserProfile />
        </div>
      </div>
    );
  }

  // Show chat interface if authenticated
  if (isAuthenticated && user) {
    return (
      <ChatInterface 
        user={user} 
        onLogout={logout}
        onShowProfile={() => setShowProfile(true)}
      />
    );
  }

  // Show login component if not authenticated
  return (
    <>
      <LoginComponent 
        onSuccess={(receiverHash) => {
          console.log('Login successful, receiverHash:', receiverHash);
        }} 
      />
      <Toaster />
    </>
  );
}

export default App;
