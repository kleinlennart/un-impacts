import json
from pathlib import Path

import pandas as pd

data_folder = Path("data")

# load data
csv_path = data_folder / "input" / "impacts.csv"
df = pd.read_csv(csv_path)

# convert to JSON
json_data = df.to_dict("records")

# export JSON
output_path = Path("public") / "data" / "impacts.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)