'use client';
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FileText, Grid, List } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DocumentCard from '@/app/components/DocumentCard';

const mockCourse = {
  name: "CS101: Introduction to Programming",
  stats: {
    documents: 20,
    notes: 15,
    exams: 5,
    averageRating: 4.3,
  },
};

const documents = [
  {
    id: "1",
    title: "CS101 Midterm Notes",
    type: "Notes",
    rating: 4.5,
    uploadDate: "2024-02-22",
    downloads: 120,
    imageUrl: "/lovable-uploads/a85c30ca-9f77-4e5a-a556-b1c90c458264.png",
  },
  {
    id: "2",
    title: "CS101 Final Exam",
    type: "Exam",
    rating: 4.7,
    uploadDate: "2024-03-15",
    downloads: 95,
    imageUrl: "/lovable-uploads/a85c30ca-9f77-4e5a-a556-b1c90c458264.png",
  },
  {
    id: "3",
    title: "CS101 Lecture Notes",
    type: "Notes",
    rating: 4.3,
    uploadDate: "2024-01-10",
    downloads: 80,
    imageUrl: "/lovable-uploads/a85c30ca-9f77-4e5a-a556-b1c90c458264.png",
  },
];

const RecommendedCourses = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f7]">
      <Navbar isLoggedIn={true} />
      <main className="flex-grow page-container py-8">
        <div className="mb-7">
          <h1 className="text-3xl font-bold mb-3">{mockCourse.name}</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-gray-700 font-semibold text-base">
            <span>
              Total Documents:{" "}
              <span className="font-bold text-black">
                {mockCourse.stats.documents} Documents Available
              </span>
            </span>
            <span>
              Document Types:{" "}
              <span className="font-bold text-black">
                {mockCourse.stats.notes} Notes, {mockCourse.stats.exams} Exams
              </span>
            </span>
            <span>
              Average Rating:{" "}
              <span className="font-bold text-black">
                {mockCourse.stats.averageRating}/5 Stars
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-5 gap-4">
          <h2 className="text-2xl font-bold">Documents for CS101</h2>
          <div className="flex items-center gap-2">
            <label className="mr-2 font-medium text-gray-600">Sort by:</label>
            <select className="form-input w-40 h-10 text-base">
              <option>Relevance</option>
              <option>Newest</option>
              <option>Oldest</option>
              <option>Top Rated</option>
            </select>
            <Button
              onClick={() => setView("grid")}
              variant={view === "grid" ? "default" : "outline"}
              className="ml-3"
              size="sm"
            >
              <Grid /> Grid View
            </Button>
            <Button
              onClick={() => setView("list")}
              variant={view === "list" ? "default" : "outline"}
              size="sm"
            >
              <List /> List View
            </Button>
          </div>
        </div>

        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" : "flex flex-col gap-6"}>
          {documents.map((doc) =>
            view === "grid" ? (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                course="CS101"
                rating={doc.rating}
                totalRating={5}
                downloads={doc.downloads}
                uploadDate={doc.uploadDate}
                imageUrl={doc.imageUrl}
                showViewButton
              />
            ) : (
              <div
                key={doc.id}
                className="flex items-start bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden"
              >
                <img src={doc.imageUrl} alt={doc.title} className="w-32 h-32 object-cover object-center rounded-l-xl" />
                <div className="flex-1 p-4">
                  <h3 className="font-bold text-lg mb-0.5">{doc.title}</h3>
                  <p className="text-sm mb-2 font-medium">Document Type: {doc.type}</p>
                  <div className="text-gray-600 text-sm mb-1">
                    Rating: {doc.rating}/5
                  </div>
                  <div className="text-gray-600 text-sm mb-1">
                    Uploaded on {doc.uploadDate}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">
                    Downloaded {doc.downloads} times
                  </div>
                  <Button asChild className="px-5 py-2 rounded-full font-semibold bg-brand-purple text-white mt-1 shadow-none hover:bg-brand-purple-dark">
                    <a href={`/document/${doc.id}`}>View Document</a>
                  </Button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-10 gap-2">
          <Button size="icon" variant="outline" className="rounded-full font-bold px-4 py-1">
            1
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full font-bold px-4 py-1">2</Button>
          <Button size="icon" variant="ghost" className="rounded-full font-bold px-4 py-1">3</Button>
          <span className="px-2 text-lg font-bold text-gray-500">…</span>
          <Button size="icon" variant="ghost" className="rounded-full font-bold px-4 py-1">Next</Button>
        </div>

        {/* No documents state (example) */}
        <div className="mt-16 flex flex-col items-center justify-center">
          <img src="/lovable-uploads/e1eebe85-ec9f-40d3-bb3c-fbab3cc3c524.png" alt="No docs" className="w-40 mb-5" />
          <div className="mb-2 text-lg font-medium text-gray-700">No documents available for this course yet. Be the first to upload!</div>
          <Button className="primary-btn mt-3">Upload Document</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecommendedCourses;
