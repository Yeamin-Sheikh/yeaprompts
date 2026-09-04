import os
import json
import sqlite3
import csv
import re

root_dir = r"c:\Users\Yeamin-Sheikh\Documents\antigravity\brave-hertz"
target = "16:9 horizontal"
replacement = "9:16 Vertical"

# 1. Update data/prompts.json
prompts_json_path = os.path.join(root_dir, "data", "prompts.json")
with open(prompts_json_path, "r", encoding="utf-8") as f:
    prompts = json.load(f)

updated_prompts_count = 0
total_replacements_count = 0

for p in prompts:
    text = p.get("promptText", "")
    if target in text:
        count = text.count(target)
        new_text = text.replace(target, replacement)
        p["promptText"] = new_text
        p["char_count"] = len(new_text)
        p["word_count"] = len(new_text.split())
        if "promptLen" in p:
            p["promptLen"] = len(new_text)
        updated_prompts_count += 1
        total_replacements_count += count
        print(f"Updated prompt #{p['id']} in prompts.json ({count} replacements)")

with open(prompts_json_path, "w", encoding="utf-8") as f:
    json.dump(prompts, f, indent=2, ensure_ascii=False)

print(f"data/prompts.json: {updated_prompts_count} prompts updated, {total_replacements_count} occurrences replaced.")

# 2. Update data/prompts/*.json
individual_dir = os.path.join(root_dir, "data", "prompts")
individual_files_updated = 0

for fname in os.listdir(individual_dir):
    if fname.endswith(".json"):
        fpath = os.path.join(individual_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        text = data.get("promptText", "")
        if target in text:
            new_text = text.replace(target, replacement)
            data["promptText"] = new_text
            data["char_count"] = len(new_text)
            data["word_count"] = len(new_text.split())
            if "promptLen" in data:
                data["promptLen"] = len(new_text)
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            individual_files_updated += 1
            print(f"Updated individual file {fname}")

print(f"Individual JSON files updated: {individual_files_updated}")

# 3. Update data/database.sqlite
db_path = os.path.join(root_dir, "data", "database.sqlite")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM prompts WHERE prompt_text LIKE ?", (f"%{target}%",))
db_matches_before = cursor.fetchone()[0]
print(f"SQLite prompts containing target before update: {db_matches_before}")

cursor.execute("UPDATE prompts SET prompt_text = REPLACE(prompt_text, ?, ?) WHERE prompt_text LIKE ?", (target, replacement, f"%{target}%"))
conn.commit()

# Update char_count and word_count in sqlite
cursor.execute("SELECT id, prompt_text FROM prompts")
all_db_rows = cursor.fetchall()
for row_id, row_text in all_db_rows:
    c_count = len(row_text) if row_text else 0
    w_count = len(row_text.split()) if row_text else 0
    cursor.execute("UPDATE prompts SET char_count = ?, word_count = ? WHERE id = ?", (c_count, w_count, row_id))

conn.commit()

cursor.execute("SELECT COUNT(*) FROM prompts WHERE prompt_text LIKE ?", (f"%{target}%",))
db_matches_after = cursor.fetchone()[0]
print(f"SQLite prompts containing target after update: {db_matches_after}")
conn.close()

# 4. Update data/prompts.csv
csv_path = os.path.join(root_dir, "data", "prompts.csv")
if os.path.exists(csv_path):
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for r in reader:
            p_id = int(r["id"])
            matched_p = next((p for p in prompts if p["id"] == p_id), None)
            if matched_p:
                r["char_count"] = str(len(matched_p["promptText"]))
                r["word_count"] = str(len(matched_p["promptText"].split()))
            rows.append(r)
    
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print("Updated data/prompts.csv char_count and word_count.")

print("Replacement across all datasets complete.")
