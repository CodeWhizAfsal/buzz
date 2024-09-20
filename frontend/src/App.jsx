import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<AllChats />} />
        <Route path="/chat/:userId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
