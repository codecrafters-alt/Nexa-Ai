# Nexa AI

Nexa AI is a full-stack AI-powered assistant platform built with modern web technologies and production-style architecture.

It supports:

* Normal AI chatbot conversations
* PDF-based AI chat using RAG (Retrieval-Augmented Generation)
* AI-powered email automation
* Speech-to-text voice prompts
* Secure authentication system
* Plan-based payment integration

---

# ✨ Features

## 🤖 AI Chat

* Conversational AI chatbot
* Context-aware responses
* Clean modern chat interface

## 📄 PDF Chat (RAG)

* Upload PDFs
* Ask questions based on uploaded documents
* LangChain orchestration
* MMR-based semantic retrieval
* Pinecone vector database integration

## 📧 AI Email Automation

* Detects email intent from natural language
* Validates email addresses
* Confirmation-based email workflow
* Sends professional emails using Nodemailer

## 🎤 Voice Assistant

* Speech-to-text support
* Browser SpeechRecognition API integration
* Hands-free prompt input

## 🔐 Authentication & Security

* JWT Authentication
* Protected routes
* Express Rate Limiting
* API abuse & brute-force protection

## 💳 Payment System

* Plan-based premium system
* Secure payment workflow

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* Context API

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## AI & RAG

* LangChain
* Pinecone Vector Database
* HuggingFace Embeddings
* Google Gemini API

## Additional Tools

* Nodemailer
* Cloudinary
* Multer
* Express Rate Limit
* SpeechRecognition API

---

# ⚡ Challenges Faced

## Vector Database Persistence

Initially experimented with ChromaDB local persistence, but later migrated to Pinecone for scalable cloud-based vector retrieval and production-level architecture.

## LangChain Dependency Issues

Faced multiple dependency compatibility and integration challenges while setting up:

* embeddings
* Pinecone integration
* LangChain orchestration

## Multi-Workflow AI Orchestration

Managing:

* chatbot mode
* PDF RAG mode
* email automation mode

inside a single backend architecture required careful orchestration and modular backend design.

---

# 📌 Current Status

The email automation system is currently using a personal email account for testing purposes.
A custom production email domain will be configured later for professional deployment.

---

# 📂 Project Structure

```bash
client/   -> React Frontend
server/   -> Express Backend
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/codecrafters-alt/Nexa-Ai.git
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
npm start
```

---

# 🔑 Environment Variables

Create a `.env` file inside `server/` and add:

```env
MONGODB_URI=
JWT_SECRET=
GOOGLE_API_KEY=
GEMINI_API_KEY=
HUGGINGFACEHUB_API_TOKEN=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
EMAIL=
EMAIL_PASS=
```

---

# 📈 Future Improvements

* Custom email domain integration
* Streaming AI responses
* Multi-file document support
* Chat memory optimization
* Better AI workflow orchestration
* Deployment & scaling improvements

---

# 👨‍💻 Author

Anik Chakraborty

---

# ⭐ If you like this project, consider giving it a star!

