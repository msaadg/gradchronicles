# Grad Chronicles

**Grad Chronicles** is a web-based platform designed to enhance collaborative learning among students by enabling them to share, access, and engage with study materials such as past exams, quizzes, and course resources. Inspired by platforms like StuDocu, it includes features like document management, search and filtering, a rating system, comments, user profiles, and an AI-powered Retrieval-Augmented Generation (RAG) chatbot to assist with queries based on uploaded documents.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Project Overview
Grad Chronicles aims to foster a collaborative learning environment for students at Habib University and beyond. The platform allows users to upload study materials, search for resources using filters, rate and comment on documents, and interact with an AI chatbot that retrieves answers from uploaded content. It includes role-based access control (RBAC) for students and admins, ensuring a secure and moderated experience.

---

## Features
- **User Authentication**: Sign up/login/logout with email/password or OAuth (e.g., Google, GitHub).
- **Document Management**: Upload, view, download, and delete study materials (PDF, DOCX, TXT).
- **Search & Filtering**: Keyword-based search with filters (course, document type, upload date, rating).
- **Comments & Feedback**: Add, reply to, and moderate comments on documents.
- **Rating System**: Rate documents (1-5 stars) to highlight quality resources.
- **AI Chatbot**: Ask questions and get answers with references from uploaded documents using RAG.
- **User Profiles**: View uploaded documents, download history, and edit personal details.
- **Notifications**: Receive updates on comments, replies, and highly rated documents.
- **Admin Controls**: Remove inappropriate content, ban users, and monitor activity logs.

---

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL (metadata), ChromaDB (embeddings for RAG)
- **File Storage**: MEGA
- **AI**: Hugging Face models, LangChain (RAG)
- **Hosting**: Vercel
- **ORM**: Prisma with Prisma Accelerate

---

## Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- PostgreSQL (local or hosted, e.g., Supabase, Neon)
- MEGA account (for file storage)
- Vercel account (optional, for deployment)
- Hugging Face API key (for AI models)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/msaadg/gradchronicles.git
   cd gradchronicles
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Prisma:
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

4. Copy the provided `schema.prisma` (see [Database Schema](#database-schema)) into `prisma/schema.prisma`.

5. Sync the database:
   ```bash
   npx prisma db push
   ```

6. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Environment Variables
Create a `.env` file in the root directory and add the following:

```
# GitHub OAuth credentials - Required for GitHub authentication
# Create at https://github.com/settings/applications/new
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth credentials - Required for Google authentication
# Create at https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# NextAuth configuration
# Generate a secure random string for NEXTAUTH_SECRET (e.g., using `openssl rand -base64 32`)
NEXTAUTH_SECRET=""
# Base URL of your site (e.g., http://localhost:3000 for local development)
NEXTAUTH_URL=""

# MEGA storage account credentials - Used for file storage
MEGA_EMAIL=""
MEGA_PASSWORD=""

# Database connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=""
```

### Running the Project
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. (Optional) Explore the database with Prisma Studio:
   ```bash
   npx prisma studio
   ```

---

## API Endpoints
Here are some key API endpoints (see full specs in the project documentation):

- **Authentication**:
  - `POST /api/auth/signup` - Register a new user.
  - `POST /api/auth/[...nextauth]` - Handle OAuth and credentials-based login (e.g., Google, GitHub, email/password).

- **Courses**:
  - `GET /api/courses` - List all available courses.

- **Document Management**:
  - `POST /api/documents/upload` - Upload a new document.
  - `GET /api/documents/[id]` - Retrieve a specific document by ID.
  - `GET /api/documents/download/[id]` - Download a document by ID.
  - `GET /api/documents/preview/[id]` - Preview a document by ID.
  - `GET /api/documents/rating` - Retrieve ratings for documents.
  - `POST /api/documents/rating` - Add or update a rating for a document.
  - `GET /api/documents/search` - Search documents by keyword and filters (e.g., course, docType, sortBy).

- **User-Specific Document Actions**:
  - `GET /api/recently-viewed` - List recently viewed documents for the authenticated user.
  - `GET /api/recommended-courses` - List recommended courses for the authenticated user based on activity.

- **User Management**:
  - `GET /api/user` - Retrieve the authenticated user's profile and session details.

Refer to the project documentation for detailed request/response formats.

---

## Database Schema
The database is defined in `prisma/schema.prisma`. Key models include:
- **User**: Authentication, profiles, and roles (`STUDENT`, `ADMIN`).
- **Document**: Study materials with metadata, tags, and counters.
- **Comment**: Feedback with replies and moderation.
- **Rating**: 1-5 star ratings for documents.
- **Notification**: Activity tracking for users.
- **Download**: Tracks document downloads.
- **Log**: Admin moderation logs.

See the full schema in `prisma/schema.prisma` or the project documentation.

---

## Contributing
We welcome contributions! Follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please adhere to the [Git Branching Flow](#) outlined in the documentation.

---

## Team
- **Eman Fatima** - Computer Science, Habib University
- **Fakeha Faisal** - Computer Science, Habib University
- **Muhammad Ibad Nadeem** - Computer Science, Habib University
- **Muhammad Saad** - Computer Science, Habib University
- **Maarij Ahmed Imam** - Computer Science, Habib University
- **Supervisor**: Mohammad Yousuf Bin Azhar, Habib University

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.