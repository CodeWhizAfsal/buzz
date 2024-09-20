import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Chat from "./pages/Chat";
import { SocketProvider } from "./utils/socketContext";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
