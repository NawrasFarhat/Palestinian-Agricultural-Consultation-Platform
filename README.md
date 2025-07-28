# 🌿 Palestinian Agricultural Consultation Platform

##  Overview
An AI-powered full-stack system for diagnosing olive plant diseases and managing agricultural expertise.  
Developed in collaboration with the **Palestinian Agricultural Research Center**, this platform empowers farmers through a smart chatbot that adapts its diagnostic questions based on user responses, using a **rule-based skip logic system** and a **fine-tuned BERT model** for disease classification.



##  Objectives
- Help farmers diagnose plant diseases interactively.
- Enable engineers to manage diseases, symptoms, and treatments.
- Use AI for smart question selection and disease classification.

##  AI Components
- **Disease Classification:** BERT-based model trained on annotated symptom data.
- **Question Flow:** Rule-based skip logic (with plans to switch to LLM agent).
- **Dynamic Interaction:** Each user session adapts to the farmer's answers.

##  Tech Stack
| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React.js                       |
| Backend     | Node.js (Express), FastAPI     |
| Database    | MySQL                          |
| AI Model    | HuggingFace (AraBERT)          |
| Deployment  | Docker, Docker Compose         |

##  Features
- Chatbot interface for farmers with session tracking.
- Role-based dashboards (Manager, Engineer, Admin).
- Editable disease templates, symptoms, and treatments.
- Engineer requests require manager approval.



## Project Status
ℹ️ This project is in **active development**.

Improvements in progress:
- Replacing rule-based skip logic with **LLM-based agent**.

## 📂 Folder Structure

\`\`\`bash
project-root/
│
├── frontend/               # React app for user interface
│   ├── components/
│   └── pages/
│
├── backend/                # Node.js server for app logic & database
│   ├── controllers/
│   └── routes/
│
├── chatbot/                # FastAPI + BERT for diagnosis
│   ├── app.py
│   └── model
│
├── docker-compose.yml      # Multi-service deployment
└── README.md
\`\`\`

## 🤝 Acknowledgements
Developed in collaboration with:
- 📍 **Palestinian Agricultural Research Center**  
  Provided domain expertise and validated disease templates.

##  Contact
For questions or contributions, contact:
**Nawras Farhat** – [LinkedIn](https://www.linkedin.com/in/nawrasfarhatt)
