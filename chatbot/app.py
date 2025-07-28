from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal
from readonly_question import GeneralQuestion
from readonly_skip_rule import SkipRule
from uuid import uuid4
from typing import Optional, List
from collections import defaultdict
import uvicorn
import json
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# إعداد CORS للسماح بجميع المصادر
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Allow all headers to be exposed
)

model_path = "Nawras03/olive-disease-diagnosis"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

with open(r"disease_metadata.json", "r", encoding="utf-8") as f:
    disease_metadata = json.load(f)
# معالجات الاستثناءات مع رؤوس CORS
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# General exception handler for any other errors
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Add response headers to every response with a middleware
@app.middleware("http")
async def add_cors_headers(request, call_next):
    try:
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            },
        )

# تخزين جلسات المستخدم في الذاكرة
sessions = defaultdict(dict)

# تعريف نماذج البيانات
class AnswerRequest(BaseModel):
    session_id: Optional[str] = None
    user_answer: str

class QuestionResponse(BaseModel):
    session_id: str
    question: str
    suggestions: Optional[List[str]] = []
    is_final: bool = False

# بدء التشخيص – أول سؤال
@app.get("/start", response_model=QuestionResponse)
def start_diagnosis():
    try:
        print("DEBUG: Starting diagnosis session")
        db = SessionLocal()
        try:
            # Try to access the database and handle potential errors
            print("DEBUG: Querying the first question from database")
            # Use question_id directly since we know that's the correct column
            first_question = db.query(GeneralQuestion).order_by(GeneralQuestion.question_id).first()
            print(f"DEBUG: Found question with ID: {first_question.question_id if first_question else 'None'}")
            
            if not first_question:
                print("DEBUG: No questions found in database")
                # Create a default question if none exists
                default_question = "Welcome to the Agricultural Consultation! How can I help you today?"
                session_id = str(uuid4())
                sessions[session_id]['answers'] = []
                sessions[session_id]['current_question'] = default_question
                
                return QuestionResponse(
                    session_id=session_id,
                    question=default_question,
                    suggestions=["I need plant disease advice", "General agricultural advice"],
                    is_final=False
                )
            
            print(f"DEBUG: Found question: {first_question.question_text}")
            session_id = str(uuid4())
            sessions[session_id]['answers'] = []
            sessions[session_id]['current_question'] = first_question.question_text

            suggestions = first_question.possible_answers.split('/') if first_question.possible_answers else []

            return QuestionResponse(
                session_id=session_id,
                question=first_question.question_text,
                suggestions=suggestions,
                is_final=False
            )
        except Exception as e:
            print(f"DATABASE ERROR: {str(e)}")
            # Provide a default response if database query fails
            default_question = "مرحبًا بك في الاستشارة الزراعية! قاعدة بيانات الأسئلة قيد الإعداد. كيف يمكنني مساعدتك اليوم؟"
            session_id = str(uuid4())
            sessions[session_id]['answers'] = []
            sessions[session_id]['current_question'] = default_question
            
            return QuestionResponse(
                session_id=session_id,
                question=default_question,
                suggestions=["أحتاج استشارة أمراض نباتية", "استشارة زراعية عامة"],
                is_final=False
            )
        finally:
            db.close()
    except Exception as outer_e:
        print(f"CRITICAL ERROR: {str(outer_e)}")
        # Fallback for any critical error
        session_id = str(uuid4())
        return QuestionResponse(
            session_id=session_id,
            question="عذرًا! خدمتنا تواجه حاليًا بعض الصعوبات التقنية. يرجى المحاولة لاحقًا.",
            suggestions=[],
            is_final=False
        )

