import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png"
import Swal from 'sweetalert2';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore"; // Import Firestore module
import QRCode from 'qrcode.react';
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [userEvents, setUserEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Define allEvents state
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const db = firebase.firestore();

  const handleAddEvent = () => {
    const db = firebase.firestore();
    const randomId = Math.floor(Math.random() * 1000000);
    Swal.fire({
      title: 'Add Event',
      html:
        '<input id="title" class="swal2-input" placeholder="Event Title" required>' +
        '<input id="description" class="swal2-input" placeholder="Event Description" required>' +
        '<input type="date" id="edate" class="swal2-input" placeholder="Event Date" required>' +
        '<input id="location" class="swal2-input" placeholder="Event Location" required>' +
        '<input id="fees" class="swal2-input" placeholder="Event Fees" required>' +
        '<input id="tickets" class="swal2-input" placeholder="Number of Tickets" required>' +
        '<select id="category" class="swal2-input" placeholder="Event Category" required>' +
        '<option value="" disabled selected>Select Category</option>' +
        '<option value="Music">Music</option>' +
        '<option value="Sports">Sports</option>' +
        '<option value="Workshop">Workshop</option>' +
        '<option value="Conference">Conference</option>' +
        '<option value="Art">Art</option>' +
        '<option value="Food">Food</option>' +
        '</select>',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('edate').value;
        const location = document.getElementById('location').value;
        const fees = document.getElementById('fees').value;
        const tickets = document.getElementById('tickets').value;
        const category = document.getElementById('category').value; // Fetch selected category

        // Check if any of the required fields are empty
        if (!title || !description || !date || !location || !fees || !tickets || !category) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }

        // Check if the selected date is in the future
        const selectedDate = new Date(date);
        const currentDate = new Date();
        if (selectedDate < currentDate) {
          Swal.showValidationMessage('Please select a future date');
          return false;
        }

        return {
          title: title,
          description: description,
          date: selectedDate,
          location: location,
          fees: fees,
          tickets: tickets,
          category: category,
          id: randomId,
          registeredUsers: []
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = firebase.auth().currentUser.uid;
        db.collection('events').doc(randomId.toString()).set({
          ...result.value,
          userId: userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
          .then(() => {
            console.log('Event added with ID:', randomId);
            fetch('http://127.0.0.1:5000/store_id', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id: randomId })
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to store ID');
                }
                return response.json();
              })
              .then(data => {
                console.log(data.message);
                window.location.reload();
              })
              .catch(error => {
                console.error('Error storing ID:', error);
                // Handle errors
              });
          })
          .catch((error) => {
            console.error('Error adding event:', error);
            // Handle errors
          });
      }
    });
  };



  const handeleventCheck = (eventId) => {
    window.open("/validate/" + eventId);
  };

  //   fetch('http://127.0.0.1:5000/check_id', {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ id: eventId })
  // })
  // .then(response => {
  //     if (!response.ok) {
  //         throw new Error('Failed to check ID');
  //     }
  //     return response.json();
  // })
  // .then(data => {
  //     console.log(data.message);
  //     // Handle response data accordingly
  // })
  // .catch(error => {
  //     console.error('Error checking ID:', error);
  //     // Handle errors
  // });


  const handleRegister = (event) => {
    console.log(event)
    const userId = firebase.auth().currentUser.uid;
    const eventId = event.id; // Assuming each event has an 'id' field
    const eventRef = db.collection("events").doc(eventId.toString());


    eventRef.update({
      registeredUsers: firebase.firestore.FieldValue.arrayUnion(userId)
    })
      .then(() => {
        console.log('User registered for event:', eventId);
        window.location.reload();

        // Handle success (e.g., show success message)
      })
      .catch((error) => {
        console.error('Error registering user for event:', error);

        // Handle errors (e.g., show error message)
      });
  };

  const handleUnregister = (event) => {
    const userId = firebase.auth().currentUser.uid;
    const eventId = event.id; // Assuming each event has an 'id' field
    const eventRef = db.collection("events").doc(eventId.toString());

    eventRef.update({
      registeredUsers: firebase.firestore.FieldValue.arrayRemove(userId)
    })
      .then(() => {
        console.log('User unregistered from event:', eventId);
        window.location.reload();
        // Handle success (e.g., show success message)
      })
      .catch((error) => {
        console.error('Error unregistering user from event:', error);
        // Handle errors (e.g., show error message)
      });
  };

  const handleDeleteEvent = (eventId) => {
    db.collection("events").doc(eventId.toString()).delete()
      .then(() => {
        console.log("Event deleted successfully");
        // Refresh the page to reflect the changes
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting event: ", error);
      });
  };

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        console.log("here"); // Corrected typo in console log

        const userId = firebase.auth().currentUser.uid;
        const snapshot = await db.collection("events").where("userId", "==", userId).get();

        if (!snapshot.empty) { // Corrected condition to check if snapshot is not empty
          const userEventsData = snapshot.docs.map(doc => doc.data());
          setUserEvents(userEventsData);
        } else {
          console.log("No events found for the user.");
          setUserEvents([]); // Set userEvents to an empty array when no events are found
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

    const fetchRegisteredEvents = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const snapshot = await db.collection("events").where("registeredUsers", "array-contains", userId).get();
        const registeredEventsData = snapshot.docs.map((doc) => doc.data());
        setRegisteredEvents(registeredEventsData);
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
    };

    fetchUserEvents();
    fetchAllEvents();
    fetchRegisteredEvents();
  }, [db]);

  const handleFeedback = (eventId) => {
    // Prompt the user to provide feedback and rating
    const feedback = prompt("Please provide your feedback:");
    const rating = prompt("Please rate the event (1-5 stars):");
  
    // Validate the rating
    if (rating >= 1 && rating <= 5) {
      // Store the feedback and rating in Firebase
      storeFeedbackInFirebase(eventId, feedback, rating);
    } else {
      alert("Invalid rating. Please provide a rating between 1 and 5.");
    }
  };

  const storeFeedbackInFirebase = (eventId, feedback, rating) => {
    // Reference the event document in Firestore
    const eventRef = db.collection("events").doc(eventId.toString());
  
    // Update the event document with the feedback and rating
    eventRef.update({
      [`feedbacks.${eventId}`]: firebase.firestore.FieldValue.arrayUnion({
        stars: rating,
        comments: feedback
      })
    })
      .then(() => {
        console.log('Feedback and rating stored successfully');
        // Handle success (e.g., show success message)
      })
      .catch((error) => {
        console.error('Error storing feedback and rating:', error);
        // Handle errors (e.g., show error message)
      });
  };

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
                <Link to="/dashboard" className="text-dark">Dashboard</Link>
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
          <button className="btn btn-success btn-lg" onClick={handleAddEvent}>Add Event</button>
        </div>

        {/* Your Events Content Here */}
        {/* Display userEvents */}
        {userEvents.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {userEvents.map((event, index) => {
              const eventDate = event.date.toDate();
              const currentDate = new Date();
              const isExpired = eventDate < currentDate;

              return (
                <div key={index} className="col">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{event.title}</h5>
                      <p className="card-text">{event.description}</p>
                      <p className="card-text">Event date: {eventDate.toLocaleString()}</p>
                      <p className="card-text">Event location: {event.location}</p>
                      <p className="card-text">Event Category: {event.category}</p>
                      {/* Add any additional event details here */}
                      <button className="btn btn-danger" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                      <Link to={`/feedback/${event.id}`} className="btn btn-primary">View Feedback</Link>

                      {isExpired ? (
                        <p>Expired</p>
                      ) : (
                        <button className="btn btn-danger" onClick={() => handeleventCheck(event.id)}>Validate</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No events created yet.</p>
        )}
      </section>


      <section className="mb-5">
  <h2 className="mb-4">Registered Events</h2>
  {registeredEvents.length > 0 ? (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {registeredEvents.map((event, index) => {
        const eventDate = event.date.toDate();
        const currentDate = new Date();
        const isExpired = eventDate < currentDate;

        return (
          <div key={index} className="col">
            <div className="card h-100">
              <div className="card-body">
                <QRCode value={event.id.toString() + "__" + firebase.auth().currentUser.uid.toString()} />
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>
                <p className="card-text">Event date: {eventDate.toLocaleString()}</p>
                <p className="card-text">Event location: {event.location}</p>
                <p className="card-text">Event Category: {event.category}</p>
                {isExpired ? (
                  <p>Expired</p>
                ) : (
                  <div>
                    <button className="btn btn-danger" onClick={() => handleUnregister(event)}>Unregister</button>
                    {/* Feedback button */}
                    <button className="btn btn-primary mx-2" onClick={() => handleFeedback(event.id)}>Feedback</button>
                  </div>
                )}
                {/* Add View Ticket button */}
                {/* <button className="btn btn-primary mx-2" onClick={() => handleViewTicket(event.id)}>View Ticket</button> */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p>No events registered yet.</p>
  )}
</section>

      {/* All Events Section */}
      <section>
        <h2 className="mb-4">All Events</h2>
        <Link to="/recommendations">
          <button className="btn btn-success btn-lg">Give me recommendations</button>
        </Link>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {allEvents.map((event, index) => {
            const eventDate = event.date.toDate();
            const currentDate = new Date();
            if (eventDate < currentDate) {
              return null; // Skip rendering if event date is before today
            }
            return (
              <div key={index} className="col">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{event.title}</h5>
                    <p className="card-text">{event.description}</p>
                    <p className="card-text">Event date: {eventDate.toLocaleString()}</p>
                    <p className="card-text">Event location: {event.location}</p>
                    <p className="card-text">Event Category: {event.category}</p>
                    <button className="btn btn-primary" onClick={() => handleRegister(event)}>Register</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>


    </div>
  );
};

export default Dashboard;
