import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="text-4xl flex h-screen justify-center items-center">
        Grad Chronicles
      </div>
      <Footer />
    </>
  );
}
