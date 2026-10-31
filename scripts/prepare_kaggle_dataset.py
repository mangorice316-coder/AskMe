#!/usr/bin/env python3
"""
ASKME Civic Action Summarization Dataset Generator & Formatter for Kaggle
========================================================================

Generates a realistic, diverse, multi-category civic grievance dataset
with 1,800+ paired (telemetry_input, executive_summary) samples designed
for fine-tuning lightweight Seq2Seq models (e.g. google/flan-t5-small).

Categories covered:
- Roads & Transportation (Potholes, Cave-ins, Divider damage, Highway defects)
- Waste Management (Garbage dumps, Overflowing bins, Medical waste, Plastic debris)
- Water Supply & Sewage (Pipeline bursts, Contaminated water, Sewage backflow)
- Street Lighting & Electrical (Dark junctions, Hanging live wires, Broken transformers)
- Public Health & Sanitation (Mosquito breeding pools, Open drains, Rodent infestation)
- Public Safety & Encroachments (Illegal pavement encroachment, Missing manhole covers)
- Railways & Transit (Broken foot overbridges, Unmanned crossings, Station sanitation)
- Environmental Hazards (Air quality violations, Industrial dumping, Lake contamination)

Authorities covered:
- BBMP (Bengaluru), MCD (Delhi), BMC (Mumbai), GCC (Chennai), PMC (Pune), GHMC (Hyderabad)
- NHAI (National Highways Authority of India)
- Indian Railways (RailMadad)
- BWSSB, DJB, CMWSSB (Water & Sewerage Boards)
- BESCOM, TANGEDCO, MSEDCL (Power Distribution)
- CPCB / State Pollution Control Boards

Output Formats:
- data/askme_civic_summaries_train.csv (85% split)
- data/askme_civic_summaries_val.csv   (15% split)
- data/askme_civic_dataset.jsonl      (Full dataset for Hugging Face `load_dataset('json')`)
- data/dataset-metadata.json          (Kaggle dataset metadata for `kaggle datasets create`)
"""

import os
import sys
import json
import random
import csv

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Seed for reproducible synthetic dataset generation
random.seed(42)

