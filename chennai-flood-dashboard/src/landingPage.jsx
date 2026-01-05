import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { openSignIn, signOut, user } = useClerk();
  const cleanupRef = useRef([]); // To store cleanup functions

  // --- ADDED: State for Legal Modals ---
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    // Load Clerk and set up event listeners
    const setupClerk = async () => {
      if (window.Clerk) {
        try {
          await window.Clerk.load();
          console.log('Clerk loaded successfully');

          const loginBtn = document.getElementById("loginBtn");
          const logoutBtn = document.getElementById("logoutBtn");
          const userName = document.getElementById("userName");
          const dashboardBtn = document.getElementById("dashboardBtn");

          // Helper: update UI based on auth
          function updateAuthButtons() {
            const isLoggedIn = !!window.Clerk?.user;

            if (loginBtn) {
              if (isLoggedIn) {
                loginBtn.classList.add("hidden");
              } else {
                loginBtn.classList.remove("hidden");
                loginBtn.classList.add("md:block");
              }
            }

            if (logoutBtn) {
              if (isLoggedIn) {
                logoutBtn.classList.remove("hidden");
              } else {
                logoutBtn.classList.add("hidden");
              }
            }

            if (userName) {
              if (isLoggedIn) {
                userName.classList.remove("hidden");
                userName.textContent =
                  window.Clerk.user?.firstName ||
                  window.Clerk.user?.username ||
                  window.Clerk.user?.primaryEmailAddress?.emailAddress ||
                  "";
              } else {
                userName.classList.add("hidden");
                userName.textContent = "";
              }
            }
          }

          // Initial state
          updateAuthButtons();

          // React to auth changes
          if (window.Clerk.addListener) {
            window.Clerk.addListener(updateAuthButtons);
            cleanupRef.current.push(() => {
              if (window.Clerk.removeListener) {
                window.Clerk.removeListener(updateAuthButtons);
              }
            });
          }

          // Login button: open Clerk popup
          if (loginBtn) {
            const handleLoginClick = async (e) => {
              e.preventDefault();
              try {
                await window.Clerk.openSignIn({
                  afterSignInUrl: "/dashboard",
                  afterSignUpUrl: "/dashboard",
                });
                updateAuthButtons();
              } catch (error) {
                console.error("Login error:", error);
              }
            };
            
            loginBtn.addEventListener("click", handleLoginClick);
            cleanupRef.current.push(() => {
              loginBtn.removeEventListener("click", handleLoginClick);
            });
          }

          // Logout button
          if (logoutBtn) {
            const handleLogoutClick = async (e) => {
              e.preventDefault();
              try {
                await window.Clerk.signOut();
                updateAuthButtons();
                navigate('/'); // Redirect to home after logout
              } catch (error) {
                console.error("Logout error:", error);
              }
            };
            
            logoutBtn.addEventListener("click", handleLogoutClick);
            cleanupRef.current.push(() => {
              logoutBtn.removeEventListener("click", handleLogoutClick);
            });
          }

          // Dashboard button
          if (dashboardBtn) {
            const handleDashboardClick = async () => {
              if (!window.Clerk.session) {
                // Open Clerk popup for login
                try {
                  await window.Clerk.openSignIn({
                    afterSignInUrl: "/dashboard",
                    afterSignUpUrl: "/dashboard",
                  });
                } catch (error) {
                  console.error("Dashboard login error:", error);
                  return;
                }
              }

              // After successful login (or if already logged in), go to dashboard
              if (window.Clerk.session) {
                navigate('/dashboard');
              }
            };
            
            dashboardBtn.addEventListener("click", handleDashboardClick);
            cleanupRef.current.push(() => {
              dashboardBtn.removeEventListener("click", handleDashboardClick);
            });
          }

        } catch (error) {
          console.error("Error setting up Clerk:", error);
        }
      } else {
        console.warn("Clerk not available in window object");
      }
    };

    setupClerk();

    // Cleanup function
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, [navigate]);

  // React-based click handlers as a fallback
  const handleLoginClick = () => {
    openSignIn({
      afterSignInUrl: "/dashboard",
      afterSignUpUrl: "/dashboard",
    });
  };

  const handleLogoutClick = () => {
    signOut();
    navigate('/');
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      openSignIn({
        afterSignInUrl: "/dashboard",
        afterSignUpUrl: "/dashboard",
      });
    }
  };

  // --- ADDED: Legal Content ---
  const legalDocs = {
    privacy: {
      title: "Privacy Policy",
      content: "At Chennai Flood Watch, we prioritize your privacy. We collect location data only when the application is active to provide real-time flood alerts. Your data is encrypted and never shared with third-party advertisers. We strictly adhere to data protection guidelines to ensure citizen safety and confidentiality."
    },
    terms: {
      title: "Terms of Service",
      content: "By using Chennai Flood Watch, you agree to use the data provided for informational purposes only. While our AI models aim for high accuracy, they should not be the sole basis for life-safety decisions. Always follow official government directives during emergency situations."
    }
  };

  const heroBgStyle = {
    background: "linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url('https://images.unsplash.com/photo-1622384381387-a859424854f6?q=80&w=1932&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center"
  };

  return (
    <div className="scroll-smooth bg-white text-gray-800 relative">
      {/* --- ADDED: Modal Overlay UI --- */}
      {modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setModalContent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{modalContent.title}</h2>
            <div className="text-gray-600 leading-relaxed space-y-4 overflow-y-auto max-h-[60vh]">
              <p>{modalContent.content}</p>
            </div>
            <button 
              onClick={() => setModalContent(null)}
              className="mt-8 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg 
              className="w-8 h-8 text-blue-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" 
              />
            </svg>
            <span className="text-2xl font-bold text-gray-900">Chennai Flood Watch</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-lg">
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition">About</a>
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
            <a href="#tech" className="text-gray-600 hover:text-blue-600 transition">Technology</a>
          </div>

          <div className="flex items-center space-x-4">
            {/* React-based auth buttons */}
            <SignedOut>
              <button
                id="loginBtn"
                onClick={handleLoginClick}
                className="hidden md:block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Login
              </button>
            </SignedOut>
            
            <SignedIn>
              <span
                id="userName"
                className="hidden md:block font-semibold text-gray-700"
              >
                {user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || ""}
              </span>
              
              <button
                id="logoutBtn"
                onClick={handleLogoutClick}
                className="hidden md:block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Logout
              </button>
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="text-white" style={heroBgStyle}>
          <div className="container mx-auto px-6 py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Real-time Flood Intelligence for Chennai
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 mb-8">
              Leveraging IoT and AI to predict, monitor, and manage floods in real-time. 
              Protecting Chennai's communities and infrastructure before disaster strikes.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                id="dashboardBtn"
                onClick={handleDashboardClick}
                className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg shadow-lg"
              >
                Access Authority Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900">
                Beyond Reaction: Proactive Flood Management
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Traditional flood warnings are too slow for the rapid pace of urban life. 
                We provide the foresight and tools to act proactively.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-red-500">
                <h3 className="text-2xl font-bold mb-3 text-red-600">The Challenge</h3>
                <p className="text-gray-700 text-lg">
                  Sudden flash floods overwhelm city infrastructure with little to no warning, 
                  causing widespread disruption, economic loss, and endangering human lives. 
                  Reactive measures are often insufficient and costly.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-green-500">
                <h3 className="text-2xl font-bold mb-3 text-green-600">Our Solution</h3>
                <p className="text-gray-700 text-lg">
                  A smart, integrated system that uses sensor data and an AI-powered prediction 
                  engine to provide localized, early warnings and suggest intelligent control 
                  strategies for mitigation.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900">
                An Integrated, Intelligent System
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology into five core modules.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Data Simulation</h3>
                <p className="text-gray-600">
                  Continuously simulates rainfall and water level data to feed the prediction 
                  engine and test system resilience.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Random Forest AI Model</h3>
                <p className="text-gray-600">
                  Predicts flash floods with high accuracy using a powerful Random Forest 
                  model trained on historical IMD weather data.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">React-based Dashboard</h3>
                <p className="text-gray-600">
                  A dynamic, component-based GIS dashboard showing risk gauges, forecast charts, 
                  and actionable alerts for city authorities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="tech" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900">
                Powered by Modern Technology
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Our system is built on a robust, industry-standard technology stack to 
                ensure reliability and performance.
              </p>
            </div>
          </div>
        </section>

        {/* Citizen Alerts Section */}
        <section id="citizen-alerts" className="py-24 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900">
              Stay Informed. Stay Safe.
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto mb-8">
              Receive timely flood alerts and crucial safety information directly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <h4 className="text-xl font-bold text-white mb-4">Chennai Flood Watch</h4>
              <p className="text-gray-400">
                A smart city initiative for proactive flood management and citizen safety.
              </p>
            </div>
            
            {/* Emergency Helplines */}
            <div>
              <h5 className="font-semibold text-white mb-4">Emergency Helplines</h5>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.76a11.024 11.024 0 006.292 6.292l.76-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                  <a href="tel:112" className="hover:text-white transition">112 - National Emergency</a>
                </li>
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <a href="tel:100" className="hover:text-white transition">100 - Police</a>
                </li>
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010-1.414l3-3a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0zm8.586 8.586a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l3 3a1 1 0 010 1.414z" 
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <a href="tel:101" className="hover:text-white transition">101 - Fire & Rescue</a>
                </li>
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  <a href="tel:1077" className="hover:text-white transition">1077 - Disaster Mgmt.</a>
                </li>
              </ul>
            </div>
            
            {/* Legal Section - UPDATED TO BUTTONS */}
            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul>
                <li className="mb-2">
                  <button onClick={() => setModalContent(legalDocs.privacy)} className="hover:text-white transition text-left cursor-pointer">Privacy Policy</button>
                </li>
                <li className="mb-2">
                  <button onClick={() => setModalContent(legalDocs.terms)} className="hover:text-white transition text-left cursor-pointer">Terms of Service</button>
                </li>
              </ul>
            </div>
            
            {/* Contact Us */}
            <div>
              <h5 className="font-semibold text-white mb-4">Contact Us</h5>
              <p className="text-white-500 mb-3 text-sm">Developed by:</p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:ijindal2005@gmail.com" className="hover:text-white transition">
                    Ishani Jindal
                  </a>
                </li>
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:aditimehta307@gmail.com" className="hover:text-white transition">
                    Aditi Mehta
                  </a>
                </li>
                <li className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <a href="mailto:meharbhanwra1004@gmail.com" className="hover:text-white transition">
                    Mehar Bhanwra
                  </a>
                </li>
              </ul>
            </div>
            
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; 2025 Chennai Flood Watch. All rights reserved. An initiative by the City of Chennai.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;