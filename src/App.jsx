import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, off, onValue, get, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import "./App.css";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";
// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB9g4lTKg_M0PrEwJCY7PRNrCs8w1S_mDY",
    authDomain: "mindspark23-results-dashboard.firebaseapp.com",
    databaseURL:
        "https://mindspark23-results-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mindspark23-results-dashboard",
    storageBucket: "mindspark23-results-dashboard.appspot.com",
    messagingSenderId: "640466735442",
    appId: "1:640466735442:web:55de46095465b9a38bea8b",
    measurementId: "G-EG67F6D5NF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth();
const analytics = getAnalytics(app);
analytics.app.automaticDataCollectionEnabled = true;

function EditableForm({ data, updateData }) {
    return (
        <div className="wrapper d-flex flex-row flex-wrap">
            {data.map((item, index) => (
                <div key={index} className="module m-1">
                    <h3>{item.mname}</h3>
                    {item.result.map((event, index) => (
                        <div key={index} className="event mb-3">
                            <label
                                className="form-label"
                                htmlFor={`winners-${index}`}
                            >
                                {event.ename}:{" "}
                            </label>
                            <div className="d-flex flex-row">
                                <input
                                    type="text"
                                    id={`winners-${index}`}
                                    defaultValue={item.result[0].winners.join(
                                        ", "
                                    )}
                                    className="form-control"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => updateData(index)}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// Login component to authenticate users with email and password
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function login() {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message);
            console.log(err);
        }
    }

    return (
        <div className="login">
            <div className="mb-3">
                <label htmlFor="email" className="form-label">
                    Email address
                </label>
                <input
                    type="email"
                    id="email"
                    className="form-control"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    className="form-control"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={login}>
                Login
            </button>
            {error && <p>{error}</p>}
        </div>
    );
}

function App() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser(user);
            setIsLoggedIn(true);
            setError(null);
        } else {
            setUser(null);
            setIsLoggedIn(false);
            setError("You are not logged in");
        }
    });

    const dataRef = ref(db, "/result");

    useEffect(() => {
        // Fetch data from Firebase when the component mounts
        onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            setData(data);
        });

        // Clean up Firebase listener when the component unmounts
        return () => {
            off(dataRef);
        };
    }, []);

    function updateData(index) {
        const winnersInput = document.getElementById(`winners-${index}`);
        const winners = winnersInput.value
            .split(",")
            .map((winner) => winner.trim());
        const updatedData = [...data];
        updatedData[index].result[0].winners = winners;

        // Update the data in Firebase
        set(dataRef, updatedData).then(() =>
            alert("Data updated successfully")
        );
    }

    return (
        <div className="container">
            <div>
                <h1 className="text-center">MindSpark'23 Results</h1>
                <h2 className="text-center">Dashboard</h2>
                {user ? <h3 className="text-center">{user.email}</h3> : <></>}
            </div>
            {loading ? (
                <h1>Loading...</h1>
            ) : !user && !loading ? (
                <Login />
            ) : isLoggedIn && !loading ? (
                <EditableForm data={data} updateData={updateData} />
            ) : (
                <>{error}</>
            )}
        </div>
    );
}

export default App;
