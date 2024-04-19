import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { useParams } from "react-router-dom";
import QrScanner from 'qr-scanner';
import { Link } from "react-router-dom";
import firebase from "firebase/compat/app"; // Import Firebase
import "firebase/compat/firestore"; // Import Firestore module

const ValidateQR = () => {
  const [result, setResult] = useState("No QR code detected");
  const { id } = useParams();
  const db = firebase.firestore(); // Initialize Firestore

  useEffect(() => {
    const videoElement = document.getElementById('qr-video');
    const qrScanner = new QrScanner(videoElement, handleScan, handleError);

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  const handleScan = (data) => {
    if (data) {
      let unique_id = '';
      let user_id = '';

      // Split the data string using '__' as the delimiter
      const parts = data.split('__');

      // If the parts array has two elements, assign them to unique_id and user_id respectively
      if (parts.length === 2) {
        unique_id = parts[0];
        user_id = parts[1];
      } else {
        // Handle the case where the data string doesn't match the expected format
        console.error('Invalid data format');
      }
      console.log(id)
      if (unique_id !== id) {
        setResult("Invalid ticket >> ");
      } else {
        fetch('http://127.0.0.1:5000/check_id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: unique_id })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to check ID');
            }
            return response.json();
          })
          .then(data => {
            if (data.message === 'ID is available') {
              setResult('Valid ticket');
              const userId = user_id;
              const eventRef = db.collection("events").doc(id.toString());
  
              eventRef.get().then(doc => {
                if (doc.exists) {
                  const validatedUsers = doc.data().validated_users || [];
                  if (validatedUsers.includes(userId)) {
                    setResult('User already validated');
                    return; // Exit function if user already validated
                  }else{
                    Swal.fire({
                      title: 'Valid Ticket',
                      text: 'This ticket is valid.',
                      icon: 'success',
                      confirmButtonText: 'OK'
                    });
                    
                  }
  
                  eventRef.update({
                    validated_users: firebase.firestore.FieldValue.arrayUnion(userId)
                  })
                    .then(() => {
                      console.log('User validated for event:', id);
                      // Handle success (e.g., show success message)
                    })
                    .catch((error) => {
                      console.error('Error validating user for event:', error);
                      // Handle errors (e.g., show error message)
                    });
                } else {
                  console.log('Event document not found');
                }
              }).catch(error => {
                console.error('Error getting event document:', error);
              });
            } else {
              setResult('Invalid ticket');
            }
          })
          .catch(error => {
            setResult('Error checking ticket');
          });
      }
    }
  };
  

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="container py-4">
      <header>
        <h1>QR Code Validation Page</h1>
      </header>
      <div>
        <video id="qr-video" style={{ width: "100%" }}></video>
        <p>{result}</p>
      </div>
      <Link to="/dashboard" className="btn btn-primary">Home</Link>
    </div>
  );
};

export default ValidateQR;
