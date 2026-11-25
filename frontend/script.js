const studentForm = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");

const API_URL = "http://127.0.0.1:8000/students/";

let students = [];

let editId = null; //to check whether we updating an existing data or adding a new data


// GET: Fetch students from FastAPI
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        students = await response.json(); //we filling the array with JS objects 

        displayStudents();

    } catch (error) {
        alert(error.message);
    }
}


// Display students in the table //this function handles both "all students" and filtered students search

function displayStudents(data = students) {
    tableBody.innerHTML = ""; //if we do not clear the data then while loading the script and calling displayStudents() we would create duplicate rows

    data.forEach(student => {
        const row = document.createElement("tr");

        [student.name, student.email, student.phone, student.course]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editStudent(student);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteStudent(student.id);

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// POST: Add student //PUT:update student

studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("mobile").value.trim(),
        course: document.getElementById("course").value
    };

    if (!/^\d{10}$/.test(student.phone)) {
        alert("Enter a valid 10-digit mobile number!");
        return;
    }

    try {
        const url = editId === null
            ? API_URL
            : `${API_URL}${editId}`;

        const method = editId === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });


        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Operation failed");
        }

        alert(editId === null
            ? "Student added successfully!"
            : "Student updated successfully!");

        editId = null;
        studentForm.reset();

        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
});


// Search students
function searchStudent() {
    const searchValue = document
        .getElementById("search")
        .value.toLowerCase();

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchValue)
    );

    displayStudents(filteredStudents);
}

// whenever user clicks edit we should that student's existing data in form

function editStudent(student) {
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("mobile").value = student.phone;
    document.getElementById("course").value = student.course;

    editId = student.id;
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to delete student");
        }

        alert("Student deleted successfully!");

        await fetchStudents();

    } catch (error) {
        alert(error.message);
    }
}

// Initial fetch when page loads
fetchStudents();
