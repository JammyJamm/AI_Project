from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore, initialize_app
import requests 
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import time


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Firestore setup
cred = credentials.Certificate("credentials.json")
initialize_app(cred)
db = firestore.client()

# ----------------------------- FIRESTORE ROUTES -----------------------------

@app.get("/data")
def get_daily_activity():
    """Get all dailyActivity documents"""
    docs = db.collection("dailyActivity").stream()
    return [doc.to_dict() for doc in docs]


@app.post("/data")
def add_daily_activity(item: dict):
    """Add a document to dailyActivity"""
    db.collection("dailyActivity").add(item)
    return {"status": "success"}


@app.post("/addData")
async def add_daily_data(request: Request):
    """Add new data to daily_data collection"""
    try:
        data = await request.json()
        db.collection("daily_data").add(data)
        return {
            "status": "success",
            "data": data,
            "message": "Data added to Firestore successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/getData")
def get_daily_data():
    """Fetch all documents from daily_data"""
    docs = db.collection("daily_data").stream()
    data = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return {"status": "success", "data": data}

# ----------------------------- TELEGRAM BOT -----------------------------

@app.get("/")
async def root():
    return {"message": "Backend running and CORS enabled "}

TOKEN = "8428608965:AAF6lW1Rx8lbqn7c6Jgrc13o9m1UP9BPTck"
CHAT_ID = "6358353762"

@app.post("/telegramNotify")
async def send_message(request: Request):
    """Send a Telegram message"""
    body = await request.json()
    message = body.get("message", "Hello from FastAPI!")

    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": message}

    try:
        response = requests.post(url, data=payload)
        response.raise_for_status()
        return {"status": "success", "response": response.json()}
    except requests.exceptions.RequestException as e:
        return {"status": "failed", "error": str(e)}


 # -----------------------------     SHEEDULER   -----------------------------
API_KEY = "5920ebf8a8fa6bbf65383d2329f1ff7a"
CITY = "Chennai"

latest_weather = {"message": "No data yet"}

def fetch_weather():
    global latest_weather
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&units=metric&appid={API_KEY}"
        response = requests.get(url)
        data = response.json()

        latest_weather = {
            "city": CITY,
            "temp": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        print(" Weather fetched:", latest_weather)
    except Exception as e:  
        latest_weather = {"error": str(e)}

scheduler = BackgroundScheduler()
scheduler.add_job(fetch_weather, "cron", hour=13, minute=35)  # 24-hour format
scheduler.start()

@app.get("/")
def home():
    return {"message": "Weather scheduler running"}

@app.get("/latestWeather")
def get_latest_weather():
    return latest_weather


 # -----------------------------    MAP ROUTE  -----------------------------
 
ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRlMzQyMDZmNDY3ZjQwNzI4MGI4MDRhNTBlYTE0NzZlIiwiaCI6Im11cm11cjY0In0="


@app.post("/getRoute")
async def get_route(request: Request):
    body = await request.json()
    source = body.get("source")
    destination = body.get("destination")

    if not source or not destination:
        return {"status": "error", "message": "Source or destination missing"}

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    payload = {
        "coordinates": [
            [source[1], source[0]],  # lon, lat
            [destination[1], destination[0]],
        ],
        "options": {"avoid_features": ["ferries"]},
    }

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        res = requests.post(url, json=payload, headers=headers)
        data = res.json()
        if "features" not in data:
            return {"status": "error", "message": "No route found"}
        return {"status": "success", "route": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}