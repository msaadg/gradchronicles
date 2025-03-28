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
- **User Authentication**: Sign up/login/logout with email/password or OAuth (e.g., Google).
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
- **File Storage**: AWS S3 / Google Cloud Storage
- **AI**: Hugging Face models, LangChain (RAG)
- **Hosting**: Vercel
- **ORM**: Prisma with Prisma Accelerate

---

## Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- PostgreSQL (local or hosted, e.g., Supabase, Neon)
- AWS S3 or Google Cloud Storage account (for file storage)
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
Create a `.env` file in the root directory and add:
```
DATABASE_URL="postgresql://user:password@host:port/dbname"
AWS_S3_ACCESS_KEY_ID="your-access-key"
AWS_S3_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
HUGGING_FACE_API_KEY="your-hf-api-key"
NEXTAUTH_URL="http://localhost:3000" # For OAuth
NEXTAUTH_SECRET="your-secret" # Generate with `openssl rand -base64 32`
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
  - `POST /api/auth/login` - Log in a user.
- **Document Management**:
  - `POST /api/documents/upload` - Upload a document.
  - `GET /api/documents` - List all documents.
- **Chatbot**:
  - `POST /api/chatbot/query` - Query the RAG chatbot.
- **Search**:
  - `GET /api/documents/search?query=keyword` - Search documents.
- **Admin**:
  - `DELETE /api/admin/documents/{documentId}` - Remove a document.

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