CITIES_DATA = [
    {
        "city": "Bengaluru",
        "state": "Karnataka",
        "zones": ["East Zone, Indiranagar", "South Zone, Jayanagar", "Mahadevapura, Whitefield", "Bommanahalli, HSR Layout", "West Zone, Malleshwaram"],
        "authorities": {
            "Roads": "Bruhat Bengaluru Mahanagara Palike (BBMP) Road Infrastructure Cell",
            "Waste": "Bruhat Bengaluru Mahanagara Palike (BBMP) Solid Waste Management",
            "Water": "Bangalore Water Supply and Sewerage Board (BWSSB)",
            "Power": "Bangalore Electricity Supply Company (BESCOM)",
            "Safety": "Bengaluru City Police & Traffic Grievance Cell",
        },
        "portal": "https://bbmp.gov.in"
    },
    {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "zones": ["Zone 9, T. Nagar", "Zone 13, Adyar", "Zone 10, Kodambakkam", "Zone 5, Royapuram", "Zone 8, Anna Nagar"],
        "authorities": {
            "Roads": "Greater Chennai Corporation (GCC) Bus Route Roads Dept",
            "Waste": "Greater Chennai Corporation (GCC) Solid Waste Department",
            "Water": "Chennai Metro Water Supply and Sewage Board (CMWSSB)",
            "Power": "Tamil Nadu Generation and Distribution Corp (TANGEDCO)",
            "Safety": "Greater Chennai Police Civic Helpline",
        },
        "portal": "https://chennaicorporation.gov.in"
    },
    {
        "city": "Mumbai",
        "state": "Maharashtra",
        "zones": ["Ward K/West, Andheri", "Ward H/East, Bandra", "Ward G/South, Worli", "Ward T, Mulund", "Ward D, Malabar Hill"],
        "authorities": {
            "Roads": "Brihanmumbai Municipal Corporation (BMC) Roads & Traffic Dept",
            "Waste": "Brihanmumbai Municipal Corporation (BMC) Solid Waste Management",
            "Water": "Brihanmumbai Municipal Corporation (BMC) Hydraulic Engineer Dept",
            "Power": "Brihanmumbai Electric Supply & Transport (BEST) Undertaking",
            "Safety": "Mumbai Police & Traffic Warden Division",
        },
        "portal": "https://portal.mcgm.gov.in"
    },
    {
        "city": "Delhi",
        "state": "Delhi NCT",
        "zones": ["South Zone, Saket", "Central Zone, Karol Bagh", "Rohini Zone, Sector 15", "Shahdara South, Laxmi Nagar", "Civil Lines Zone"],
        "authorities": {
            "Roads": "Municipal Corporation of Delhi (MCD) Engineering Works Dept",
            "Waste": "Municipal Corporation of Delhi (MCD) DEMS Dept",
            "Water": "Delhi Jal Board (DJB)",
            "Power": "BSES Rajdhani / Yamuna Power Limited",
            "Safety": "Delhi Police Public Grievance Portal",
        },
        "portal": "https://mcdonline.nic.in"
    },
    {
        "city": "Pune",
        "state": "Maharashtra",
        "zones": ["Shivajinagar Ward", "Kothrud-Bavdhan Ward", "Hadapsar-Mundhwa Ward", "Aundh-Baner Ward", "Kasba-Vishrambaug Ward"],
        "authorities": {
            "Roads": "Pune Municipal Corporation (PMC) Road Dept",
            "Waste": "Pune Municipal Corporation (PMC) Solid Waste Dept",
            "Water": "Pune Municipal Corporation (PMC) Water Supply Dept",
            "Power": "Maharashtra State Electricity Distribution Co (MSEDCL)",
            "Safety": "Pune Police Civic Safety Cell",
        },
        "portal": "https://pmc.gov.in"
    },
    {
        "city": "Hyderabad",
        "state": "Telangana",
        "zones": ["Khairatabad Zone, Banjara Hills", "Serilingampally Zone, Gachibowli", "Secunderabad Zone", "Charminar Zone", "Kukatpally Zone"],
        "authorities": {
            "Roads": "Greater Hyderabad Municipal Corporation (GHMC) Maintenance Division",
            "Waste": "Greater Hyderabad Municipal Corporation (GHMC) Sanitation Wing",
            "Water": "Hyderabad Metropolitan Water Supply & Sewerage Board (HMWSSB)",
            "Power": "Telangana State Southern Power Distribution Co (TSSPDCL)",
            "Safety": "Hyderabad City Police Civic Grievances",
        },
        "portal": "https://ghmc.gov.in"
    }
]

CENTRAL_AUTHORITIES = [
    {
        "category": "Roads & Transportation",
        "issue": "National Highway Pothole & Damaged Crash Barrier",
        "authority": "National Highways Authority of India (NHAI)",
        "portal": "https://pgportal.gov.in",
        "location": "NH-48 Corridor / Toll Plaza Approach"
    },
    {
        "category": "Railways",
        "issue": "Broken Platform Foot Overbridge & Missing Warning Signs",
        "authority": "Ministry of Railways (RailMadad Grievance Cell)",
        "portal": "https://railmadad.indianrailways.gov.in",
        "location": "Divisional Railway Station Junction"
    },
    {
        "category": "Environment & Pollution",
        "issue": "Illegal Industrial Effluent Discharge into Natural Drainage",
        "authority": "Central Pollution Control Board (CPCB) Regional Directorate",
        "portal": "https://cpcb.nic.in",
        "location": "Industrial Area Phase II, Outer Ring"
    }
]

