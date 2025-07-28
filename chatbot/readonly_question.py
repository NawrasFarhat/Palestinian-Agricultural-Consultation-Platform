from sqlalchemy import Column, Integer, Text
from database import Base

class GeneralQuestion(Base):
    __tablename__ = "general_questions"

    # Use question_id as the primary key since that's what exists in the DB
    question_id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    possible_answers = Column(Text, nullable=True)
    
    # Define next_question_id property for compatibility with existing code
    @property
    def next_question_id(self):
        # This is a simple implementation - in reality you might want to query
        # the database to find the next question based on the current question_id
        return self.question_id + 1
