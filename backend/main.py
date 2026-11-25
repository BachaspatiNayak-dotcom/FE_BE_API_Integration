from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from tables import Student
from schemas import StudentCreate, StudentResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# GET: Fetch all students
@app.get("/students/", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()


# POST: Add a new student
@app.post("/students/", response_model=StudentResponse)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):
    existing_student = db.query(Student).filter(
        Student.email == student.email
    ).first()

    if existing_student:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_student = Student(
        name=student.name,
        email=student.email,
        phone=student.phone,
        course=student.course
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# PUT: Update student
@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student: StudentCreate,
    db: Session = Depends(get_db)
):
    db_student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_email = db.query(Student).filter(
        Student.email == student.email,
        Student.id != student_id
    ).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_student.name = student.name
    db_student.email = student.email
    db_student.phone = student.phone
    db_student.course = student.course

    db.commit()
    db.refresh(db_student)

    return db_student


# DELETE: Delete student
@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    db_student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()

    return {"message": "Student deleted successfully"}
