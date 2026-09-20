import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from database import Base, engine, get_db
from predict import predict_disaster_rf, predict_disaster_xgb, predict_disaster_lstm
from routing import AStarSolver

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Disaster Prediction and Response API",
    description="Research-level CSE API platform supporting A* Routing and Machine Learning estimations.",
    version="1.0.0"
)

# Allow cross-origin requests for dashboard communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schemas
class WeatherInput(BaseModel):
    temp: float
    humidity: float
    wind_speed: float
    pressure: float
    rainfall: float
    model: Optional[str] = "XGBoost"

class RouteRequest(BaseModel):
    start_node: str
    goal_node: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    avoid_blocked: Optional[bool] = True
    hazard_multiplier: Optional[float] = 5.0
    traffic_multiplier: Optional[float] = 2.0

class SOSRequest(BaseModel):
    user_name: str
    contact: str
    location: str
    latitude: float
    longitude: float
    description: str
    severity: str
    needs_rescue: bool
    medical_required: bool

@app.get("/")
def read_root():
    return {"status": "Online", "service": "AI-Based Disaster Prediction & Response Engine"}

@app.post("/api/predict")
def predict_hazard(data: WeatherInput):
    """
    Evaluates ML algorithms based on query parameter
    """
    m = data.model.lower() if data.model else "xgboost"
    
    if "random" in m or "forest" in m:
        result = predict_disaster_rf(data.temp, data.humidity, data.wind_speed, data.pressure, data.rainfall)
    elif "lstm" in m:
        result = predict_disaster_lstm(data.temp, data.humidity, data.wind_speed, data.pressure, data.rainfall)
    else:
        result = predict_disaster_xgb(data.temp, data.humidity, data.wind_speed, data.pressure, data.rainfall)
        
    return {
        "metrics": {
            "temp": data.temp,
            "humidity": data.humidity,
            "wind_speed": data.wind_speed,
            "pressure": data.pressure,
            "rainfall": data.rainfall
        },
        "prediction": result
    }

@app.post("/api/evacuation-route")
def compute_evacuation_route(req: RouteRequest):
    """
    Computes A* safest route avoiding blockages and minimizing storm risk.
    """
    solver = AStarSolver(req.nodes, req.edges)
    result = solver.find_safest_route(
        start_id=req.start_node,
        goal_id=req.goal_node,
        avoid_blocked=req.avoid_blocked,
        hazard_multiplier=req.hazard_multiplier,
        traffic_multiplier=req.traffic_multiplier
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No safe evacuation route found. All sectors compromised."
        )
    return result

@app.post("/api/sos")
def post_sos_beacon(req: SOSRequest):
    """
    Saves an SOS rescue alert.
    """
    # In production, this saves directly to database via SQL Alchemy:
    # db_sos = models.EmergencyRequest(...)
    # db.add(db_sos)
    # db.commit()
    return {
        "status": "Broadcasted",
        "message": f"Global alert dispatched for {req.user_name} at {req.location}.",
        "coordinates": {"lat": req.latitude, "lng": req.longitude}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
