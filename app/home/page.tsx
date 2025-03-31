import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <>
      <Navbar isLoggedIn={true} />
      <div className="text-4xl flex h-screen justify-center items-center">
        Welcome to Home Page!
      </div>
      <Footer />
    </>
  )
}

export default Home;