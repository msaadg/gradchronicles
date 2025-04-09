'use client';
import { useSession } from "next-auth/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Home = () => {
  const { data: session, status } = useSession(); // Destructure for clarity

  return (
    <>
      <Navbar isLoggedIn={!!session} /> {/* Pass true if session exists */}
      <div className="text-4xl flex h-screen justify-center items-center">
        Welcome to Home Page!
        <pre>{JSON.stringify(session, null, 2)}</pre> {/* Display session for debugging */}
      </div>
      <Footer />
    </>
  );
};

export default Home;