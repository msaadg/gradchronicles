'use client';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Muhammad Saad",
    bio: "Computer Science, Year 3",
    university: "Habib University",
    major: "Computer Science",
    img: "/avatar1.png",
  });

  // Reference for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission (for saving changes)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile updated:", profile);
  };

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, img: imageUrl }));
    }
  };

  // Trigger file input click when "Edit Picture" button is clicked
  const handleEditPictureClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#fbf8f8] flex flex-col min-h-screen">
      <Navbar isLoggedIn={true} />
      <main className="flex-grow pt-10 pb-10 page-container">
        <div className="bg-white rounded-2xl shadow-card p-10 relative">
          {/* Profile Picture and Edit Button in Top-Left Corner */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <Image
              src={profile.img}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full border-4 border-brand-purple object-cover shadow mb-4"
              alt="User"
              width={128}
              height={128}
            />
            <Button className="w-full py-2 rounded-full" onClick={handleEditPictureClick}>
              Edit Picture
            </Button>
            {/* Hidden file input for selecting an image */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8 mt-52">
            {/* Form and Other Sections */}
            <div className="flex-1">
              <div className="flex- gap-3">
                {/* Editable Profile Form */}
              <div className="bg-[#fbf8f8] p-7 rounded-xl border-brand-purple/10 w-full">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1 block text-gray-600">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profile.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-600">Bio</label>
                    <input
                      type="text"
                      name="bio"
                      className="form-input"
                      value={profile.bio}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-600">University</label>
                    <input
                      type="text"
                      name="university"
                      className="form-input"
                      value={profile.university}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className=" mb-1 block text-gray-600">Major</label>
                    <input
                      type="text"
                      name="major"
                      className="form-input"
                      value={profile.major}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <Button type="submit" className="px-4 py-2 rounded-full">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>

                {/* Activity Dashboard */}
                <div className="bg-[#fbf8f8] p-7 rounded-xl border-brand-purple/10 mt-10">
                  <div className="text-lg font-semibold mb-4 text-brand-purple">Activity Dashboard</div>
                  {/* Metrics Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-700">15 Documents Uploaded</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <span className="font-bold text-gray-700">Average Rating: 4.5/5</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-700">45 Comments Posted</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-700">120 Downloads</span>
                    </div>
                  </div>
                  {/* Recent Activity Table */}
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2 mb-2">
                      <span className="font-semibold text-gray-700">Action</span>
                      <span className="font-semibold text-gray-700">Document</span>
                      <span className="font-semibold text-gray-700 text-right">Timestamp</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <span className="text-gray-600">Uploaded</span>
                      <span className="text-gray-600">CS101 Midterm Notes</span>
                      <span className="text-gray-600 text-right">2h ago</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <span className="text-gray-600">Commented</span>
                      <span className="text-gray-600">CS101 Midterm Notes</span>
                      <span className="text-gray-600 text-right">3h ago</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <span className="text-gray-600">Rated</span>
                      <span className="text-gray-600">CS101 Midterm Notes</span>
                      <span className="text-gray-600 text-right">5h ago</span>
                    </div>
                  </div>
                  {/* Button */}
                  <div className="flex justify-end">
                    <Button className="px-4 py-2 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90">
                      View All Activity
                    </Button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-[#fbf8f8] p-7 rounded-xl border-brand-purple/10 w-full mt-10">
                  <div className="text-lg font-semibold mb-4 text-brand-purple">Change Password</div>
                  <div className="flex flex-col gap-3">
                    <label className="text-gray-600">Current Password</label>
                    <input
                      className="form-input"
                      placeholder="Enter your current password"
                      type="password"
                    />
                    <label className="text-gray-600">New Password</label>
                    <input
                      className="form-input"
                      placeholder="Enter your new password"
                      type="password"
                    />
                    <label className="text-gray-600">Confirm Password</label>
                    <input
                      className="form-input"
                      placeholder="Confirm your new password"
                      type="password"
                    />
                    <div className="flex justify-end">
                      <Button className="px-4 py-2 rounded-full">Change Password</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;