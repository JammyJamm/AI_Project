from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore, initialize_app

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firestore setup
cred = credentials.Certificate("credentials.json")
initialize_app(cred)
db = firestore.client()

# @app.get("/data")
# def get_data():
#     docs = db.collection("messages").stream()
#     return [doc.to_dict() for doc in docs]
@app.get("/data")
def get_data():
    return {"message": "Backend connected successfully!"}
    
@app.post("/data")
def add_data(item: dict):
    db.collection("messages").add(item)
    return {"status": "success"}
