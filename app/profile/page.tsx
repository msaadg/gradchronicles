// app/profile/page.tsx
'use client';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Muhammad Saad",
    bio: "Computer Science, Year 3",
    university: "Habib University",
    major: "Computer Science",
    img: "/avatar1.png",
  });

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-white via-[#faf7ff] to-[#ece8f9]">
      <Navbar isLoggedIn={true} />
      <main className="flex-grow pt-10 pb-10 page-container">
        <div className="bg-white rounded-2xl shadow-card p-10 relative">
          {/* Profile Picture and Edit Button in Top-Left Corner */}
          <div className="absolute top-10 left-10 flex flex-col items-start">
            <img
              src={profile.img}
              className="w-32 h-32 rounded-full border-4 border-brand-purple object-cover shadow mb-4"
              alt="User"
            />
            <Button className="w-full py-2 rounded-full">
              Edit Picture
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8 mt-40">
            {/* Profile Details Section */}
            <div className="flex flex-col items-center justify-center min-w-[270px] px-8">
              <div className="bg-[#f7f2fc] rounded-2xl px-7 py-5 w-full shadow">
                <div className="mb-2 text-lg font-semibold text-gray-800">{profile.name}</div>
                <div className="text-sm text-gray-600">{profile.bio}</div>
                <div className="text-sm text-gray-600">{profile.university}</div>
              </div>
            </div>

            {/* Form and Other Sections */}
            <div className="flex-1">
              <div className="flex flex-col gap-7">
                {/* Editable Profile Form */}
                <div className="bg-[#f9f5ff] p-7 rounded-xl shadow-inner border border-brand-purple/10 w-full md:w-[800px]">
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-5" onSubmit={handleSubmit}>
                    <div>
                      <label className="font-semibold mb-1 block">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={profile.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="font-semibold mb-1 block">Bio</label>
                      <input
                        type="text"
                        name="bio"
                        className="form-input"
                        value={profile.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="font-semibold mb-1 block">University</label>
                      <input
                        type="text"
                        name="university"
                        className="form-input"
                        value={profile.university}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="font-semibold mb-1 block">Major</label>
                      <input
                        type="text"
                        name="major"
                        className="form-input"
                        value={profile.major}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-full mt-4">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Activity Dashboard */}
                <div className="bg-[#f9f5ff] p-7 rounded-xl shadow-inner border border-brand-purple/10">
                  <div className="text-lg font-semibold mb-4 text-brand-purple">Activity Dashboard</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 mb-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">18 Documents Posted</span>
                      <span className="text-brand-purple cursor-pointer hover:underline">View Details</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">450 Average Grade (%)</span>
                      <span className="text-brand-purple cursor-pointer hover:underline">View Details</span>
                    </div>
                  </div>
                  <Button className="mt-5 w-full">View Activity</Button>
                </div>

                {/* Change Password */}
                <div className="bg-[#f9f5ff] p-7 rounded-xl shadow-inner border border-brand-purple/10 w-full md:w-[600px]">
                {/* <div className="bg-[#f9f5ff] p-7 rounded-xl shadow-inner border border-brand-purple/10"> */}
                  <div className="text-lg font-semibold mb-4 text-brand-purple">Change Password</div>
                  <div className="flex flex-col gap-3">
                    <input
                      className="form-input"
                      placeholder="Enter your current password"
                      type="password"
                    />
                    <input
                      className="form-input"
                      placeholder="Enter your new password"
                      type="password"
                    />
                    <input
                      className="form-input"
                      placeholder="Confirm your new password"
                      type="password"
                    />
                    <Button className="mt-4">Change Password</Button>
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