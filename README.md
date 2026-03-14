# 🟣 Verifiable AI Chat | OpenGradient TEE

A Web3-native, cryptographically secure chat interface that proves AI execution. 

Unlike standard AI wrappers, this application routes all prompts through an **OpenGradient Trusted Execution Environment (TEE)**. Every AI response generates a cryptographic receipt—including the transaction hash, latency, and exact model ID—settled directly on the **Base Sepolia** blockchain.



## ✨ Core Features

* **Zero-Trust AI Inference:** Powered by OpenGradient's secure enclaves (TEE), ensuring the AI's execution cannot be tampered with.
* **On-Chain Settlement:** Every inference is cryptographically signed and settled on Base Sepolia.
* **Cryptographic UI:** A cyberpunk, pure dark mode interface featuring real-time "TEE VERIFIED" transaction receipts.
* **Ghost Mode & Persistent Memory:** Users can chat completely anonymously (Ghost Mode) or authenticate to save their session history securely via a lightweight SQLite database.
* **Vercel & Ngrok Integration:** Frontend deployed on Vercel, securely tunneling to a dedicated VPS backend.

## 🛠️ Tech Stack

**Frontend (Antigravity / Vercel):**
* React.js
* Tailwind CSS (Zero-Knowledge Violet aesthetic: `#B026FF`)
* Shadcn UI Components
* State Management via React Hooks & LocalStorage

**Backend (VPS / Kitchen):**
* Python 3.12 & FastAPI
* OpenGradient Python SDK
* SQLite (Session Memory)
* Ngrok (Secure HTTPS Tunneling)

## 🚀 Getting Started

### Prerequisites
* Python 3.12+
* Node.js & npm
* An OpenGradient Private Key (with Base Sepolia ETH for gas)

### 1. Backend Setup (The Kitchen)
Clone the repository and set up your environment variables:
```bash
git clone [https://github.com/yourusername/verifiable-ai-chat.git](https://github.com/yourusername/verifiable-ai-chat.git)
cd verifiable-ai-chat/backend

# Install dependencies
pip install fastapi uvicorn opengradient python-dotenv pydantic

# Create your .env file
echo "PRIVATE_KEY=your_opengradient_private_key_here" > .env

# Run the secure server
python3 chat_api.py
