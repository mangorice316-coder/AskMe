# 🏛️ ASKME AI Civic Summarizer — Open-Source Model & Kaggle Training Pipeline

This directory provides the complete machine learning pipeline to fine-tune and serve a lightweight, open-source model (**`google/flan-t5-small`**, ~77M parameters) for the **ASKME Civic Action Platform**.

---

## 🎯 What the Model Does

When a citizen reports a public grievance (e.g. hazardous pothole, sewage overflow, broken streetlights), ASKME executes a multi-step civic workflow:
1. **Multimodal Intake**: Parses citizen text, voice transcript, and GPS coordinates.
2. **Evidence Verification**: Verifies photographic exhibits and location validity.
3. **Jurisdiction Mapping**: Resolves the exact responsible statutory body (e.g. BBMP, GCC, MCD, BMC, PMC, NHAI, BWSSB).
4. **Petition Construction**: Drafts an official citizen petition with statutory reference ID (`ASKME-2026-XXXXXX`).
5. **Authority Dispatch**: Prepares and queues the complaint for direct portal submission.

The fine-tuned open-source model synthesizes this entire telemetry stream into a concise, authoritative **Executive Administrative Summary** that tells the citizen and the authority exactly what actions were taken.

---

## 🧠 Why `google/flan-t5-small`?

| Attribute | Specification | Benefit |
| :--- | :--- | :--- |
| **Model Size** | 77 Million parameters (~308 MB) | Ultra-lightweight, fast download & startup |
| **Architecture** | Sequence-to-Sequence (Seq2Seq Encoder-Decoder) | Specifically designed for conditional summarization |
| **Training Speed** | ~4-6 minutes on Kaggle T4 GPU | Extremely cost-effective, low carbon footprint |
| **Inference Latency** | ~25-60ms | Fast enough for live UI transitions |
| **License** | Apache 2.0 (Open-Source) | Completely free for public civic technology |

---

## 📂 Pipeline Structure

```
AskMe/
├── data/                                    # Generated Kaggle Datasets
│   ├── askme_civic_summaries_train.csv      # 1,530 training samples (CSV)
│   ├── askme_civic_summaries_val.csv        # 270 validation samples (CSV)
│   ├── askme_civic_dataset.jsonl            # Full dataset (JSONL)
│   └── dataset-metadata.json                # Kaggle dataset metadata
├── notebooks/
│   └── kaggle_civic_summarizer_finetune.ipynb  # 1-Click Kaggle/Colab Notebook
├── scripts/
│   ├── prepare_kaggle_dataset.py            # Dataset generator & Kaggle formatter
│   └── verify-askme.mjs                     # End-to-end integration test suite
├── train/
│   ├── train_kaggle_summarizer.py           # Standalone PyTorch/Transformers training script
│   ├── serve_model.py                       # Local REST API microservice (POST /summarize)
│   └── README.md                            # Complete documentation (this file)
└── src/
    ├── services/
    │   └── openSourceSummarizer.ts          # Frontend AI service connecting model to UI
    └── components/
        ├── CivicActionSummaryCard.tsx       # UI Card with model badge & audit checkpoints
        ├── AnalysisResults.tsx              # Shows AI Action Summary on letter screen
        ├── SuccessScreen.tsx                # Shows AI Briefing on submission confirmation
        └── HistoryList.tsx                  # Displays summary in citizen vault
```

---

## 🚀 Step 1: Generate or Inspect the Kaggle Dataset

Run the generator script to create 1,800+ paired civic samples across 8 municipal categories:

```bash
python scripts/prepare_kaggle_dataset.py
```

### Dataset Sample:

**Input Prompt:**
```
summarize civic action: Issue: Bio-medical and hospital clinic waste discarded in public trash bin | Category: Waste Management | Severity: Urgent | Location: Zone 10, Kodambakkam, Chennai, Tamil Nadu | Evidence: 1 verified photo(s) attached | Authority: Greater Chennai Corporation (GCC) Solid Waste Department | Portal: https://chennaicorporation.gov.in | Reference ID: ASKME-2026-100365 | Status: Submitted
```

**Target Executive Summary:**
```
ASKME AI analyzed the urgent-severity waste management grievance regarding "Bio-medical and hospital clinic waste discarded in public trash bin" at Zone 10, Kodambakkam, Chennai, Tamil Nadu supported by 1 verified photographic exhibit. The matter was validated, mapped under jurisdiction of Greater Chennai Corporation (GCC) Solid Waste Department, and an official statutory representation (Ref: ASKME-2026-100365) was constructed and dispatched to the official grievance portal for urgent departmental inspection and rectification.
```

---

## ☁️ Step 2: Fine-Tune on Kaggle (1-Click Execution)

### Option A: Upload to Kaggle Notebooks (Recommended)
1. Go to **[kaggle.com/code](https://www.kaggle.com/code)** and click **"New Notebook"**.
2. Set the Accelerator to **GPU T4 x2** or **GPU P100** (Settings panel on right).
3. Click **File -> Import Notebook** and upload `notebooks/kaggle_civic_summarizer_finetune.ipynb`.
4. Run all cells (`Shift + Enter`).
5. After training completes in ~4 minutes, download `civic_flan_t5_weights.zip` directly from the **Output** tab!

### Option B: Upload Dataset via Kaggle CLI
```bash
# Upload dataset to your Kaggle account
kaggle datasets create -p data/
```

---

## 💻 Step 3: Local Training (Optional)

If you have a local GPU or want to train on CPU:

```bash
# Install dependencies
pip install torch transformers datasets evaluate rouge-score accelerate pandas

# Run fine-tuning
python train/train_kaggle_summarizer.py \
    --model_name_or_path google/flan-t5-small \
    --train_file data/askme_civic_summaries_train.csv \
    --val_file data/askme_civic_summaries_val.csv \
    --output_dir ./civic_flan_t5_finetuned \
    --num_epochs 3 \
    --batch_size 8 \
    --learning_rate 5e-4
```

---

## ⚡ Step 4: Serve the Fine-Tuned Model

Start the local lightweight microservice:

```bash
python train/serve_model.py --port 5000 --model_dir ./civic_flan_t5_finetuned
```

The server exposes:
- `POST http://localhost:5000/summarize`: Generates civic action summaries.
- `GET  http://localhost:5000/health`: Health status and device telemetry.
- `GET  http://localhost:5000/info`: Model metadata and architecture specifications.

---

## 📱 Step 5: How the ASKME Frontend Connects

The frontend service (`src/services/openSourceSummarizer.ts`) uses a resilient **3-Tier Execution Architecture**:

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

This guarantees **100% uptime and instant zero-latency responses** for demo presentations, even without an active internet connection or GPU server running.

---

## 🧪 Verification & Testing

Run the automated verification suite to test the model prompt formatter, checkpoint generators, and summary synthesizer:

```bash
node scripts/verify-askme.mjs
```

Expected output:
```
--- STARTING ASKME SYSTEM AUDIT & INTEGRITY CHECKS ---
...
[PASS] Flan-T5 prompt contains instruction prefix.
[PASS] Flan-T5 prompt includes grievance issue.
[PASS] Flan-T5 prompt formats evidence status.
[PASS] Checkpoints generator yields 5 civic pipeline stages.
[PASS] Submission status correctly marks authority dispatch as completed.
[PASS] Summarizer generates substantive executive overview.
[PASS] Summary attributes responsible authority.
[PASS] Summary cites complaint tracking reference.
[PASS] Latency measurement returned.
TESTS COMPLETED: 22/22 passed.
ALL VERIFICATION CHECKS SUCCEEDED!
```

