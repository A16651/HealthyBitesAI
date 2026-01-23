# Know what you eat.
## Label Padhega India 
 **Empowering consumers to decode what they eat.**  
 *A Next-Gen Food Transparency Backend powered by IBM Watson AI & FastAPI.*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/) 
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![IBM Watson](https://img.shields.io/badge/IBM%20Watson-052FAD?style=for-the-badge&logo=ibm&logoColor=white)](https://www.ibm.com/watson)

---

## 📖 About The Project

**Label Padhega India** is a mission-driven technical solution designed to bring transparency to the packaged food industry. In a market flooded with misleading "Healthy" labels and hidden harmful ingredients, this application acts as a vigilant personal nutritionist.

By leveraging **Generative AI (IBM Watsonx.ai)** and **Optical Character Recognition (OCR)**, the backend analyzes complex ingredient lists to flag health risks like **hidden sugars**, **harmful additives (E-numbers)**, and the infamous **"Maida Trap"** (refined flour disguised as wheat).

### 🚀 Key Features

*   **🧠 AI-Powered Analysis**: Utilizes IBM Watson to semantically understand ingredient quality and health impact, not just keyword matching.
*   **📸 Instant Label OCR**: Users can upload a photo of a food package, and our system extracts the text using Watson Discovery to perform an instant health audit.
*   **🔍 Open Food Facts Integration**: Seamlessly connects with the world's largest open database of food products for barcode scanning and search.
*   **🛡️ Consumer Protection Guardrails**: Automatically detects and flags:
    *   **Maida Traps** (Refined Wheat Flour disguised in "Atta" biscuits).
    *   **Hidden Sugars** (Maltodextrin, High Fructose Corn Syrup).
    *   **Fake Marketing Claims** ("No Sugar Added" validity checks).

---

## 🛠️ Technical Architecture

Built with a focus on **Performance**, **Scalability**, and **Developer Experience**.

*   **AI Engine**: [IBM Watsonx.ai](https://www.ibm.com/products/watsonx-ai) - For LLM-based ingredient analysis.
*   **Data Processing**: [IBM Watson Discovery](https://www.ibm.com/products/watson-discovery) - For robust OCR and document understanding.
*   **External API**: [Open Food Facts](https://world.openfoodfacts.org/) - Real-time product metadata.
*   **Architecture**: Modular Service-Oriented Architecture (Services, Routes, Models separation).

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Python 3.9+
*   Pip
*   IBM Cloud Account (for Watson credentials)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Aniket-16-S/orbital-aldrin.git
    cd orbital-aldrin
    ```

2.  **Create Virtual Environment** (Optional but recommended)
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your IBM credentials:
    ```env
    IBM_WATSON_API_KEY=your_api_key
    IBM_WATSON_URL=your_service_url
    IBM_PROJECT_ID=your_project_id
    ```

5.  **Run the Server**
    ```bash
    uvicorn app.main:app --reload
    ```
    or Just run `python -m app.main.py`

    *The server will start at `http://127.0.0.1:8000`*

---

