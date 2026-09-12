import React, { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5001/api";

/* =========================================
   GRADE FUNCTION
========================================= */

function getGrade(marks) {
    const m = Number(marks);

    if (m >= 90) return "A+";
    if (m >= 80) return "A";
    if (m >= 70) return "B";
    if (m >= 60) return "C";
    if (m >= 50) return "D";
    return "F";
}

/* =========================================
   ATTENDANCE FUNCTION
========================================= */

function getAttendancePercentage(attended, total) {
    if (!total || total === 0) return 0;

    return ((Number(attended) / Number(total)) * 100).toFixed(1);
}

/* =========================================
   MAIN APP
========================================= */

function App() {
    /* =====================================
       LOGIN STATE
    ===================================== */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    /* =====================================
       ACCOUNT STATE
    ===================================== */

    const [showRegister, setShowRegister] = useState(false);

    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    /* =====================================
       FORGOT PASSWORD
    ===================================== */

    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    /* =====================================
       STUDENTS
    ===================================== */

    const [students, setStudents] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedDepartment, setSelectedDepartment] =
        useState("ALL");

    /* =====================================
       STUDENT FORM
    ===================================== */

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [studentName, setStudentName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");

    /* =====================================
       STUDENT PERFORMANCE
    ===================================== */

    const [selectedStudent, setSelectedStudent] =
        useState(null);

    const [performance, setPerformance] = useState([]);

    const [overallPerformance, setOverallPerformance] =
        useState(null);

    const [semesterPerformance, setSemesterPerformance] =
        useState([]);

    const [showOverall, setShowOverall] = useState(false);

    const [loadingPerformance, setLoadingPerformance] =
        useState(false);

    /* =====================================
       DEPARTMENTS
    ===================================== */

    const departments = [
        "AI & ML",
        "CSE",
        "AI & DS",
        "ECE",
        "IT"
    ];

    /* =====================================
       LOAD STUDENTS
    ===================================== */

    const loadStudents = async () => {
        try {
            const response = await fetch(
                `${API}/students`
            );

            const data = await response.json();

            if (response.ok) {
                setStudents(data);
            } else {
                alert(data.message || "Failed to load students");
            }
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend. Start node server.js"
            );
        }
    };

    /* =====================================
       INITIAL LOAD
    ===================================== */

    useEffect(() => {
        if (user) {
            loadStudents();
        }
    }, [user]);

    /* =====================================
       LOGIN
    ===================================== */

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            alert("Please enter email and password");
            return;
        }

        try {
            const response = await fetch(
                `${API}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Invalid email/username or password"
                );

                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setUser(data.user);

            setEmail("");
            setPassword("");
        } catch (error) {
            console.error("Login error:", error);

            alert(
                "Cannot connect to backend. Start server with node server.js"
            );
        }
    };

    /* =====================================
       LOGOUT
    ===================================== */

    const handleLogout = () => {
        localStorage.removeItem("user");

        setUser(null);

        setStudents([]);
        setSelectedStudent(null);
        setPerformance([]);
        setOverallPerformance(null);
        setSemesterPerformance([]);
    };

    /* =====================================
       REGISTER
    ===================================== */

    const handleRegister = async () => {
        if (
            !registerUsername.trim() ||
            !registerEmail.trim() ||
            !registerPassword
        ) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await fetch(
                `${API}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: registerUsername.trim(),
                        email: registerEmail.trim(),
                        password: registerPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Account creation failed"
                );

                return;
            }

            alert(
                "Account created successfully. Please login."
            );

            setRegisterUsername("");
            setRegisterEmail("");
            setRegisterPassword("");

            setShowRegister(false);
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend."
            );
        }
    };

    /* =====================================
       FORGOT PASSWORD
    ===================================== */

    const handleForgotPassword = async () => {
        if (!forgotEmail.trim() || !newPassword) {
            alert(
                "Please enter email and new password"
            );

            return;
        }

        try {
            const response = await fetch(
                `${API}/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: forgotEmail.trim(),
                        newPassword: newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Password reset failed"
                );

                return;
            }

            alert(
                "Password updated successfully. Please login."
            );

            setForgotEmail("");
            setNewPassword("");
            setShowForgot(false);
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend."
            );
        }
    };

    /* =====================================
       CLEAR STUDENT FORM
    ===================================== */

    const clearStudentForm = () => {
        setStudentName("");
        setRollNumber("");
        setStudentEmail("");
        setPhone("");
        setDepartment("");
        setYear("");

        setEditingId(null);
        setShowForm(false);
    };

    /* =====================================
       ADD STUDENT
    ===================================== */

    const handleAddStudent = async () => {
        if (
            !studentName.trim() ||
            !rollNumber.trim() ||
            !department ||
            !year
        ) {
            alert(
                "Please fill student name, roll number, department and year"
            );

            return;
        }

        try {
            const response = await fetch(
                `${API}/students`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        student_name: studentName.trim(),
                        roll_number: rollNumber.trim(),
                        email: studentEmail.trim(),
                        phone: phone.trim(),
                        department: department,
                        year: Number(year)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Student creation failed"
                );

                return;
            }

            alert("Student added successfully");

            clearStudentForm();

            loadStudents();
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend."
            );
        }
    };

    /* =====================================
       EDIT STUDENT
    ===================================== */

    const handleEditStudent = (student) => {
        setEditingId(student.id);

        setStudentName(
            student.student_name || ""
        );

        setRollNumber(
            student.roll_number || ""
        );

        setStudentEmail(
            student.email || ""
        );

        setPhone(
            student.phone || ""
        );

        setDepartment(
            student.department || ""
        );

        setYear(
            student.year || ""
        );

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    /* =====================================
       UPDATE STUDENT
    ===================================== */

    const handleUpdateStudent = async () => {
        if (
            !studentName.trim() ||
            !rollNumber.trim() ||
            !department ||
            !year
        ) {
            alert(
                "Please fill all required fields"
            );

            return;
        }

        try {
            const response = await fetch(
                `${API}/students/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        student_name: studentName.trim(),
                        roll_number: rollNumber.trim(),
                        email: studentEmail.trim(),
                        phone: phone.trim(),
                        department: department,
                        year: Number(year)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Student update failed"
                );

                return;
            }

            alert("Student updated successfully");

            clearStudentForm();

            loadStudents();
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend."
            );
        }
    };

    /* =====================================
       DELETE STUDENT
    ===================================== */

    const handleDeleteStudent = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Student deletion failed"
                );

                return;
            }

            alert("Student deleted successfully");

            if (
                selectedStudent &&
                selectedStudent.id === id
            ) {
                setSelectedStudent(null);
                setPerformance([]);
                setOverallPerformance(null);
                setSemesterPerformance([]);
            }

            loadStudents();
        } catch (error) {
            console.error(error);

            alert(
                "Cannot connect to backend."
            );
        }
    };

    /* =====================================
       VIEW STUDENT
    ===================================== */

    const handleViewStudent = async (student) => {
        setSelectedStudent(student);

        setPerformance([]);
        setOverallPerformance(null);
        setSemesterPerformance([]);

        setShowOverall(false);

        setLoadingPerformance(true);

        try {
            const response = await fetch(
                `${API}/performance/${student.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to load performance"
                );

                return;
            }

            setPerformance(data);
        } catch (error) {
            console.error(error);

            alert(
                "Cannot load student performance."
            );
        } finally {
            setLoadingPerformance(false);
        }

        setTimeout(() => {
            const element =
                document.getElementById(
                    "performance-section"
                );

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }, 200);
    };

    /* =====================================
       LOAD OVERALL PERFORMANCE
    ===================================== */

    const handleShowOverall = async () => {
        if (!selectedStudent) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/overall/${selectedStudent.id}`
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to load overall performance"
                );

                return;
            }

            setOverallPerformance(data);

            setShowOverall(true);
        } catch (error) {
            console.error(error);

            alert(
                "Cannot load overall performance."
            );
        }

        try {
            const response = await fetch(
                `${API}/semester-performance/${selectedStudent.id}`
            );

            const data = await response.json();

            if (response.ok) {
                setSemesterPerformance(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    /* =====================================
       FILTER STUDENTS
    ===================================== */

    const filteredStudents = students.filter(
        (student) => {
            const searchText =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                student.student_name
                    .toLowerCase()
                    .includes(searchText) ||
                student.roll_number
                    .toLowerCase()
                    .includes(searchText) ||
                (student.department || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesDepartment =
                selectedDepartment === "ALL" ||
                student.department ===
                    selectedDepartment;

            return (
                matchesSearch &&
                matchesDepartment
            );
        }
    );

    /* =====================================
       LOGIN PAGE
    ===================================== */

    if (!user) {
        /* =================================
           FORGOT PASSWORD
        ================================= */

        if (showForgot) {
            return (
                <div className="login-page">

                    <div className="login-container">

                        <div className="login-top">

                            <div className="login-logo">
                                SA
                            </div>

                            <h1>
                                Student Academic
                                Performance
                            </h1>

                            <p>
                                Manage student academic
                                information, marks,
                                attendance and performance
                                easily.
                            </p>

                        </div>

                        <div className="login-bottom">

                            <h2>
                                Reset Password
                            </h2>

                            <p className="login-subtitle">
                                Create a new password
                            </p>

                            <div className="login-form">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) =>
                                        setForgotEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                />

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                />

                                <button
                                    className="login-button"
                                    onClick={
                                        handleForgotPassword
                                    }
                                >
                                    Reset Password
                                </button>

                                <p className="account-text">

                                    Remember your password?

                                    <button
                                        className="account-link"
                                        onClick={() =>
                                            setShowForgot(
                                                false
                                            )
                                        }
                                    >
                                        Sign In
                                    </button>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            );
        }

        /* =================================
           REGISTER PAGE
        ================================= */

        if (showRegister) {
            return (
                <div className="login-page">

                    <div className="login-container">

                        <div className="login-top">

                            <div className="login-logo">
                                SA
                            </div>

                            <h1>
                                Start your journey
                                with us
                            </h1>

                            <p>
                                Create your account to
                                manage student academic
                                performance.
                            </p>

                        </div>

                        <div className="login-bottom">

                            <h2>
                                Create Account
                            </h2>

                            <p className="login-subtitle">
                                Register a new account
                            </p>

                            <div className="login-form">

                                <label>
                                    Username
                                </label>

                                <input
                                    type="text"
                                    value={
                                        registerUsername
                                    }
                                    onChange={(e) =>
                                        setRegisterUsername(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter username"
                                />

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        registerEmail
                                    }
                                    onChange={(e) =>
                                        setRegisterEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                />

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        registerPassword
                                    }
                                    onChange={(e) =>
                                        setRegisterPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Create password"
                                />

                                <button
                                    className="login-button"
                                    onClick={
                                        handleRegister
                                    }
                                >
                                    Create Account
                                </button>

                                <p className="account-text">

                                    Already have an account?

                                    <button
                                        className="account-link"
                                        onClick={() =>
                                            setShowRegister(
                                                false
                                            )
                                        }
                                    >
                                        Sign In
                                    </button>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            );
        }

        /* =================================
           LOGIN PAGE
        ================================= */

        return (
            <div className="login-page">

                <div className="login-container">

                    <div className="login-top">

                        <div className="login-logo">
                            SA
                        </div>

                        <h1>
                            Start your journey
                            with us
                        </h1>

                        <p>
                            Student Academic Performance
                            System helps you manage
                            students, marks, attendance
                            and academic performance.
                        </p>

                    </div>

                    <div className="login-bottom">

                        <h2>
                            Welcome back
                        </h2>

                        <p className="login-subtitle">
                            Sign in to continue
                        </p>

                        <div className="login-form">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your email"
                            />

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your password"
                            />

                            <div className="forgot-password">

                                <button
                                    onClick={() =>
                                        setShowForgot(
                                            true
                                        )
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>

                            <button
                                className="login-button"
                                onClick={handleLogin}
                            >
                                Sign In
                            </button>

                            <div className="login-divider">
                                OR
                            </div>

                            <button
                                className="email-button"
                                onClick={() => {
                                    if (
                                        email.trim()
                                    ) {
                                        window.location.href =
                                            `mailto:${email.trim()}`;
                                    } else {
                                        alert(
                                            "Enter your email first"
                                        );
                                    }
                                }}
                            >
                                Continue with Email
                            </button>

                            <p className="account-text">

                                Don't have an account?

                                <button
                                    className="account-link"
                                    onClick={() =>
                                        setShowRegister(
                                            true
                                        )
                                    }
                                >
                                    Create Account
                                </button>

                            </p>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    /* =====================================
       DASHBOARD
    ===================================== */

    return (
        <div>

            {/* =================================
                HEADER
            ================================= */}

            <header className="header">

                <h1>
                    Student Academic Performance
                </h1>

                <div className="header-user">

                    <span>
                        Welcome,{" "}
                        {user.username}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* =================================
                MAIN
            ================================= */}

            <main className="main-container">

                <h1 className="dashboard-title">
                    Dashboard
                </h1>

                <p className="dashboard-subtitle">
                    Manage students and view academic
                    performance
                </p>

                {/* =================================
                    DEPARTMENT CARDS
                ================================= */}

                <div className="department-cards">

                    {departments.map(
                        (dept) => {

                            const count =
                                students.filter(
                                    (student) =>
                                        student.department ===
                                        dept
                                ).length;

                            return (
                                <div
                                    className="department-card"
                                    key={dept}
                                    onClick={() => {
                                        setSelectedDepartment(
                                            dept
                                        );
                                    }}
                                    style={{
                                        cursor: "pointer"
                                    }}
                                >

                                    <h3>
                                        {dept}
                                    </h3>

                                    <p>
                                        {count} student
                                        {count !== 1
                                            ? "s"
                                            : ""}
                                    </p>

                                </div>
                            );
                        }
                    )}

                </div>

                {/* =================================
                    ACTION BAR
                ================================= */}

                <div className="action-bar">

                    <input
                        className="search-input"
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search by student name, roll number or department"
                    />

                    <button
                        className="action-button"
                        onClick={() => {
                            setSelectedDepartment(
                                "ALL"
                            );

                            setSearch("");
                        }}
                    >
                        All Students
                    </button>

                    <button
                        className="action-button"
                        onClick={() => {
                            clearStudentForm();

                            setShowForm(true);

                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });
                        }}
                    >
                        + Add Student
                    </button>

                </div>

                {/* =================================
                    ADD / UPDATE FORM
                ================================= */}

                {showForm && (
                    <div className="student-form-card">

                        <h2>
                            {editingId
                                ? "Update Student"
                                : "Add Student"}
                        </h2>

                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    Student Name *
                                </label>

                                <input
                                    type="text"
                                    value={
                                        studentName
                                    }
                                    onChange={(e) =>
                                        setStudentName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter student name"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Roll Number *
                                </label>

                                <input
                                    type="text"
                                    value={
                                        rollNumber
                                    }
                                    onChange={(e) =>
                                        setRollNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter roll number"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        studentEmail
                                    }
                                    onChange={(e) =>
                                        setStudentEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter student email"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter phone number"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Department *
                                </label>

                                <select
                                    value={
                                        department
                                    }
                                    onChange={(e) =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Department
                                    </option>

                                    {departments.map(
                                        (dept) => (
                                            <option
                                                key={dept}
                                                value={dept}
                                            >
                                                {dept}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="form-group">

                                <label>
                                    Year *
                                </label>

                                <select
                                    value={year}
                                    onChange={(e) =>
                                        setYear(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Year
                                    </option>

                                    <option value="1">
                                        1st Year
                                    </option>

                                    <option value="2">
                                        2nd Year
                                    </option>

                                    <option value="3">
                                        3rd Year
                                    </option>

                                    <option value="4">
                                        4th Year
                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="form-buttons">

                            <button
                                className="save-button"
                                onClick={
                                    editingId
                                        ? handleUpdateStudent
                                        : handleAddStudent
                                }
                            >
                                {editingId
                                    ? "Update Student"
                                    : "Add Student"}
                            </button>

                            <button
                                className="cancel-button"
                                onClick={
                                    clearStudentForm
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>
                )}

                {/* =================================
                    STUDENT LIST
                ================================= */}

                <div className="student-list">

                    <h2>
                        Student List
                    </h2>

                    {filteredStudents.length ===
                    0 ? (
                        <div className="empty-message">
                            No students found.
                        </div>
                    ) : (
                        <div className="table-container">

                            <table className="student-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Student Name
                                        </th>

                                        <th>
                                            Roll Number
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Year
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredStudents.map(
                                        (student) => (
                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        student.id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.student_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.roll_number
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.department
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.year
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.email ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            handleViewStudent(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="edit-button"
                                                        onClick={() =>
                                                            handleEditStudent(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDeleteStudent(
                                                                student.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

                {/* =================================
                    STUDENT PROFILE
                ================================= */}

                {selectedStudent && (
                    <div
                        className="performance-section"
                        id="performance-section"
                    >

                        <div className="student-profile">

                            <h2>
                                Student Profile
                            </h2>

                            <div className="profile-grid">

                                <div className="profile-item">

                                    <span>
                                        Student Name
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.student_name
                                        }
                                    </strong>

                                </div>

                                <div className="profile-item">

                                    <span>
                                        Roll Number
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.roll_number
                                        }
                                    </strong>

                                </div>

                                <div className="profile-item">

                                    <span>
                                        Department
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.department
                                        }
                                    </strong>

                                </div>

                                <div className="profile-item">

                                    <span>
                                        Year
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.year
                                        }
                                    </strong>

                                </div>

                                <div className="profile-item">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.email ||
                                            "-"
                                        }
                                    </strong>

                                </div>

                                <div className="profile-item">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {
                                            selectedStudent.phone ||
                                            "-"
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* =================================
                            SHOW OVERALL BUTTON
                        ================================= */}

                        <button
                            className="overall-button"
                            onClick={
                                handleShowOverall
                            }
                        >
                            SHOW OVERALL PERFORMANCE
                        </button>

                        {/* =================================
                            PERFORMANCE
                        ================================= */}

                        {loadingPerformance ? (

                            <div className="loading">
                                Loading performance...
                            </div>

                        ) : performance.length ===
                          0 ? (

                            <div className="empty-message">
                                No performance data found.
                            </div>

                        ) : (

                            <PerformanceView
                                performance={
                                    performance
                                }
                            />

                        )}

                        {/* =================================
                            OVERALL PERFORMANCE
                        ================================= */}

                        {showOverall &&
                            overallPerformance && (

                                <OverallPerformance
                                    overall={
                                        overallPerformance
                                    }
                                    semesters={
                                        semesterPerformance
                                    }
                                />

                            )}

                    </div>
                )}

            </main>

        </div>
    );
}

/* =========================================
   PERFORMANCE VIEW
========================================= */

function PerformanceView({
    performance
}) {

    const semesters = [
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];

    return (
        <div>

            {semesters.map(
                (semester) => {

                    const semesterData =
                        performance.filter(
                            (item) =>
                                Number(
                                    item.semester
                                ) === semester
                        );

                    if (
                        semesterData.length ===
                        0
                    ) {
                        return null;
                    }

                    const theory =
                        semesterData.filter(
                            (item) =>
                                (
                                    item.subject_type ||
                                    "THEORY"
                                ).toUpperCase() ===
                                "THEORY"
                        );

                    const labs =
                        semesterData.filter(
                            (item) =>
                                (
                                    item.subject_type ||
                                    ""
                                ).toUpperCase() ===
                                "LAB"
                        );

                    return (
                        <div
                            className="semester-section"
                            key={semester}
                        >

                            <div className="semester-title">
                                Semester {semester}
                            </div>

                            {/* =========================
                                THEORY
                            ========================= */}

                            {theory.length >
                                0 && (

                                <div className="subject-category">

                                    <h3>
                                        THEORY SUBJECTS
                                    </h3>

                                    <div className="table-container">

                                        <table className="performance-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Subject Code
                                                    </th>

                                                    <th>
                                                        Subject Name
                                                    </th>

                                                    <th>
                                                        Marks
                                                    </th>

                                                    <th>
                                                        Grade
                                                    </th>

                                                    <th>
                                                        Total Classes
                                                    </th>

                                                    <th>
                                                        Attended
                                                    </th>

                                                    <th>
                                                        Attendance %
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {theory.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <PerformanceRow
                                                            item={
                                                                item
                                                            }
                                                            key={
                                                                item.id ||
                                                                index
                                                            }
                                                        />

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            )}

                            {/* =========================
                                LAB
                            ========================= */}

                            {labs.length >
                                0 && (

                                <div className="subject-category">

                                    <h3>
                                        LAB SUBJECTS
                                    </h3>

                                    <div className="table-container">

                                        <table className="performance-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Subject Code
                                                    </th>

                                                    <th>
                                                        Subject Name
                                                    </th>

                                                    <th>
                                                        Marks
                                                    </th>

                                                    <th>
                                                        Grade
                                                    </th>

                                                    <th>
                                                        Total Classes
                                                    </th>

                                                    <th>
                                                        Attended
                                                    </th>

                                                    <th>
                                                        Attendance %
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {labs.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <PerformanceRow
                                                            item={
                                                                item
                                                            }
                                                            key={
                                                                item.id ||
                                                                index
                                                            }
                                                        />

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            )}

                            {/* =========================
                                SEMESTER SUMMARY
                            ========================= */}

                            <SemesterSummary
                                data={
                                    semesterData
                                }
                            />

                        </div>
                    );
                }
            )}

        </div>
    );
}

/* =========================================
   PERFORMANCE ROW
========================================= */

function PerformanceRow({
    item
}) {

    const marks =
        Number(item.marks || 0);

    const totalClasses =
        Number(
            item.total_classes || 0
        );

    const attended =
        Number(
            item.attended_classes || 0
        );

    const attendance =
        getAttendancePercentage(
            attended,
            totalClasses
        );

    let attendanceClass =
        "attendance-good";

    if (Number(attendance) < 75) {
        attendanceClass =
            "attendance-low";
    } else if (
        Number(attendance) < 85
    ) {
        attendanceClass =
            "attendance-medium";
    }

    return (
        <tr>

            <td>
                {item.subject_code ||
                    "-"}
            </td>

            <td>
                {item.subject_name ||
                    "-"}
            </td>

            <td>
                {marks}
            </td>

            <td>

                <span className="grade">
                    {getGrade(marks)}
                </span>

            </td>

            <td>
                {totalClasses ||
                    "-"}
            </td>

            <td>
                {attended ||
                    "-"}
            </td>

            <td
                className={
                    attendanceClass
                }
            >
                {totalClasses
                    ? `${attendance}%`
                    : "-"}
            </td>

        </tr>
    );
}

/* =========================================
   SEMESTER SUMMARY
========================================= */

function SemesterSummary({
    data
}) {

    if (!data || data.length === 0) {
        return null;
    }

    const marksList =
        data.map(
            (item) =>
                Number(
                    item.marks || 0
                )
        );

    const totalMarks =
        marksList.reduce(
            (sum, value) =>
                sum + value,
            0
        );

    const averageMarks =
        totalMarks /
        marksList.length;

    let totalClasses = 0;
    let attendedClasses = 0;

    data.forEach(
        (item) => {

            totalClasses +=
                Number(
                    item.total_classes ||
                    0
                );

            attendedClasses +=
                Number(
                    item.attended_classes ||
                    0
                );
        }
    );

    const attendance =
        getAttendancePercentage(
            attendedClasses,
            totalClasses
        );

    return (
        <div className="semester-summary">

            <div className="summary-card">

                <span>
                    Subjects
                </span>

                <strong>
                    {data.length}
                </strong>

            </div>

            <div className="summary-card">

                <span>
                    Total Marks
                </span>

                <strong>
                    {totalMarks}
                </strong>

            </div>

            <div className="summary-card">

                <span>
                    Average
                </span>

                <strong>
                    {averageMarks.toFixed(
                        2
                    )}
                </strong>

            </div>

            <div className="summary-card">

                <span>
                    Attendance
                </span>

                <strong>
                    {totalClasses
                        ? `${attendance}%`
                        : "-"}
                </strong>

            </div>

        </div>
    );
}

/* =========================================
   OVERALL PERFORMANCE
========================================= */

function OverallPerformance({
    overall,
    semesters
}) {

    const totalMarks =
        Number(
            overall.total_marks ||
            overall.totalMarks ||
            0
        );

    const average =
        Number(
            overall.average_marks ||
            overall.averageMarks ||
            overall.average ||
            0
        );

    const totalSubjects =
        Number(
            overall.total_subjects ||
            overall.totalSubjects ||
            0
        );

    const attendance =
        Number(
            overall.attendance_percentage ||
            overall.attendancePercentage ||
            overall.attendance ||
            0
        );

    return (
        <div className="overall-section">

            <h2>
                Overall Performance
            </h2>

            <div className="overall-cards">

                <div className="overall-card">

                    <span>
                        Total Subjects
                    </span>

                    <strong>
                        {totalSubjects}
                    </strong>

                </div>

                <div className="overall-card">

                    <span>
                        Total Marks
                    </span>

                    <strong>
                        {totalMarks}
                    </strong>

                </div>

                <div className="overall-card">

                    <span>
                        Average Marks
                    </span>

                    <strong>
                        {average.toFixed(2)}
                    </strong>

                </div>

                <div className="overall-card">

                    <span>
                        Attendance
                    </span>

                    <strong>
                        {attendance
                            ? `${attendance.toFixed(
                                  1
                              )}%`
                            : "0%"}
                    </strong>

                </div>

            </div>

            {/* =================================
                SEMESTER WISE TABLE
            ================================= */}

            {semesters &&
                semesters.length > 0 && (

                    <div className="table-container">

                        <table className="semester-performance-table">

                            <thead>

                                <tr>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Subjects
                                    </th>

                                    <th>
                                        Total Marks
                                    </th>

                                    <th>
                                        Average
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {semesters.map(
                                    (
                                        semester,
                                        index
                                    ) => {

                                        const sem =
                                            semester.semester ||
                                            semester.sem ||
                                            index +
                                                1;

                                        const subjects =
                                            Number(
                                                semester.total_subjects ||
                                                semester.subject_count ||
                                                semester.subjects ||
                                                0
                                            );

                                        const marks =
                                            Number(
                                                semester.total_marks ||
                                                semester.totalMarks ||
                                                0
                                            );

                                        const avg =
                                            Number(
                                                semester.average_marks ||
                                                semester.averageMarks ||
                                                semester.average ||
                                                0
                                            );

                                        const att =
                                            Number(
                                                semester.attendance_percentage ||
                                                semester.attendancePercentage ||
                                                semester.attendance ||
                                                0
                                            );

                                        return (
                                            <tr
                                                key={
                                                    sem
                                                }
                                            >

                                                <td>
                                                    Semester{" "}
                                                    {
                                                        sem
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        subjects
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        marks
                                                    }
                                                </td>

                                                <td>
                                                    {avg.toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>
                                                    {att
                                                        ? `${att.toFixed(
                                                              1
                                                          )}%`
                                                        : "0%"}
                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

        </div>
    );
}

export default App;