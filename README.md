# 🏛️ ASKME — The AI-Powered Civic Action Platform

> **Project Classification:** Open-Source Civic Technology & AI-Assisted Municipal Grievance Redressal Platform (Public Utility Software & Administrative NLP Pipeline).

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Expo: v57](https://img.shields.io/badge/Expo-v57.0.0-0D0D0C.svg?logo=expo)](https://expo.dev)
[![Model: FLAN-T5](https://img.shields.io/badge/Model-FLAN--T5--Small-F47738.svg?logo=huggingface)](https://huggingface.co/google/flan-t5-small)
[![Dataset: Kaggle](https://img.shields.io/badge/Dataset-Kaggle%20Civic%20Actions-20BEFF.svg?logo=kaggle)](https://kaggle.com)
[![Build Status](https://img.shields.io/badge/Verification-22%2F22%20Passed-22C55E.svg)](#-verification--testing)

---

## 🌟 Tagline & Vision

> *"Your Voice. Your Rights. Your City."*  
> **One problem. One report. The right authority.**

Citizens frequently encounter severe public problems—dangerous potholes, uncollected waste, toxic sewage leaks, non-functional streetlights, and hazardous live wires. However, most citizens do not know:
- Which statutory municipal department is responsible.
- Where or how to file a formal legal grievance.
- How to draft an objective, statutory petition under citizen charter guidelines.
- How to track whether the issue was registered with the competent authority.

**ASKME bridges this gap through an intelligent, multimodal AI workflow.**

---

## ⚡ What ASKME Does

```
┌─────────────────┐     ┌───────────────────┐     ┌────────────────────────┐     ┌───────────────────────┐
│ Citizen Intake  │ ──> │ Evidence & GIS    │ ──> │ Authority Mapping      │ ──> │ Formal Petition &     │
│ (Photo / Voice) │     │ Verification      │     │ (BBMP / GCC / MCD / ..)│     │ FLAN-T5 Action Audit  │
└─────────────────┘     └───────────────────┘     └────────────────────────┘     └───────────────────────┘
```

1. **Multimodal Citizen Intake**: Accepts photographs with automatic EXIF GPS extraction, voice audio recordings in regional languages, or natural text descriptions.
2. **Fact vs. Evidence Separation**: Strict guardrails separate citizen claims from verified photographic exhibits and objective AI interpretations.
3. **GIS Jurisdiction Engine**: Automatically maps coordinates and landmarks to the exact statutory municipal corporation (BBMP, GCC, BMC, MCD, PMC, GHMC, NHAI, Indian Railways RailMadad, BWSSB, BESCOM, etc.).
4. **Statutory Complaint Construction**: Generates a professional, legally structured petition letter formatted according to public grievance standards.
5. **Open-Source AI Action Summarizer**: Powered by a fine-tuned lightweight Seq2Seq model (**`google/flan-t5-small`**), providing a transparent, 5-stage civic action executive audit trail.
6. **Official Portal Dispatch**: Directly opens and queues the complaint in the verified government redressal portal with a certified reference tracking ID (`ASKME-2026-XXXXXX`).

---

## 🧠 Machine Learning Architecture & Kaggle Pipeline

ASKME integrates a **lightweight, open-source model** (`google/flan-t5-small`, ~77M parameters) to synthesize workflow telemetry into executive administrative summaries.

```
                         ┌──────────────────────────────────────────────┐
                         │ Civic Action Request (Citizen Grievance)    │
                         └──────────────────────┬───────────────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ Tier 1: Local Model Server   │
                                 │ (http://localhost:5000)      │
                                 └──────────────┬───────────────┘
                                                │ (if unavailable)
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ Tier 2: Hugging Face API     │
                                 │ (FLAN-T5 Serverless Endpoint)│
                                 └──────────────┬───────────────┘
                                                │ (if offline / no key)
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ Tier 3: Neural Heuristic     │
                                 │ On-Device Civic Engine       │
                                 │ (Zero External Dependencies) │
                                 └──────────────────────────────┘
```

### Kaggle Dataset & Fine-Tuning Artifacts:
- [`data/askme_civic_summaries_train.csv`](data/askme_civic_summaries_train.csv): 1,530 paired civic telemetry samples across 8 municipal categories.
- [`data/askme_civic_summaries_val.csv`](data/askme_civic_summaries_val.csv): 270 validation records.
- [`data/askme_civic_dataset.jsonl`](data/askme_civic_dataset.jsonl): Full dataset in Hugging Face format.
- [`notebooks/kaggle_civic_summarizer_finetune.ipynb`](notebooks/kaggle_civic_summarizer_finetune.ipynb): 1-Click Kaggle Notebook (runs on free T4 GPU in ~4 minutes).
- [`train/train_kaggle_summarizer.py`](train/train_kaggle_summarizer.py): Standalone PyTorch/Transformers training script with ROUGE metrics.
- [`train/serve_model.py`](train/serve_model.py): Local REST microservice (`POST /summarize`, `GET /health`).

---

## 📚 Academic Citations & Administrative Frameworks

This project builds upon established research in instruction-tuned language modeling and statutory civic governance:

1. **Instruction-Finetuned Sequence-to-Sequence Modeling:**  
   Chung, H. W., Hou, L., Longpre, S., Zoph, B., Tay, Y., Fedus, W., ... & Wei, J. (2022).  
   *Scaling Instruction-Finetuned Language Models.* Google Research. [arXiv:2210.11416](https://arxiv.org/abs/2210.11416).
2. **Text-to-Text Transfer Transformers (T5):**  
   Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., ... & Liu, P. J. (2020).  
   *Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer.* Journal of Machine Learning Research, 21(140), 1-67.
3. **Public Grievance Redressal Architecture:**  
   Department of Administrative Reforms and Public Grievances (DARPG), Government of India.  
   *Centralised Public Grievance Redress and Monitoring System (CPGRAMS) Guidelines & Citizen Charters.* [pgportal.gov.in](https://pgportal.gov.in).
4. **Geospatial Reverse Geocoding:**  
   OpenStreetMap Foundation & Nominatim API Architecture.  
   *Open Database License (ODbL) Geospatial Administrative Query Protocols.* [nominatim.org](https://nominatim.org).

---

## 🔒 Security, Privacy & Secret Management

- **Zero Hardcoded Secrets**: All private API keys and tokens are strictly configured through `.env.local` which is excluded by `.gitignore`.
- **Client-Side Privacy**: Photo EXIF GPS parsing and voice audio transcription are performed with citizen consent; sensitive coordinates are never shared with unauthorized third parties.
- **Auditable History**: All generated petitions and case records are stored locally on the citizen's device using encrypted `AsyncStorage`.

---

## 🧪 Verification & Testing

The repository contains an automated end-to-end verification suite:

```bash
# Run TypeScript compilation check
node node_modules/typescript/bin/tsc --noEmit

# Run complete system integrity and model test suite
node scripts/verify-askme.mjs
```

### Verification Checklist:
- [x] Verified directory of 19 real municipal & national statutory authorities.
- [x] Valid HTTPS grievance portal and website URLs.
- [x] Correct routing for National Highways (NHAI), Railways (RailMadad), State Boards (BWSSB), and Municipal Corps (BBMP, GCC, BMC, PMC, MCD).
- [x] Dynamic fallback generation for uncataloged municipalities.
- [x] FLAN-T5 prompt formatting & checkpoint generation.
- [x] Real-time executive summary generation with authority citation and reference ID.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (Node.js v24 recommended)
- **Python** 3.10+ (for local model training and microservice)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/mangorice316-coder/AskMe.git
cd AskMe

# Install JavaScript dependencies
npm install

# (Optional) Install Python ML dependencies for Kaggle model training
pip install torch transformers datasets evaluate rouge-score accelerate pandas
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_MODEL_ENDPOINT=http://localhost:5000/summarize
```

### 4. Start the Application
```bash
# Start the web version of ASKME
npx expo start --web
```
Open **[http://localhost:8081](http://localhost:8081)** in your browser.

### 5. Run Local Open-Source Model Microservice
```bash
python train/serve_model.py --port 5000
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

