import os
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from database import engine, Base, SessionLocal
import readonly_question
import readonly_skip_rule

def init_database():
    print("====== DATABASE DEBUG INFORMATION ======")
    print(f"DATABASE_URL: {os.environ.get('DATABASE_URL', 'Not set')}")
    print(f"DB_HOST: {os.environ.get('DB_HOST', 'Not set')}")
    print(f"DB_NAME: {os.environ.get('DB_NAME', 'Not set')}")
    print(f"DB_USER: {os.environ.get('DB_USER', 'Not set')}")
    
    # Try to inspect the database
    try:
        inspector = inspect(engine)
        print("\nDatabase tables found:")
        for table_name in inspector.get_table_names():
            print(f"- {table_name}")
            # Get columns for each table
            print("  Columns:")
            for column in inspector.get_columns(table_name):
                print(f"  - {column['name']} ({column['type']})")
    except SQLAlchemyError as e:
        print(f"Error inspecting database: {str(e)}")
    
    # Check if our target table exists
    db = SessionLocal()
    try:
        result = db.execute(text("SHOW TABLES LIKE 'general_questions'")).fetchall()
        if result:
            print("\nTable 'general_questions' exists!")
            # Show the actual schema
            schema = db.execute(text("DESCRIBE general_questions")).fetchall()
            print("Schema for general_questions:")
            for column in schema:
                print(f"- {column[0]}: {column[1]}")
        else:
            print("\nTable 'general_questions' does NOT exist!")
    except SQLAlchemyError as e:
        print(f"Error querying table information: {str(e)}")
    finally:
        db.close()
    
    print("Creating database tables if they don't exist...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
    except SQLAlchemyError as e:
        print(f"Error creating tables: {str(e)}")

if __name__ == "__main__":
    init_database()
