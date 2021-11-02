import React, { useContext, useState, useEffect } from "react"
import { auth, firestore } from "../firebase"
import { updateDoc, setDoc, doc, getDoc } from "firebase/firestore";
// import { ref, set, update, get, child } from "firebase/database";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)
    const [authError, setAuthError] = useState("");
    const [userInfo, setUserInfo] = useState({});

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            //Realtime Database functions
            // const dbRef = ref(db)
            // const snapshot = await get(child(dbRef, `users/${user.uid}`))
            // if (!snapshot.exists()) {
            //     try {
            //         await set(ref(db, 'users/' + user.uid), {
            //             username: user.displayName,
            //             email: user.email,
            //             profile_picture: user.photoURL,
            //             provider: "google"
            //         });

            //     } catch (err) {
            //         console.log(err)
            //     }
            // }

            try {
                await setDoc(doc(firestore, "users", user.uid), {
                    username: user.displayName,
                    email: user.email,
                    profile_picture: user.photoURL,
                    provider: "google"
                });
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            setCurrentUser(user)
        } catch (err) {
            setAuthError(err.message)
        }

    }

    const signInWithFacebook = async () => {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            //Realtime Database functions
            // const dbRef = ref(db)
            // const snapshot = await get(child(dbRef, `users/${user.uid}`))
            // if (!snapshot.exists()) {
            //     try {
            //         await set(ref(db, 'users/' + user.uid), {
            //             username: user.displayName,
            //             email: user.email,
            //             profile_picture: user.photoURL,
            //             provider: "google"
            //         });

            //     } catch (err) {
            //         console.log(err)
            //     }
            // }

            try {
                await setDoc(doc(firestore, "users", user.uid), {
                    username: user.displayName,
                    email: user.email,
                    profile_picture: user.photoURL,
                    provider: "facebook"
                });
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            setCurrentUser(user)
        } catch (err) {
            setAuthError(err.message)
        }

    }

    const signInWithEmail = async (email, password, username) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password, username)
            const user = userCredential.user
            console.log(username)

            //Realtime Database functions
            // const dbRef = ref(db)
            // const snapshot = await get(child(dbRef, `users/${user.uid}`))
            // if (!snapshot.exists()) {
            //     try {
            //         await set(ref(db, 'users/' + user.uid), {
            //             username: user.displayName,
            //             email: user.email,
            //             profile_picture: user.photoURL,
            //             provider: "google"
            //         });

            //     } catch (err) {
            //         console.log(err)
            //     }
            // }
            try {
                await setDoc(doc(firestore, "users", user.uid), {
                    full_name: username,
                    email: user.email,
                    profile_picture: user.photoURL,
                    provider: "email"
                });

            } catch (e) {
                console.error("Error adding document: ", e);
            }
            setCurrentUser(user)
        }
        catch (err) {
            setAuthError(err.message)
        }

    }

    const logInWithEmail = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            console.log(user)
        }
        catch (error) {
            const errorMessage = error.message;
            setAuthError(errorMessage)
            setCurrentUser(null)
        }
    }

    const logOut = () => {
        signOut(auth).then(() => {
            setCurrentUser(null)
        }).catch((error) => {
            setAuthError(error)
        });
    }

    const updateUserInfo = async (name, address, age) => {
        try {

            

            await updateDoc(doc(firestore, "users", currentUser.uid), {
                full_name: name,
                address: address,
                age: age
            });
        } catch (err) {
            setAuthError(err)
        }
    }

    const getUserInfo = async () => {

        //Realtime Database functions
        // const dbRef = ref(db)
        // get(child(dbRef, `users/${currentUser.uid}`)).then((snapshot) => {
        //     if (snapshot.exists()) {
        //         setUserInfo(snapshot.val());
        //     } else {
        //         console.log("No data available");
        //     }
        // }).catch((error) => {
        //     console.error(error);
        // });

        const docRef = doc(firestore, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setUserInfo(docSnap.data())
        } else {
            // doc.data() will be undefined in this case
            setAuthError("No user")
        }
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        signInWithGoogle,
        signInWithEmail,
        signInWithFacebook,
        logOut,
        logInWithEmail,
        updateUserInfo,
        getUserInfo,
        currentUser,
        authError,
        userInfo
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}