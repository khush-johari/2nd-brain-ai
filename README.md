# 🧠 Second Brain AI

![Project Status](https://img.shields.io/badge/Status-Live-success)
![Tech Stack](https://img.shields.io/badge/Stack-FullStack-blue)
![AI](https://img.shields.io/badge/AI-RAG%20Pipeline-purple)

**A Full Stack AI-powered Personal Knowledge Assistant.** This application allows users to store notes and "chat" with their own data. Unlike standard AI models, Second Brain uses **Retrieval Augmented Generation (RAG)** to ground answers in your personal knowledge base, eliminating hallucinations and providing context-aware responses.

🔗 **Live Demo:** https://2nd-brain-ai.vercel.app/

---

## 🚀 Key Features

- **📝 Smart Note Taking:** Create, edit, and store notes with rich text content.
- **🔍 Semantic Search:** Search your notes by _meaning_, not just keywords (e.g., searching "framework" finds "React").
- **🤖 AI Chat (RAG):** Ask questions like _"What did I learn about React?"_ and get answers based strictly on your saved notes.
- **⚡ High Performance:** Optimized for speed using `FastEmbed` for lightweight, CPU-friendly vector embeddings.
- **☁️ Cloud Native:** Fully deployed with a React frontend (Vercel) and Python FastAPI backend (Render).

---

## 🛠️ Tech Stack

### **Frontend**

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

### **Backend**

- **Framework:** FastAPI (Python)
- **AI Orchestration:** LangChain
- **LLM:** Groq API (Llama 3 / Mixtral)
- **Vector Database:** ChromaDB
- **Embeddings:** FastEmbed (Lightweight & Fast)

---

## 🏗️ Architecture

1.  **User Input:** User adds a note or asks a question via the React UI.
2.  **Vectorization:** The backend converts text into vector embeddings using `FastEmbed`.
3.  **Storage:** Embeddings are stored in `ChromaDB`.
4.  **Retrieval (Search):** When a user asks a question, the system finds the top 3 most relevant notes.
5.  **Generation (RAG):** The relevant notes + the user's question are sent to the **Groq LLM**, which generates a personalized answer.

---

## 💻 Local Setup Guide

Follow these steps to run the project on your machine.

### **1. Clone the Repository**

```bash
git clone [https://github.com/khush-johari/2nd-brain-ai.git](https://github.com/khush-johari/2nd-brain-ai.git)
cd 2nd-brain-ai
```

---

## 🚀 Deployment

- \*\*Frontend: Hosted on Vercel.
- \*\*Backend: Hosted on Render.
- \*\*CI/CD: Automatic deployments via GitHub.

---

##🔮 Future Roadmap (v2.0)

- **📝 PDF Upload:** Support for uploading and chatting with PDF documents.
- **🔍 User Authentication** Login system (Google/GitHub) for multi-user support.
- **🎙️ Voice Notes** Speech-to-text integration for easier note-taking.

---

##👨‍💻 Author

- Khushvardhan Johari Aspiring Tech & Management Professional | Full Stack AI Developer

Made with ❤️ and ☕
