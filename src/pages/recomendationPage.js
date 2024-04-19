import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { Link } from "react-router-dom";
import logo from "../images/logo.png"
import "firebase/compat/firestore"; // Import Firestore module
import Swal from 'sweetalert2';


const RecommendationPage = () => {
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const db = firebase.firestore();

  const handleRegister = (event) => {
    const userId = firebase.auth().currentUser.uid;
    const eventId = event.id;
    const eventRef = db.collection("events").doc(eventId.toString());

    eventRef.update({
      registeredUsers: firebase.firestore.FieldValue.arrayUnion(userId)
    })
      .then(() => {
        console.log('User registered for event:', eventId);
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'You have successfully registered for the event.',
          showConfirmButton: false,
          timer: 2000 // Automatically close after 2 seconds
        });
        window.location.href = "/dashboard";

        // Redirect to dashboard after registering
      })
      .catch((error) => {
        console.error('Error registering user for event:', error);
        // Handle errors
      });
  };

  useEffect(() => {
    const fetchUserRegisteredEvents = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const snapshot = await db.collection("events").where("registeredUsers", "array-contains", userId).get();
        const userRegisteredEventsData = snapshot.docs.map((doc) => doc.data());
        setUserRegisteredEvents(userRegisteredEventsData);

        const categories = userRegisteredEventsData.map(event => event.category);
        const locations = userRegisteredEventsData.map(event => event.location);
        console.log(locations)
        const upcomingEventsSnapshotCategory = await db.collection("events")
          .where("date", ">", new Date())
          .where("category", "in", categories)
          .get();

        const upcomingEventsSnapshotLocation = await db.collection("events")
          .where("date", ">", new Date())
          .where("location", "in", locations)
          .get();

        // Combine the results of both queries
        const upcomingEventsSnapshot = [...upcomingEventsSnapshotCategory.docs, ...upcomingEventsSnapshotLocation.docs];
        console.log(upcomingEventsSnapshot);

        let upcomingEventsData = upcomingEventsSnapshot.map(doc => doc.data());

        upcomingEventsData = upcomingEventsData.filter(event => !userRegisteredEventsData.some(regEvent => regEvent.id === event.id));

        if (upcomingEventsData.length === 0) {
          const allUpcomingEventsSnapshot = await db.collection("events")
            .where("date", ">", new Date())
            .get();
          upcomingEventsData = allUpcomingEventsSnapshot.docs.map(doc => doc.data());
        }

        setRecommendedEvents(upcomingEventsData);
      } catch (error) {
        console.error("Error fetching user registered events:", error);
      }
    };

    fetchUserRegisteredEvents();
  }, [db]);

  return (
    <div className="container">
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
                <Link to="/dashboard" className="text-dark">Dashboard</Link>
                <Link to="/" className="text-dark">LogOut</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <h2>Recommended Events</h2>
      <div className="row">
        {recommendedEvents.map((event, index) => (
          <div key={index} className="col">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>
                <p className="card-text">Event date: {event.date.toDate().toLocaleString()}</p>
                <p className="card-text">Event location: {event.location}</p>
                <p className="card-text">Event Category: {event.category}</p>
                <button className="btn btn-primary" onClick={() => handleRegister(event)}>Register</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationPage;
