import React from "react";
import { Link } from "react-router-dom";
import { signInWithGoogle } from "../firebase"; // Import the signInWithGoogle function from your Firebase configuration file
import logo from "../images/logo.png"

import Swal from 'sweetalert2';



const Home = () => {
  return (
    <div className="min-vh-100 bg-gray-100">
      {/* Header Section */}
      <header className="py-3 bg-white shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
        <img
                    style={{ 
                        width:" 230px"
                     }} 
                    src={logo}                               
                    alt="Logo"
                />
          <nav>
            <ul className="d-flex list-unstyled mb-0">
              <li className="me-3">
                <Link to="/events" className="text-dark">Events</Link>
              </li>
              <li className="me-3">
                <Link to="/about" className="text-dark">About</Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-5 bg-primary text-center text-white">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">Welcome to Eventify</h1>
          <p className="lead mb-4">
            Plan and join events easily.
          </p>
          <button
            onClick={signInWithGoogle} // Call the signInWithGoogle function when the button is clicked
            className="btn btn-outline-light me-2"
          >
            Login with Google
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Features</h2>
          <div className="row gx-3">
            {/* Feature Card Example */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <img
                  src="/create-event.png"  // Update with your image URL
                  className="card-img-top"
                  alt="Create Event"
                />
                <div className="card-body">
                  <h3 className="card-title">Create Events</h3>
                  <p className="card-text">
                    Easily create your own events and invite others to join.
                  </p>
                </div>
              </div>
            </div>
            {/* Add more feature cards */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <img
                  src="/join-event.png"  // Update with your image URL
                  className="card-img-top"
                  alt="Join Event"
                />
                <div className="card-body">
                  <h3 className="card-title">Join Events</h3>
                  <p className="card-text">
                    Browse and join events organized by others in your community.
                  </p>
                </div>
              </div>
            </div>
            {/* Add more feature cards */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <img
                  src="/manage-event.png"  // Update with your image URL
                  className="card-img-top"
                  alt="Manage Event"
                />
                <div className="card-body">
                  <h3 className="card-title">Manage Events</h3>
                  <p className="card-text">
                    Organize and manage your events with ease, from start to finish.
                  </p>
                </div>
              </div>
            </div>
            {/* Add more feature cards */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Testimonials</h2>
          <div className="row gx-3">
            {/* Testimonial Card Example */}
            <div className="col-md-4 mb-4">
              <div className="card p-4">
                <p className="card-text">
                  "Eventify made it so easy for me to organize and manage my events. Highly recommended!"
                </p>
                <p className="text-end mt-4">- Jane Doe</p>
              </div>
            </div>
            {/* Add more testimonial cards */}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-4 bg-dark text-white text-center">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Eventify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
