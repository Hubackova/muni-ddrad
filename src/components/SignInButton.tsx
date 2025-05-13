// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

const SignInButton = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sleduje stav přihlášení
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Odpojení listeneru při unmountu
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Přihlášen:", result.user.email);
      })
      .catch((error) => {
        console.error("Chyba při přihlášení:", error.message);
      });
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Odhlášen");
    });
  };

  if (user) {
    return (
      <div>
        <small>{user.email}</small>
        <br />
        <button onClick={handleSignOut}>Odhlásit se</button>
      </div>
    );
  }

  return <button onClick={signInWithGoogle}>Log in</button>;
};

export default SignInButton;
