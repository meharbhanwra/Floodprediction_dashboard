import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import './index.css';
import Dashboard from './dashboard.jsx';
import LandingPage from './landingPage.jsx';

function App() {
    return (
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
    );
}

export default App;