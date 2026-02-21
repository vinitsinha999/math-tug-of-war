from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================

class MathProblem(BaseModel):
    """Model for a math problem"""
    question: str
    answer: int
    operand1: int
    operand2: int
    operation: str = "addition"


class GameSession(BaseModel):
    """Model for a game session"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team1_score: int = 0
    team2_score: int = 0
    team1_correct: int = 0
    team2_correct: int = 0
    tug_position: int = 0  # -5 (Team 1 wins) to +5 (Team 2 wins)
    status: str = "active"  # active, completed
    winner: Optional[str] = None
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    current_team1_problem: Optional[MathProblem] = None
    current_team2_problem: Optional[MathProblem] = None


class GameSessionCreate(BaseModel):
    """Model for creating a new game session"""
    duration: int = 120  # default 2 minutes


class AnswerSubmission(BaseModel):
    """Model for submitting an answer"""
    team: int  # 1 or 2
    answer: int
    problem_question: str  # to verify we're answering the right problem


class AnswerResponse(BaseModel):
    """Response after submitting an answer"""
    is_correct: bool
    correct_answer: int
    team_score: int
    team_correct: int
    tug_position: int
    new_problem: MathProblem


class GameStats(BaseModel):
    """Final game statistics"""
    winner: str
    team1_score: int
    team2_score: int
    team1_correct: int
    team2_correct: int
    duration: int
    end_time: datetime


# ==================== GAME LOGIC ====================

def generate_math_problem() -> MathProblem:
    """Generate a random single-digit addition problem"""
    operand1 = random.randint(1, 9)
    operand2 = random.randint(1, 9)
    answer = operand1 + operand2
    question = f"{operand1} + {operand2}"
    
    return MathProblem(
        question=question,
        answer=answer,
        operand1=operand1,
        operand2=operand2,
        operation="addition"
    )


def calculate_tug_position(team1_correct: int, team2_correct: int) -> int:
    """
    Calculate tug-of-war position based on correct answers
    Returns value from -10 to +10
    Negative = Team 1 advantage, Positive = Team 2 advantage
    """
    difference = team2_correct - team1_correct
    # Clamp between -10 and +10
    return max(-10, min(10, difference))


def determine_winner(team1_correct: int, team2_correct: int) -> str:
    """Determine the winner based on correct answers"""
    if team1_correct > team2_correct:
        return "team1"
    elif team2_correct > team1_correct:
        return "team2"
    else:
        return "tie"


# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Math Tug-of-War Game API"}


@api_router.post("/game/start", response_model=GameSession)
async def start_game(game_create: GameSessionCreate):
    """Start a new game session"""
    # Generate initial problems for both teams
    team1_problem = generate_math_problem()
    team2_problem = generate_math_problem()
    
    game_session = GameSession(
        duration=game_create.duration,
        current_team1_problem=team1_problem,
        current_team2_problem=team2_problem
    )
    
    # Convert to dict for MongoDB
    doc = game_session.model_dump()
    doc['start_time'] = doc['start_time'].isoformat()
    
    await db.game_sessions.insert_one(doc)
    
    return game_session


@api_router.get("/game/{session_id}", response_model=GameSession)
async def get_game(session_id: str):
    """Get current game state"""
    game = await db.game_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Convert ISO string back to datetime
    if isinstance(game['start_time'], str):
        game['start_time'] = datetime.fromisoformat(game['start_time'])
    if game.get('end_time') and isinstance(game['end_time'], str):
        game['end_time'] = datetime.fromisoformat(game['end_time'])
    
    return game


@api_router.post("/game/{session_id}/answer", response_model=AnswerResponse)
async def submit_answer(session_id: str, submission: AnswerSubmission):
    """Submit an answer and get a new problem"""
    # Get current game state
    game = await db.game_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if game['status'] != 'active':
        raise HTTPException(status_code=400, detail="Game is not active")
    
    # Get the current problem for the team
    if submission.team == 1:
        current_problem = game['current_team1_problem']
    elif submission.team == 2:
        current_problem = game['current_team2_problem']
    else:
        raise HTTPException(status_code=400, detail="Invalid team number")
    
    if not current_problem:
        raise HTTPException(status_code=400, detail="No current problem for team")
    
    # Verify the problem matches
    if current_problem['question'] != submission.problem_question:
        raise HTTPException(status_code=400, detail="Problem mismatch")
    
    # Check if answer is correct
    is_correct = submission.answer == current_problem['answer']
    
    # Update scores
    if is_correct:
        if submission.team == 1:
            game['team1_score'] += 10
            game['team1_correct'] += 1
        else:
            game['team2_score'] += 10
            game['team2_correct'] += 1
    
    # Recalculate tug position
    game['tug_position'] = calculate_tug_position(game['team1_correct'], game['team2_correct'])
    
    # Generate new problem for the team
    new_problem = generate_math_problem()
    
    if submission.team == 1:
        game['current_team1_problem'] = new_problem.model_dump()
    else:
        game['current_team2_problem'] = new_problem.model_dump()
    
    # Update in database
    await db.game_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "team1_score": game['team1_score'],
            "team2_score": game['team2_score'],
            "team1_correct": game['team1_correct'],
            "team2_correct": game['team2_correct'],
            "tug_position": game['tug_position'],
            "current_team1_problem": game['current_team1_problem'],
            "current_team2_problem": game['current_team2_problem']
        }}
    )
    
    return AnswerResponse(
        is_correct=is_correct,
        correct_answer=current_problem['answer'],
        team_score=game['team1_score'] if submission.team == 1 else game['team2_score'],
        team_correct=game['team1_correct'] if submission.team == 1 else game['team2_correct'],
        tug_position=game['tug_position'],
        new_problem=new_problem
    )


@api_router.post("/game/{session_id}/end", response_model=GameStats)
async def end_game(session_id: str):
    """End the game and calculate final statistics"""
    game = await db.game_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if game['status'] == 'completed':
        raise HTTPException(status_code=400, detail="Game already completed")
    
    # Calculate winner
    winner = determine_winner(game['team1_correct'], game['team2_correct'])
    
    # Calculate duration
    end_time = datetime.now(timezone.utc)
    start_time = datetime.fromisoformat(game['start_time']) if isinstance(game['start_time'], str) else game['start_time']
    duration = int((end_time - start_time).total_seconds())
    
    # Update game status
    await db.game_sessions.update_one(
        {"id": session_id},
        {"$set": {
            "status": "completed",
            "winner": winner,
            "end_time": end_time.isoformat(),
            "duration": duration
        }}
    )
    
    return GameStats(
        winner=winner,
        team1_score=game['team1_score'],
        team2_score=game['team2_score'],
        team1_correct=game['team1_correct'],
        team2_correct=game['team2_correct'],
        duration=duration,
        end_time=end_time
    )


@api_router.get("/game/{session_id}/stats", response_model=GameStats)
async def get_game_stats(session_id: str):
    """Get game statistics"""
    game = await db.game_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if game['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Game not completed yet")
    
    end_time = datetime.fromisoformat(game['end_time']) if isinstance(game['end_time'], str) else game['end_time']
    
    return GameStats(
        winner=game['winner'],
        team1_score=game['team1_score'],
        team2_score=game['team2_score'],
        team1_correct=game['team1_correct'],
        team2_correct=game['team2_correct'],
        duration=game['duration'],
        end_time=end_time
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
