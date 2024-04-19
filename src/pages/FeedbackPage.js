import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import logo from "../images/logo.png";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const FeedbackPage = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [validatedTicketsCount, setValidatedTicketsCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch the event document from Firestore
        const eventDoc = await firebase.firestore().collection("events").doc(id).get();
        const eventData = eventDoc.data();

        // Count the number of registered users
        setRegisteredUsersCount(eventData.registeredUsers.length);

        // Fetch the number of validated tickets
        const validatedTicketsQuery = await firebase.firestore().collection("tickets").where("eventId", "==", id).where("validated", "==", true).get();
        setValidatedTicketsCount(validatedTicketsQuery.size);

        // Access feedbacks directly from the event data
        const feedbacksData = eventData.feedbacks ? Object.values(eventData.feedbacks) : [];
        console.log(feedbacksData)
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [id]); // Dependency array with 'id' to re-run the effect when 'id' changes

  return (
    <div className="container py-4">
      <header className="py-3 bg-white shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <img style={{ width: "230px" }} src={logo} alt="Logo" />
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
      <h2 className="mb-4 mt-4">Feedback </h2>
      <div className="mb-4">
        <p>Number of registered users: {registeredUsersCount}</p>
        <p>Number of validated tickets: {validatedTicketsCount}</p>
      </div>
      <div>
        <h3>All Feedbacks</h3>
        <ul className="list-group">
          {feedbacks[0].map((feedback, index) => (
            <li key={index} className="list-group-item">
              <p>Stars: {feedback.stars}</p>
              <p>Comments: {feedback.comments}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackPage;