# استقبال إجابة المستخدم وإحضار السؤال التالي
@app.post("/answer", response_model=QuestionResponse)
def process_answer(req: AnswerRequest):
    try:
        db = SessionLocal()
        # التأكد من وجود الجلسة
        if not req.session_id or req.session_id not in sessions:
            raise HTTPException(status_code=404, detail="الجلسة غير موجودة")
        # Append the user's answer to the session
        if 'answers' not in sessions[req.session_id]:
            sessions[req.session_id]['answers'] = []
        sessions[req.session_id]['answers'].append({
            "question": sessions[req.session_id]['current_question'],
            "answer": req.user_answer.strip()
        })
        user_answer = req.user_answer.strip().lower()
        current_question = sessions[req.session_id]['current_question']
        # Fetch all skip rules
        skip_rules = db.query(SkipRule).all()
        # Build set of all symptoms from skip rules
        import re
        symptoms_in_rules = set([rule.trigger_answer.strip().lower() for rule in skip_rules])
        # Extract symptoms mentioned in the answer (مطابقة تامة للكلمة)
        mentioned_symptoms = [
            symptom for symptom in symptoms_in_rules
            if symptom in user_answer
        ]
        # Find all questions
        all_questions = db.query(GeneralQuestion).order_by(GeneralQuestion.question_id).all()
        question_texts = [q.question_text for q in all_questions]
        # Identify which questions to skip
        skip_question_texts = set()
        if len(mentioned_symptoms) > 1:
            # Skip questions unrelated to mentioned symptoms
            for rule in skip_rules:
                if not any(symptom in rule.trigger_answer.strip().lower() for symptom in mentioned_symptoms):
                    skip_question_texts.add(rule.skip_child_text)
        elif len(mentioned_symptoms) == 1:
            # Skip questions related to other symptoms
            for rule in skip_rules:
                trigger = rule.trigger_answer.strip().lower()
                if trigger != mentioned_symptoms[0]:
                    skip_question_texts.add(rule.skip_child_text)
        else:
            # لم يتم اكتشاف أعراض بشكل مباشر، استخدم التشابه التقريبي مع قواعد التخطي
            for rule in skip_rules:
                if rule.parent_question_text == current_question:
                    # similarity = fuzz.ratio(rule.trigger_answer.strip().lower(), user_answer)
                    # if similarity >= 95:
                    #     skip_question_texts.add(rule.skip_child_text)
                    pass
        # Remove skipped questions from the list for this session
        if 'question_list' not in sessions[req.session_id]:
            sessions[req.session_id]['question_list'] = question_texts.copy()
        sessions[req.session_id]['question_list'] = [q for q in sessions[req.session_id]['question_list'] if q not in skip_question_texts]
        # Find index of current question
        try:
            idx = sessions[req.session_id]['question_list'].index(current_question)
        except ValueError:
            idx = -1
        next_idx = idx + 1
        # If there is a next question, update session and return it
        if next_idx < len(sessions[req.session_id]['question_list']):
            next_question_text = sessions[req.session_id]['question_list'][next_idx]
            sessions[req.session_id]['current_question'] = next_question_text
            next_question_obj = db.query(GeneralQuestion).filter(GeneralQuestion.question_text == next_question_text).first()
            suggestions = next_question_obj.possible_answers.split('/') if next_question_obj and next_question_obj.possible_answers else []
            db.close()
            return QuestionResponse(
                session_id=req.session_id,
                question=next_question_text,
                suggestions=suggestions,
                is_final=False
            )
        # Otherwise, predict disease and treatment
        answers = [a['answer'] for a in sessions[req.session_id]['answers']]
        full_description = "، ".join(answers)
        import torch
        inputs = tokenizer(full_description, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
            predicted_label = torch.argmax(outputs.logits, dim=1).item()
        disease_name = disease_metadata.get(str(predicted_label), {}).get("name", "مرض غير معروف")
        treatment = disease_metadata.get(str(predicted_label), {}).get("treatment", "لا يوجد علاج محدد.")
        db.close()
        del sessions[req.session_id]
        return QuestionResponse(
            session_id=req.session_id,
            question=f"نتيجة التشخيص: {disease_name}\nالعلاج المقترح: {treatment}",
            suggestions=[],
            is_final=True
        )
    except Exception as e:
        print(f"ERROR in process_answer: {str(e)}")
        return QuestionResponse(
            session_id=str(uuid4()),
            question="حدث خطأ أثناء معالجة إجابتك. لنبدأ من جديد. كيف يمكنني مساعدتك اليوم؟",
            suggestions=["أحتاج استشارة أمراض نباتية", "استشارة زراعية عامة"],
            is_final=False
        )


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
