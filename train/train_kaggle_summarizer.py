#!/usr/bin/env python3
"""
ASKME Civic Action Summarization Model Fine-Tuning Pipeline
==========================================================

Trains and fine-tunes a lightweight Seq2Seq model (google/flan-t5-small, ~77M parameters)
on the ASKME Civic Action dataset to generate executive summaries of municipal actions.

Optimized for:
- Kaggle Notebooks (T4 / P100 GPU or CPU)
- Google Colab (Free T4 tier)
- Local GPU workstation

Requirements:
    pip install torch transformers datasets evaluate rouge-score accelerate pandas

Usage:
    python train/train_kaggle_summarizer.py \
        --model_name_or_path google/flan-t5-small \
        --train_file data/askme_civic_summaries_train.csv \
        --val_file data/askme_civic_summaries_val.csv \
        --output_dir ./civic_flan_t5_finetuned \
        --num_epochs 3 \
        --batch_size 8 \
        --learning_rate 5e-4
"""

import os
import sys
import argparse
import numpy as np
import pandas as pd

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune FLAN-T5 on ASKME Civic Summaries")
    parser.add_argument("--model_name_or_path", type=str, default="google/flan-t5-small", help="Pretrained model identifier")
    parser.add_argument("--train_file", type=str, default="data/askme_civic_summaries_train.csv", help="Path to training CSV")
    parser.add_argument("--val_file", type=str, default="data/askme_civic_summaries_val.csv", help="Path to validation CSV")
    parser.add_argument("--output_dir", type=str, default="./civic_flan_t5_finetuned", help="Directory to save fine-tuned weights")
    parser.add_argument("--num_epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=8, help="Batch size per device")
    parser.add_argument("--learning_rate", type=float, default=5e-4, help="Peak learning rate")
    parser.add_argument("--max_source_length", type=int, default=256, help="Max source token sequence length")
    parser.add_argument("--max_target_length", type=int, default=128, help="Max target token sequence length")
    parser.add_argument("--warmup_ratio", type=float, default=0.1, help="Linear warmup ratio")
    parser.add_argument("--weight_decay", type=float, default=0.01, help="L2 regularization weight decay")
    return parser.parse_args()

def main():
    args = parse_args()

    print("=" * 70)
    print("ASKME CIVIC SUMMARIZER - FLAN-T5 FINE-TUNING PIPELINE")
    print("=" * 70)
    print(f"Base Model:       {args.model_name_or_path}")
    print(f"Training Data:    {args.train_file}")
    print(f"Validation Data:  {args.val_file}")
    print(f"Output Directory: {args.output_dir}")
    print(f"Epochs:           {args.num_epochs}")
    print(f"Batch Size:       {args.batch_size}")
    print(f"Learning Rate:    {args.learning_rate}")
    print("=" * 70)

    try:
        import torch
        from transformers import (
            AutoTokenizer,
            AutoModelForSeq2SeqLM,
            DataCollatorForSeq2Seq,
            Seq2SeqTrainer,
            Seq2SeqTrainingArguments,
        )
        from datasets import Dataset, DatasetDict
    except ImportError as e:
        print(f"\n[ERROR] Missing required libraries: {e}")
        print("Please install via:\n  pip install torch transformers datasets evaluate rouge-score accelerate pandas")
        sys.exit(1)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Execution Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")

    # 1. Load Data
    if not os.path.exists(args.train_file) or not os.path.exists(args.val_file):
        print("\n[WARNING] Dataset CSVs not found in expected paths. Generating automatically...")
        script_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "prepare_kaggle_dataset.py")
        os.system(f"python {script_path}")

    print("\n[STEP 1/6] Loading CSV Datasets...")
    train_df = pd.read_csv(args.train_file)
    val_df = pd.read_csv(args.val_file)

    print(f"  Train set: {len(train_df):,} records")
    print(f"  Val set:   {len(val_df):,} records")

    raw_datasets = DatasetDict({
        "train": Dataset.from_pandas(train_df),
        "validation": Dataset.from_pandas(val_df),
    })

    # 2. Tokenizer
    print("\n[STEP 2/6] Initializing Tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_name_or_path)

    def preprocess_function(examples):
        inputs = [str(doc) for doc in examples["input_text"]]
        targets = [str(doc) for doc in examples["target_summary"]]

        model_inputs = tokenizer(
            inputs,
            max_length=args.max_source_length,
            padding=False,
            truncation=True,
        )

        labels = tokenizer(
            text_target=targets,
            max_length=args.max_target_length,
            padding=False,
            truncation=True,
        )

        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    print("\n[STEP 3/6] Tokenizing Datasets...")
    tokenized_datasets = raw_datasets.map(
        preprocess_function,
        batched=True,
        remove_columns=raw_datasets["train"].column_names,
    )

    # 3. Model
    print("\n[STEP 4/6] Loading Pretrained Model...")
    model = AutoModelForSeq2SeqLM.from_pretrained(args.model_name_or_path)
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  Total Parameters:     {total_params:,} ({total_params/1e6:.1f}M)")
    print(f"  Trainable Parameters: {trainable_params:,} (100% active)")

    data_collator = DataCollatorForSeq2Seq(
        tokenizer,
        model=model,
        label_pad_token_id=-100,
        pad_to_multiple_of=8 if torch.cuda.is_available() else None,
    )

    # 4. Evaluation Metrics
    def compute_metrics(eval_pred):
        try:
            import evaluate
            rouge_metric = evaluate.load("rouge")
        except Exception:
            return {"loss": 0.0}

        predictions, labels = eval_pred
        if isinstance(predictions, tuple):
            predictions = predictions[0]

        decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)
        # Replace -100 in the labels
        labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
        decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

        result = rouge_metric.compute(
            predictions=decoded_preds,
            references=decoded_labels,
            use_stemmer=True,
        )
        return {k: round(v * 100, 2) for k, v in result.items()}

    # 5. Training Arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=args.output_dir,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=args.learning_rate,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        weight_decay=args.weight_decay,
        save_total_limit=2,
        num_train_epochs=args.num_epochs,
        predict_with_generate=True,
        fp16=torch.cuda.is_available(),
        logging_steps=50,
        warmup_ratio=args.warmup_ratio,
        report_to="none",
        load_best_model_at_end=True,
        metric_for_best_model="rougeL",
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["validation"],
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    print("\n[STEP 5/6] Starting Seq2Seq Fine-Tuning...")
    train_result = trainer.train()
    print(f"\nTraining Complete! Global Steps: {train_result.global_step}")

    # 6. Save Model and Tokenizer
    print("\n[STEP 6/6] Exporting Model & Weights...")
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"Model successfully saved to: {args.output_dir}")

    # 7. Verification Test Generation
    print("\n" + "=" * 70)
    print("POST-TRAINING INFERENCE TEST (SAMPLE CIVIC ACTION)")
    print("=" * 70)
    test_prompt = (
        "summarize civic action: Issue: Dangerous crater pothole causing vehicle skid | "
        "Category: Roads & Transportation | Severity: Urgent | Location: MG Road, Bengaluru, Karnataka | "
        "Evidence: 2 verified photo(s) attached | Authority: Bruhat Bengaluru Mahanagara Palike (BBMP) | "
        "Portal: https://bbmp.gov.in | Reference ID: ASKME-2026-TEST99 | Status: Submitted"
    )

    inputs = tokenizer(test_prompt, return_tensors="pt", max_length=args.max_source_length, truncation=True).to(device)
    model.to(device)
    model.eval()

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=args.max_target_length,
            num_beams=4,
            length_penalty=1.0,
            early_stopping=True,
        )
    generated_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    print(f"INPUT:\n{test_prompt}\n")
    print(f"FINE-TUNED MODEL PREDICTION:\n{generated_text}\n")
    print("=" * 70)
    print("TRAINING PIPELINE FINISHED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()

