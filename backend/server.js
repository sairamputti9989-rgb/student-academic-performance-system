require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

const PORT = process.env.PORT || 5001;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Student Academic Performance System API is running"
    });
});

// =====================================================
// TEST DATABASE
// =====================================================

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });

    } catch (error) {
        console.error("DATABASE TEST ERROR:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message || String(error)
        });
    }
});

// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await db.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
               OR username = $2
            `,
            [
                email.trim(),
                username.trim()
            ]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const result = await db.query(
            `
            INSERT INTO users
            (
                username,
                email,
                password
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING
                id,
                username,
                email
            `,
            [
                username.trim(),
                email.trim(),
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "Account created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {
    try {
        const {
            email,
            username,
            password
        } = req.body;

        const loginValue = (
            email || username || ""
        ).trim();

        if (!loginValue || !password) {
            return res.status(400).json({
                message: "Email/username and password are required"
            });
        }

        const result = await db.query(
            `
            SELECT
                id,
                username,
                email,
                password
            FROM users
            WHERE email = $1
               OR username = $1
            LIMIT 1
            `,
            [loginValue]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email/username or password"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email/username or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

// =====================================================
// FORGOT PASSWORD
// =====================================================

app.post("/api/forgot-password", async (req, res) => {
    try {
        const {
            email,
            newPassword
        } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        const result = await db.query(
            `
            UPDATE users
            SET password = $1
            WHERE email = $2
            RETURNING
                id,
                username,
                email
            `,
            [
                hashedPassword,
                email.trim()
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        res.json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Failed to update password",
            error: error.message
        });
    }
});

// =====================================================
// GET ALL STUDENTS
// =====================================================

app.get("/api/students", async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                id,
                student_name,
                roll_number,
                email,
                phone,
                department,
                year
            FROM students
            ORDER BY id
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Students error:", error);

        res.status(500).json({
            message: "Failed to load students",
            error: error.message
        });
    }
});

// =====================================================
// GET SINGLE STUDENT
// =====================================================

app.get("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            SELECT
                id,
                student_name,
                roll_number,
                email,
                phone,
                department,
                year
            FROM students
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Student error:", error);

        res.status(500).json({
            message: "Failed to load student",
            error: error.message
        });
    }
});

// =====================================================
// ADD STUDENT
// =====================================================

app.post("/api/students", async (req, res) => {
    try {
        const {
            student_name,
            roll_number,
            email,
            phone,
            department,
            year
        } = req.body;

        if (
            !student_name ||
            !roll_number ||
            !department ||
            !year
        ) {
            return res.status(400).json({
                message: "Required student fields are missing"
            });
        }

        const result = await db.query(
            `
            INSERT INTO students
            (
                student_name,
                roll_number,
                email,
                phone,
                department,
                year
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            RETURNING *
            `,
            [
                student_name.trim(),
                roll_number.trim(),
                email ? email.trim() : null,
                phone ? phone.trim() : null,
                department.trim(),
                year
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Add student error:", error);

        res.status(500).json({
            message: "Failed to add student",
            error: error.message
        });
    }
});

// =====================================================
// UPDATE STUDENT
// =====================================================

app.put("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            student_name,
            roll_number,
            email,
            phone,
            department,
            year
        } = req.body;

        const result = await db.query(
            `
            UPDATE students
            SET
                student_name = $1,
                roll_number = $2,
                email = $3,
                phone = $4,
                department = $5,
                year = $6
            WHERE id = $7
            RETURNING *
            `,
            [
                student_name.trim(),
                roll_number.trim(),
                email ? email.trim() : null,
                phone ? phone.trim() : null,
                department.trim(),
                year,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update student error:", error);

        res.status(500).json({
            message: "Failed to update student",
            error: error.message
        });
    }
});

// =====================================================
// DELETE STUDENT
// =====================================================

app.delete("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            DELETE FROM students
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete student error:", error);

        res.status(500).json({
            message: "Failed to delete student",
            error: error.message
        });
    }
});

// =====================================================
// GET ALL SUBJECTS
// =====================================================

app.get("/api/subjects", async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                id,
                subject_name,
                subject_code,
                department,
                semester,
                subject_type
            FROM subjects
            ORDER BY
                department,
                semester,
                id
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Subjects error:", error);

        res.status(500).json({
            message: "Failed to load subjects",
            error: error.message
        });
    }
});

// =====================================================
// GET ALL MARKS
// =====================================================

app.get("/api/marks", async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                m.id,
                m.student_id,
                m.subject_id,
                m.marks,
                m.semester,
                s.student_name,
                s.roll_number,
                sub.subject_name,
                sub.subject_code,
                sub.subject_type
            FROM marks m
            JOIN students s
                ON s.id = m.student_id
            JOIN subjects sub
                ON sub.id = m.subject_id
            ORDER BY
                m.student_id,
                m.semester,
                m.subject_id
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Marks error:", error);

        res.status(500).json({
            message: "Failed to load marks",
            error: error.message
        });
    }
});

// =====================================================
// GET ALL ATTENDANCE
// =====================================================

app.get("/api/attendance", async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                a.id,
                a.student_id,
                a.subject_id,
                a.total_classes,
                a.attended_classes,
                a.semester,
                s.student_name,
                s.roll_number,
                sub.subject_name,
                sub.subject_code,
                sub.subject_type
            FROM attendance a
            JOIN students s
                ON s.id = a.student_id
            JOIN subjects sub
                ON sub.id = a.subject_id
            ORDER BY
                a.student_id,
                a.semester,
                a.subject_id
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Attendance error:", error);

        res.status(500).json({
            message: "Failed to load attendance",
            error: error.message
        });
    }
});

// =====================================================
// GET STUDENT PERFORMANCE
// ONE SUBJECT = ONE ROW
// ALL 7 SEMESTERS
// =====================================================

app.get("/api/performance/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const studentResult = await db.query(
            `
            SELECT
                id,
                student_name,
                roll_number,
                department
            FROM students
            WHERE id = $1
            `,
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const student = studentResult.rows[0];

        const result = await db.query(
            `
            SELECT
                sub.id AS subject_id,
                sub.subject_name,
                sub.subject_code,
                sub.subject_type,
                sub.semester,

                COALESCE(
                    MAX(m.marks),
                    0
                ) AS marks,

                COALESCE(
                    MAX(a.total_classes),
                    0
                ) AS total_classes,

                COALESCE(
                    MAX(a.attended_classes),
                    0
                ) AS attended_classes

            FROM subjects sub

            LEFT JOIN marks m
                ON m.subject_id = sub.id
                AND m.student_id = $1
                AND m.semester = sub.semester

            LEFT JOIN attendance a
                ON a.subject_id = sub.id
                AND a.student_id = $1
                AND a.semester = sub.semester

            WHERE TRIM(UPPER(sub.department))
                =
                TRIM(UPPER($2))

            GROUP BY
                sub.id,
                sub.subject_name,
                sub.subject_code,
                sub.subject_type,
                sub.semester

            ORDER BY
                sub.semester ASC,
                sub.id ASC
            `,
            [
                studentId,
                student.department
            ]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Performance error:", error);

        res.status(500).json({
            message: "Failed to load performance",
            error: error.message
        });
    }
});

// =====================================================
// GET OVERALL PERFORMANCE
// =====================================================

app.get("/api/overall/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await db.query(
            `
            WITH mark_data AS (
                SELECT
                    student_id,
                    subject_id,
                    semester,
                    MAX(marks) AS marks
                FROM marks
                WHERE student_id = $1
                GROUP BY
                    student_id,
                    subject_id,
                    semester
            ),

            attendance_data AS (
                SELECT
                    student_id,
                    subject_id,
                    semester,
                    MAX(total_classes) AS total_classes,
                    MAX(attended_classes) AS attended_classes
                FROM attendance
                WHERE student_id = $1
                GROUP BY
                    student_id,
                    subject_id,
                    semester
            )

            SELECT

                COUNT(
                    DISTINCT sub.id
                ) AS total_subjects,

                COALESCE(
                    SUM(md.marks),
                    0
                ) AS total_marks,

                COALESCE(
                    ROUND(
                        AVG(md.marks),
                        2
                    ),
                    0
                ) AS average_marks,

                COALESCE(
                    ROUND(
                        (
                            SUM(
                                COALESCE(
                                    ad.attended_classes,
                                    0
                                )
                            )::NUMERIC
                            /
                            NULLIF(
                                SUM(
                                    COALESCE(
                                        ad.total_classes,
                                        0
                                    )
                                ),
                                0
                            )
                        ) * 100,
                        2
                    ),
                    0
                ) AS attendance_percentage

            FROM students s

            JOIN subjects sub
                ON TRIM(
                    UPPER(s.department)
                )
                =
                TRIM(
                    UPPER(sub.department)
                )

            LEFT JOIN mark_data md
                ON md.student_id = s.id
                AND md.subject_id = sub.id
                AND md.semester = sub.semester

            LEFT JOIN attendance_data ad
                ON ad.student_id = s.id
                AND ad.subject_id = sub.id
                AND ad.semester = sub.semester

            WHERE s.id = $1
            `,
            [studentId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(
            "Overall performance error:",
            error
        );

        res.status(500).json({
            message: "Failed to load overall performance",
            error: error.message
        });
    }
});

// =====================================================
// GET SEMESTER-WISE PERFORMANCE
// =====================================================

app.get(
    "/api/semester-performance/:studentId",
    async (req, res) => {
        try {
            const { studentId } = req.params;

            const result = await db.query(
                `
                WITH mark_data AS (
                    SELECT
                        student_id,
                        subject_id,
                        semester,
                        MAX(marks) AS marks
                    FROM marks
                    WHERE student_id = $1
                    GROUP BY
                        student_id,
                        subject_id,
                        semester
                ),

                attendance_data AS (
                    SELECT
                        student_id,
                        subject_id,
                        semester,
                        MAX(total_classes) AS total_classes,
                        MAX(attended_classes) AS attended_classes
                    FROM attendance
                    WHERE student_id = $1
                    GROUP BY
                        student_id,
                        subject_id,
                        semester
                )

                SELECT

                    sub.semester,

                    COUNT(
                        DISTINCT sub.id
                    ) AS total_subjects,

                    COALESCE(
                        SUM(md.marks),
                        0
                    ) AS total_marks,

                    COALESCE(
                        ROUND(
                            AVG(md.marks),
                            2
                        ),
                        0
                    ) AS average_marks,

                    COALESCE(
                        ROUND(
                            (
                                SUM(
                                    COALESCE(
                                        ad.attended_classes,
                                        0
                                    )
                                )::NUMERIC
                                /
                                NULLIF(
                                    SUM(
                                        COALESCE(
                                            ad.total_classes,
                                            0
                                        )
                                    ),
                                    0
                                )
                            ) * 100,
                            2
                        ),
                        0
                    ) AS attendance_percentage

                FROM students s

                JOIN subjects sub
                    ON TRIM(
                        UPPER(s.department)
                    )
                    =
                    TRIM(
                        UPPER(sub.department)
                    )

                LEFT JOIN mark_data md
                    ON md.student_id = s.id
                    AND md.subject_id = sub.id
                    AND md.semester = sub.semester

                LEFT JOIN attendance_data ad
                    ON ad.student_id = s.id
                    AND ad.subject_id = sub.id
                    AND ad.semester = sub.semester

                WHERE s.id = $1

                GROUP BY
                    sub.semester

                ORDER BY
                    sub.semester
                `,
                [studentId]
            );

            res.json(result.rows);

        } catch (error) {
            console.error(
                "Semester performance error:",
                error
            );

            res.status(500).json({
                message: "Failed to load semester performance",
                error: error.message
            });
        }
    }
);

// =====================================================
// DASHBOARD
// =====================================================

app.get("/api/dashboard", async (req, res) => {
    try {

        const students = await db.query(
            `
            SELECT
                COUNT(*) AS total_students
            FROM students
            `
        );

        const subjects = await db.query(
            `
            SELECT
                COUNT(*) AS total_subjects
            FROM subjects
            `
        );

        const marks = await db.query(
            `
            SELECT
                COUNT(*) AS total_marks
            FROM marks
            `
        );

        const attendance = await db.query(
            `
            SELECT
                COUNT(*) AS total_attendance
            FROM attendance
            `
        );

        res.json({

            total_students:
                Number(
                    students.rows[0].total_students
                ),

            total_subjects:
                Number(
                    subjects.rows[0].total_subjects
                ),

            total_marks:
                Number(
                    marks.rows[0].total_marks
                ),

            total_attendance:
                Number(
                    attendance.rows[0].total_attendance
                )

        });

    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            message: "Failed to load dashboard",
            error: error.message
        });
    }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on port ${PORT}`
    );
});