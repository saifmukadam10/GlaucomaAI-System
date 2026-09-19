import os

from huggingface_hub import HfApi


HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    raise RuntimeError("Set HF_TOKEN in your environment before uploading weights.")

api = HfApi(token=HF_TOKEN)

# Create the repo
api.create_repo(
    repo_id="saifmukadam10/glaucoma-weights",
    repo_type="model",
    exist_ok=True,
    private=False
)

# Upload weights folder
api.upload_folder(
    folder_path="./models/weights",
    repo_id="saifmukadam10/glaucoma-weights",
    repo_type="model"
)

print("Done! https://huggingface.co/saifmukadam10/glaucoma-weights")