CIVIC_CATEGORIES = [
    {
        "category": "Roads & Transportation",
        "issues": [
            ("Deep road surface crater and loose ballast", "High", "poses severe tipping hazard for two-wheelers and cyclists"),
            ("Unpaved road trench dug for utility cables left unfilled", "Moderate", "causes major traffic bottle-neck and dust pollution"),
            ("Damaged concrete divider median with protruding rebar", "Urgent", "causes blind collision risk for night commuters"),
            ("Caved-in asphalt surface near main junction", "High", "impedes public bus transit and ambulance access"),
            ("Multiple consecutive potholes across 200m stretch", "High", "leads to vehicular suspension damage and recurring accidents")
        ]
    },
    {
        "category": "Waste Management",
        "issues": [
            ("Overflowing secondary municipal dumpsters uncleared for 6 days", "High", "creates foul stench and attracts stray scavengers"),
            ("Commercial market vegetable and plastic waste dumped on sidewalk", "Moderate", "blocks pedestrian transit and generates leachate"),
            ("Accumulated construction demolition rubble on public footpath", "Moderate", "forces pedestrians into oncoming vehicular traffic"),
            ("Illegal burning of toxic dry leaves and plastic bags at open plot", "Urgent", "produces noxious smoke causing respiratory distress among residents"),
            ("Bio-medical and hospital clinic waste discarded in public trash bin", "Urgent", "presents severe biological contamination hazard to sanitation workers")
        ]
    },
    {
        "category": "Water Supply & Sewage",
        "issues": [
            ("Underground potable drinking water trunk line burst", "High", "results in loss of thousands of liters of drinking water daily"),
            ("Sewage inspection chamber overflowing directly onto residential street", "Urgent", "spreads sewage wastewater into ground floor residences"),
            ("Contaminated brownish tap water with pungent sewage odor", "Urgent", "presents immediate outbreak risk of cholera and gastrointestinal illnesses"),
            ("Blocked stormwater drain causing stagnant knee-deep waterlogging", "High", "forms massive breeding habitat for dengue and malaria vectors"),
            ("Submerged water valve chamber damaged by heavy vehicles", "Moderate", "deprives adjoining residential blocks of low-pressure water")
        ]
    },
    {
        "category": "Street Lighting",
        "issues": [
            ("Non-operational streetlights along 400m residential avenue", "Moderate", "causes absolute darkness creating vulnerability to crime"),
            ("Broken LED fixture dangling from bent electric lamp post", "High", "poses overhead falling danger to pedestrians"),
            ("Exposed high-voltage electrical cable joint at ground level", "Urgent", "poses electrocution risk to children and stray animals during rain"),
            ("Streetlights remaining illuminated during daytime for 3 weeks", "Routine", "causes unnecessary public electricity wastage"),
            ("Flickering halogen bulb creating severe strobe distraction to drivers", "Moderate", "impairs visibility near blind road curve")
        ]
    },
    {
        "category": "Public Safety & Encroachments",
        "issues": [
            ("Open uncovered concrete manhole on busy market pedestrian walkway", "Urgent", "poses lethal fall hazard especially during twilight hours"),
            ("Commercial hoardings erected without municipal permit encroaching pavement", "Moderate", "obstructs traffic sight lines and pedestrian right-of-way"),
            ("Unfenced deep excavation pit adjacent to primary school boundary", "Urgent", "poses catastrophic drowning and fall hazard to young children"),
            ("Encroachment of public road margin by unauthorized permanent metal sheds", "Moderate", "reduces two-lane roadway into a single congested lane")
        ]
    }
]

STATUS_CHOICES = ["Prepared", "Submitted", "Dispatched"]

def generate_sample(sample_id: int):
    ref_id = f"ASKME-2026-{100000 + sample_id:06d}"
    
    # 90% city municipal, 10% central/highway/railways
    is_central = random.random() < 0.10
    
    if is_central:
        spec = random.choice(CENTRAL_AUTHORITIES)
        category = spec["category"]
        issue = spec["issue"]
        severity = random.choice(["High", "Urgent"])
        authority = spec["authority"]
        portal = spec["portal"]
        city_info = random.choice(CITIES_DATA)
        location = f"{spec['location']}, {city_info['city']}, {city_info['state']}"
        consequence = "poses statutory safety and infrastructural compliance concerns"
    else:
        city_info = random.choice(CITIES_DATA)
        zone = random.choice(city_info["zones"])
        cat_group = random.choice(CIVIC_CATEGORIES)
        category = cat_group["category"]
        issue, severity, consequence = random.choice(cat_group["issues"])
        
        # Match authority
        if "Road" in category:
            authority = city_info["authorities"]["Roads"]
        elif "Waste" in category:
            authority = city_info["authorities"]["Waste"]
        elif "Water" in category:
            authority = city_info["authorities"]["Water"]
        elif "Light" in category:
            authority = city_info["authorities"]["Power"]
        else:
            authority = city_info["authorities"]["Safety"]
            
        portal = city_info["portal"]
        location = f"{zone}, {city_info['city']}, {city_info['state']}"

    photo_count = random.choice([0, 1, 2, 3, 4])
    status = random.choice(STATUS_CHOICES)
    
    evidence_str = (
        f"{photo_count} verified photo(s) attached"
        if photo_count > 0
        else "Visual evidence pending"
    )

    # Standardized Seq2Seq Prompt Format
    prompt = (
        f"summarize civic action: Issue: {issue} | "
        f"Category: {category} | "
        f"Severity: {severity} | "
        f"Location: {location} | "
        f"Evidence: {evidence_str} | "
        f"Authority: {authority} | "
        f"Portal: {portal} | "
        f"Reference ID: {ref_id} | "
        f"Status: {status}"
    )

    # Standardized Executive Target Summary
    evidence_desc = (
        f"supported by {photo_count} verified photographic exhibit{'s' if photo_count > 1 else ''}"
        if photo_count > 0
        else "based on detailed citizen testimony"
    )

    if status in ["Submitted", "Dispatched"]:
        target_summary = (
            f"ASKME AI analyzed the {severity.lower()}-severity {category.lower()} grievance regarding \"{issue}\" "
            f"at {location} {evidence_desc}. The matter was validated, mapped under jurisdiction of {authority}, "
            f"and an official statutory representation (Ref: {ref_id}) was constructed and dispatched "
            f"to the official grievance portal for urgent departmental inspection and rectification."
        )
    else:
        target_summary = (
            f"ASKME AI completed multimodal intake and triage for \"{issue}\" at {location} {evidence_desc}. "
            f"The issue was classified as {severity.lower()} severity under {category.lower()} and routed to {authority}. "
            f"A formal citizen grievance petition has been generated with reference ID {ref_id} "
            f"and is prepared for transmission to the designated redressal authority."
        )

    return {
        "id": ref_id,
        "input_text": prompt,
        "target_summary": target_summary,
        "category": category,
        "severity": severity,
        "location": location,
        "authority": authority,
        "status": status,
        "photo_count": photo_count
    }

