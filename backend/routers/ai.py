from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import answer_fan_question

router = APIRouter(prefix="/api/ai", tags=["ai"])


class QuestionRequest(BaseModel):
    question: str
    match_context: dict = {}


@router.post("/ask")
def ask_ai(body: QuestionRequest):
    answer = answer_fan_question(body.question, body.match_context)
    return {"answer": answer}
