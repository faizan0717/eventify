import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png"
import Swal from 'sweetalert2';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore"; // Import Firestore module

const handleAddEvent = () => {
    const db = firebase.firestore();
    
    Swal.fire({
      title: 'Add Event',
      html:
        '<input id="title" class="swal2-input" placeholder="Event Title">' +
        '<input id="description" class="swal2-input" placeholder="Event Description">' +
        '<input id="location" class="swal2-input" placeholder="Event Location">' +
        '<input id="fees" class="swal2-input" placeholder="Event Fees">' +
        '<input id="tickets" class="swal2-input" placeholder="Number of Tickets">',
      showCancelButton: true, // Show cancel button
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById('title').value,
          description: document.getElementById('description').value,
          location: document.getElementById('location').value,
          fees: document.getElementById('fees').value,
          tickets: document.getElementById('tickets').value
        };
      }
    }).then((result) => {
        console.log("asdasd")
      if (result.isConfirmed) {
        // Store event data in Firebase Firestore
        const userId = firebase.auth().currentUser.uid; // Get current user's UID
        db.collection('events').doc(userId).set({
          ...result.value,
          userId: userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
          .then(() => {
            console.log('Event added with ID:', userId);
            // Handle success (e.g., show success message)
          })
          .catch((error) => {
            console.error('Error adding event:', error);
            // Handle errors (e.g., show error message)
          });
      }
    });
  };
  


  const Dashboard = () => {
    const [userEvents, setUserEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]); // Define allEvents state
    const db = firebase.firestore();
  
    useEffect(() => {
      const fetchUserEvents = async () => {
        try {
            console.log("herer")
          const userId = firebase.auth().currentUser.uid;
          const snapshot = await db.collection("events").doc(userId).get();
          if (snapshot.exists) {
            setUserEvents(snapshot.data());
            if(typeof(userEvents)=="object"){
                setUserEvents([snapshot.data()]);
            }
          } else {
            console.log("No events found for the user.");
          }
        } catch (error) {
          console.error("Error fetching user events:", error);
        }
      };
  
      const fetchAllEvents = async () => {
        try {
          const snapshot = await db.collection("events").get();
          const allEventsData = snapshot.docs.map((doc) => doc.data());
          setAllEvents(allEventsData);
        } catch (error) {
          console.error("Error fetching all events:", error);
        }
      };
  
      fetchUserEvents();
      fetchAllEvents();
    }, [db]);
  
    return (
      <div className="container py-4">
        <header className="py-3 bg-white shadow-sm">
          <div className="container d-flex justify-content-between align-items-center">
            <img
              style={{ width: "230px" }}
              src={logo}
              alt="Logo"
            />
            <nav>
              <ul className="d-flex list-unstyled mb-0">
                <li className="me-3">
                  <Link to="/" className="text-dark">LogOut</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
  
        {/* Your Events Section */}
        <section className="mb-5">
          <h2 className="mb-4">Your Events</h2>
          <div className="text-center mt-5">
            <button onClick={handleAddEvent}>Add Event</button>
          </div>
          {/* Your Events Content Here */}
          {/* Display userEvents */}
          {userEvents.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {userEvents.map((event, index) => (
              <div key={index} className="col">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{event.title}</h5>
                    <p className="card-text">{event.description}</p>
                    <p className="card-text">Event date: {event.date}</p>
                    <p className="card-text">Event location: {event.location}</p>
                    {/* Add any additional event details here */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <p>No events created yet.</p>
          )}
        </section>
  
        {/* Registered Events Section */}
        <section className="mb-5">
          <h2 className="mb-4">Registered Events</h2>
          {/* Registered Events Content Here */}
          <p>No events registered yet.</p>
        </section>
  
        {/* All Events Section */}
        <section>
          <h2 className="mb-4">All Events</h2>
          {/* All Events Content Here */}
          {/* Event Cards Here */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {allEvents.map((event, index) => (
              <div key={index} className="col">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{event.title}</h5>
                    <p className="card-text">{event.description}</p>
                    <p className="card-text">Event date: {event.date}</p>
                    <p className="card-text">Event location: {event.location}</p>
                    {/* Add any additional event details here */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

export default Dashboard;
