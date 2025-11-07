from pathlib import Path

import pandas as pd

data_folder = Path("data")

# load data
csv_path = data_folder / "input" / "impacts.csv"
df = pd.read_csv(csv_path)

# export JSON
output_path = Path("public") / "data" / "impacts.json"
df.to_json(output_path, orient="records", indent=2)