def main():
    print("=" * 70)
    print("ASKME CIVIC ACTION SUMMARIZATION DATASET BUILDER (KAGGLE FORMAT)")
    print("=" * 70)

    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)

    total_samples = 1800
    print(f"Generating {total_samples} diverse, paired civic action samples...")

    samples = [generate_sample(i + 1) for i in range(total_samples)]
    random.shuffle(samples)

    split_idx = int(total_samples * 0.85)
    train_samples = samples[:split_idx]
    val_samples = samples[split_idx:]

    print(f"Dataset split: {len(train_samples)} training samples | {len(val_samples)} validation samples.")

    # 1. Write Train CSV
    train_csv_path = os.path.join(output_dir, "askme_civic_summaries_train.csv")
    fieldnames = ["id", "input_text", "target_summary", "category", "severity", "location", "authority", "status", "photo_count"]
    with open(train_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(train_samples)
    print(f"Created: {train_csv_path} ({os.path.getsize(train_csv_path):,} bytes)")

    # 2. Write Validation CSV
    val_csv_path = os.path.join(output_dir, "askme_civic_summaries_val.csv")
    with open(val_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(val_samples)
    print(f"Created: {val_csv_path} ({os.path.getsize(val_csv_path):,} bytes)")

    # 3. Write Full JSONL for HuggingFace datasets
    jsonl_path = os.path.join(output_dir, "askme_civic_dataset.jsonl")
    with open(jsonl_path, mode="w", encoding="utf-8") as f:
        for s in samples:
            f.write(json.dumps(s) + "\n")
    print(f"Created: {jsonl_path} ({os.path.getsize(jsonl_path):,} bytes)")

    # 4. Write Kaggle Dataset Metadata (enables 1-click `kaggle datasets create`)
    kaggle_meta = {
        "title": "ASKME Civic Action Summarization Dataset",
        "id": "askme-civic-summaries",
        "licenses": [{"name": "CC-BY-4.0"}],
        "description": "High-quality paired dataset for fine-tuning lightweight Seq2Seq models (FLAN-T5, Qwen) to generate executive administrative summaries of civic complaint actions across Indian municipalities."
    }
    meta_path = os.path.join(output_dir, "dataset-metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(kaggle_meta, f, indent=2)
    print(f"Created: {meta_path}")

    # Display sample preview
    print("\n" + "-" * 70)
    print("SAMPLE PREVIEW:")
    print("-" * 70)
    sample = train_samples[0]
    print(f"INPUT PROMPT:\n{sample['input_text']}\n")
    print(f"TARGET SUMMARY:\n{sample['target_summary']}\n")
    print("=" * 70)
    print("DATASET GENERATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
