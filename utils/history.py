import json
import os
from datetime import datetime

os.makedirs("history", exist_ok=True)


def save_history(result):

    filename = f"history/history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    with open(filename, "w") as file:
        json.dump(result, file, indent=4)

    return filename