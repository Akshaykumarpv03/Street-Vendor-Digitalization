# Street Vendor Digitalization Agent

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

A Street Vendor Digitalization Agent powered by IBM watsonx, helping local hawkers and micro-entrepreneurs become digitally visible. The agent generates business profiles, UPI setup guides, local SEO strategies, and customer engagement tips by leveraging RAG (Retrieval-Augmented Generation) on real-time policies, MSME schemes, digital onboarding steps, and consumer behavior insights.

## Features

- **Multi-Agent Architecture**: Uses an orchestrator agent that routes tasks to specialist agents (Policy & Scheme, Market Insights, UPI Guide, Marketing, and Translation).
- **Digital Business Profiles**: Generates professional profiles and promotional content tailored to the vendor's location and business.
- **UPI & Payment Guides**: Step-by-step guides for UPI/QR setup and digital marketplace listing (e.g., ONDC).
- **Market & Pricing Insights**: Provides localized market insights, demand patterns, and pricing strategies.
- **Policy & Scheme Assistant**: Helps vendors understand their eligibility for government schemes like PM SVANidhi and MSME registration.
- **Multilingual Support**: Supports regional languages via a dedicated Translation Agent, making it accessible to non-English speakers.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Python, Flask
- **AI & LLM**: IBM watsonx.ai (Granite models)
- **Database/Vector Store**: Milvus (watsonx.data) / Chroma (local fallback)

## Architecture

The system employs a multi-agent orchestration pattern where a central Orchestrator analyzes vendor input and delegates tasks to specific agents:

1. **Policy & Scheme Agent**
2. **Market Insights Agent**
3. **UPI Guide Agent**
4. **Marketing Agent**
5. **Language Translation Agent**

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- IBM watsonx.ai account and credentials

### 1. Clone the repository

```bash
git clone https://github.com/Akshaykumarpv03/Street-Vendor-Digitalization.git
cd Street-Vendor-Digitalization
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory based on `.env.example`:
```
WATSONX_API_KEY=<your-key>
WATSONX_PROJECT_ID=<your-project-id>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=<granite-model-id>
EMBEDDING_MODEL_ID=<embedding-model-id>
USE_MOCK=false
```

Run the backend server:
```bash
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Configure `.env.local` if needed (by default it uses `VITE_API_BASE_URL=http://localhost:5000`).

Run the frontend development server:
```bash
npm run dev
```

## Usage

Once both the backend and frontend servers are running, navigate to `http://localhost:5173` in your browser. 
You can interact with the agent using text or voice input. For example, simply type: *"I sell fruit in Pune's Camp area"* and the Orchestrator will seamlessly generate insights, a digital profile, and scheme information in your preferred language.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
