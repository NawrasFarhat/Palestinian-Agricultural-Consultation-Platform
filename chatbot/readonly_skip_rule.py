from sqlalchemy import Column, Integer, Text
from database import Base

class SkipRule(Base):
    __tablename__ = "skip_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_question_text = Column(Text, nullable=False)
    trigger_answer = Column(Text, nullable=False)
    skip_child_text = Column(Text, nullable=False)