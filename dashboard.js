
const student = JSON.parse(
    localStorage.getItem("loggedInStudent")
);


// CHECK LOGIN

if (!student) {
    window.location.href = "index.html";
    throw new Error("Please log in first.");
}

document.getElementById("student-name").textContent =
    "Welcome, " + student.name + "!";
    

// LOGOUT

document.getElementById("logout-button").addEventListener("click", function () {

    localStorage.removeItem("loggedInStudent");

    window.location.href = "index.html";

});


// TIMETABLE ELEMENTS

const uploadInput = document.getElementById("timetable-upload");

const preview = document.getElementById("timetable-preview");

const removeButton = document.getElementById("remove-timetable");

const uploadMessage = document.getElementById("upload-message");
// TIMETABLE EXTRACTION ELEMENTS
const extractionBox = document.getElementById("timetable-extraction");
const extractionMessage = document.getElementById("extraction-message");
const extractedSubjectsContainer = document.getElementById("extracted-subjects");
const confirmSubjectsButton = document.getElementById("confirm-subjects");

let detectedSubjects = [];


// EACH STUDENT GETS A DIFFERENT STORAGE KEY

const storageKey = student
    ? "timetable_" + student.email
    : null;


// SHOW MESSAGE

function showMessage(text) {

    uploadMessage.textContent = text;

}


// DISPLAY TIMETABLE

function displayTimetable(fileData, fileType, fileName) {

    preview.replaceChildren();


    if (fileType === "application/pdf") {

        const pdf = document.createElement("iframe");

        pdf.src = fileData;

        pdf.title = "My timetable";

        preview.appendChild(pdf);

    } else {

        const image = document.createElement("img");

        image.src = fileData;

        image.alt = "My uploaded timetable";

        preview.appendChild(image);

    }


    const downloadLink = document.createElement("a");

    downloadLink.href = fileData;

    downloadLink.download = fileName;

    downloadLink.textContent = "Open or download timetable";


    preview.appendChild(downloadLink);


    removeButton.classList.remove("hidden");

}


// UPLOAD TIMETABLE

uploadInput.addEventListener("change", function () {

    const file = uploadInput.files[0];


    if (!file) {

        return;

    }


    const allowedTypes = [

        "application/pdf",
        "image/jpeg",
        "image/png"

    ];


    if (!allowedTypes.includes(file.type)) {

        showMessage("Please upload a PDF, JPG or PNG file.");

        uploadInput.value = "";

        return;

    }


    if (file.size > 5 * 1024 * 1024) {

        showMessage("Please upload a file smaller than 5 MB.");

        uploadInput.value = "";

        return;

    }


    const reader = new FileReader();


    reader.onload = function (event) {

        const timetableData = {

            name: file.name,

            type: file.type,

            data: event.target.result

        };


        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(timetableData)
            );

        } catch (error) {

            showMessage("Browser storage is full. Try a smaller file.");

            return;

        }


        displayTimetable(

            timetableData.data,

            timetableData.type,

            timetableData.name

        );


        showMessage("Your timetable was uploaded successfully!");

        uploadInput.value = "";

    };


    reader.onerror = function () {

        showMessage("Unable to read this file. Please try again.");

    };


    reader.readAsDataURL(file);

});


// LOAD SAVED TIMETABLE

if (student) {

    const savedTimetable = localStorage.getItem(storageKey);


    if (savedTimetable) {

        try {

            const timetable = JSON.parse(savedTimetable);


            displayTimetable(

                timetable.data,

                timetable.type,

                timetable.name

            );

        } catch (error) {

            localStorage.removeItem(storageKey);

            showMessage("Saved timetable could not be opened.");

        }

    }

}


// REMOVE TIMETABLE

removeButton.addEventListener("click", function () {

    const confirmRemove = confirm(
        "Are you sure you want to remove your timetable?"
    );


    if (confirmRemove) {

        localStorage.removeItem(storageKey);


        preview.replaceChildren();


        removeButton.classList.add("hidden");


        uploadInput.value = "";


        showMessage("Timetable removed successfully.");

    }

});
// ATTENDANCE TRACKER

const subjectInput = document.getElementById("subject-name");
const addSubjectBtn = document.getElementById("add-subject");
const attendanceList = document.getElementById("attendance-list");
const attendanceMessage = document.getElementById("attendance-message");

// Separate attendance data for each student
const attendanceKey = "attendance_" + student.email;

let attendanceData = JSON.parse(
    localStorage.getItem(attendanceKey) || "[]"
);

// Save attendance
function saveAttendance() {
    localStorage.setItem(
        attendanceKey,
        JSON.stringify(attendanceData)
    );
}

// Display attendance
function displayAttendance() {
    attendanceList.innerHTML = "";

    attendanceData.forEach((subject, index) => {
        let percentage = subject.total === 0
            ? 0
            : (subject.attended / subject.total) * 100;

        const item = document.createElement("div");
        item.className = "attendance-item";

        const heading = document.createElement("h3");
        heading.textContent = subject.name;

        const details = document.createElement("p");
        details.textContent =
            `Classes: ${subject.attended} attended out of ${subject.total}`;

        const percent = document.createElement("p");
        percent.className = "attendance-percentage";
        percent.textContent =
            `Attendance: ${percentage.toFixed(1)}%`;

        const actions = document.createElement("div");
        actions.className = "attendance-actions";

        const presentBtn = document.createElement("button");
        presentBtn.textContent = "Present";

        presentBtn.addEventListener("click", function () {
            subject.total++;
            subject.attended++;
            saveAttendance();
            displayAttendance();
        });

        const absentBtn = document.createElement("button");
        absentBtn.textContent = "Absent";
        absentBtn.className = "absent-btn";

        absentBtn.addEventListener("click", function () {
            subject.total++;
            saveAttendance();
            displayAttendance();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", function () {
            attendanceData.splice(index, 1);
            saveAttendance();
            displayAttendance();
        });

        actions.append(presentBtn, absentBtn, deleteBtn);
        item.append(heading, details, percent, actions);

        attendanceList.appendChild(item);
    });
}

// Add a new subject
addSubjectBtn.addEventListener("click", function () {
    const name = subjectInput.value.trim();

    if (name === "") {
        attendanceMessage.textContent =
            "Please enter a subject name.";
        return;
    }

    const alreadyExists = attendanceData.some(
        subject => subject.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
        attendanceMessage.textContent =
            "This subject already exists.";
        return;
    }

    attendanceData.push({
        name: name,
        total: 0,
        attended: 0
    });

    saveAttendance();
    displayAttendance();

    subjectInput.value = "";
    attendanceMessage.textContent = "Subject added successfully!";
});

// Show saved attendance when dashboard opens
displayAttendance();
// ASSIGNMENT TRACKER

const assignmentName = document.getElementById("assignment-name");
const assignmentSubject = document.getElementById("assignment-subject");
const assignmentDeadline = document.getElementById("assignment-deadline");
const addAssignmentBtn = document.getElementById("add-assignment");
const assignmentList = document.getElementById("assignment-list");
const assignmentMessage = document.getElementById("assignment-message");

// Store assignments separately for each student
const assignmentKey = "assignments_" + student.email;

let assignments = JSON.parse(
    localStorage.getItem(assignmentKey) || "[]"
);

// Save assignments
function saveAssignments() {
    localStorage.setItem(
        assignmentKey,
        JSON.stringify(assignments)
    );
}

// Display assignments
function displayAssignments() {
    assignmentList.innerHTML = "";

    if (assignments.length === 0) {
        assignmentList.textContent = "No assignments added yet.";
        return;
    }

    assignments.forEach((assignment, index) => {
        const item = document.createElement("div");
        item.className = "assignment-item";

        if (assignment.completed) {
            item.classList.add("completed");
        }

        const heading = document.createElement("h3");
        heading.textContent = assignment.name;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + assignment.subject;

        const deadline = document.createElement("p");
        deadline.textContent = "Deadline: " + assignment.deadline;

        const status = document.createElement("p");
        status.textContent = assignment.completed
            ? "Status: Completed"
            : "Status: Pending";

        const actions = document.createElement("div");
        actions.className = "assignment-actions";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = assignment.completed
            ? "Mark as Pending"
            : "Mark as Completed";

        completeBtn.addEventListener("click", function () {
            assignment.completed = !assignment.completed;
            saveAssignments();
            displayAssignments();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-assignment";

        deleteBtn.addEventListener("click", function () {
            assignments.splice(index, 1);
            saveAssignments();
            displayAssignments();
        });

        actions.append(completeBtn, deleteBtn);
        item.append(heading, subject, deadline, status, actions);

        assignmentList.appendChild(item);
    });
}

// Add assignment
addAssignmentBtn.addEventListener("click", function () {
    const name = assignmentName.value.trim();
    const subject = assignmentSubject.value.trim();
    const deadline = assignmentDeadline.value;

    if (!name || !subject || !deadline) {
        assignmentMessage.textContent =
            "Please fill in all assignment details.";
        return;
    }

    assignments.push({
        name: name,
        subject: subject,
        deadline: deadline,
        completed: false
    });

    saveAssignments();
    displayAssignments();

    assignmentName.value = "";
    assignmentSubject.value = "";
    assignmentDeadline.value = "";

    assignmentMessage.textContent =
        "Assignment added successfully!";
});

// Display saved assignments
displayAssignments();
// NOTES AND DOCUMENTS STORAGE

const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const saveNoteBtn = document.getElementById("save-note");
const documentUpload = document.getElementById("document-upload");
const notesList = document.getElementById("notes-list");
const notesMessage = document.getElementById("notes-message");

// Separate storage for each student
const notesKey = "student_notes_" + student.email;

let savedNotes = JSON.parse(
    localStorage.getItem(notesKey) || "[]"
);

// Save data
function saveNotesData() {
    localStorage.setItem(
        notesKey,
        JSON.stringify(savedNotes)
    );
}

// Display notes and documents
function displayNotes() {
    notesList.innerHTML = "";

    if (savedNotes.length === 0) {
        notesList.textContent = "No notes or documents saved yet.";
        return;
    }

    savedNotes.forEach((note, index) => {
        const item = document.createElement("div");
        item.className = "note-item";

        const heading = document.createElement("h3");
        heading.textContent = note.title;

        item.appendChild(heading);

        if (note.type === "text") {
            const content = document.createElement("p");
            content.textContent = note.content;
            item.appendChild(content);
        }

        if (note.type === "file") {
            const link = document.createElement("a");
            link.href = note.data;
            link.textContent = "View / Open Document";
            link.target = "_blank";
            link.rel = "noopener";
            item.appendChild(link);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-note";

        deleteBtn.addEventListener("click", function () {
            savedNotes.splice(index, 1);
            saveNotesData();
            displayNotes();
        });

        item.appendChild(deleteBtn);
        notesList.appendChild(item);
    });
}

// Save written note
saveNoteBtn.addEventListener("click", function () {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        notesMessage.textContent =
            "Please enter both a title and note.";
        return;
    }

    savedNotes.push({
        title: title,
        content: content,
        type: "text"
    });

    saveNotesData();
    displayNotes();

    noteTitle.value = "";
    noteContent.value = "";

    notesMessage.textContent = "Note saved successfully!";
});

// Upload PDF or image
documentUpload.addEventListener("change", function () {
    const file = documentUpload.files[0];

    if (!file) return;

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
        notesMessage.textContent =
            "Please upload a PDF, JPG or PNG file.";
        documentUpload.value = "";
        return;
    }

    // Keep uploads small because browser storage is limited
    if (file.size > 1024 * 1024) {
        notesMessage.textContent =
            "File is too large. Please choose a file under 1 MB.";
        documentUpload.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            savedNotes.push({
                title: file.name,
                data: reader.result,
                type: "file"
            });

            saveNotesData();
            displayNotes();

            notesMessage.textContent =
                "Document uploaded successfully!";
        } catch (error) {
            notesMessage.textContent =
                "Storage is full. Delete an old document and try again.";
        }

        documentUpload.value = "";
    };

    reader.onerror = function () {
        notesMessage.textContent = "Unable to read this file.";
        documentUpload.value = "";
    };

    reader.readAsDataURL(file);
});

// Show previously saved notes
displayNotes();
// EXAM PLANNER

const examSubject = document.getElementById("exam-subject");
const examDate = document.getElementById("exam-date");
const addExamBtn = document.getElementById("add-exam");
const examList = document.getElementById("exam-list");
const examMessage = document.getElementById("exam-message");

// Separate exam data for each student
const examKey = "student_exams_" + student.email;

let exams = JSON.parse(
    localStorage.getItem(examKey) || "[]"
);

// Save exams
function saveExams() {
    localStorage.setItem(
        examKey,
        JSON.stringify(exams)
    );
}

// Display exams
function displayExams() {
    examList.innerHTML = "";

    if (exams.length === 0) {
        examList.textContent = "No exams added yet.";
        return;
    }

    // Sort exams by date
    exams.sort((a, b) => a.date.localeCompare(b.date));

    exams.forEach((exam, index) => {

        const item = document.createElement("div");
        item.className = "exam-item";

        if (exam.prepared) {
            item.classList.add("prepared");
        }

        const heading = document.createElement("h3");
        heading.textContent = exam.subject;

        const date = document.createElement("p");

        const formattedDate = new Date(
            exam.date + "T00:00:00"
        ).toLocaleDateString("en-IN");

        date.textContent = "Exam Date: " + formattedDate;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const examDay = new Date(
            exam.date + "T00:00:00"
        );

        const difference = Math.ceil(
            (examDay - today) / (1000 * 60 * 60 * 24)
        );

        const countdown = document.createElement("p");

        if (difference > 0) {
            countdown.textContent =
                difference + " days remaining";
        } else if (difference === 0) {
            countdown.textContent = "Exam is today!";
        } else {
            countdown.textContent = "Exam date has passed.";
        }

        const status = document.createElement("p");

        status.textContent = exam.prepared
            ? "Preparation: Completed"
            : "Preparation: In Progress";

        const actions = document.createElement("div");
        actions.className = "exam-actions";

        const prepareBtn = document.createElement("button");

        prepareBtn.textContent = exam.prepared
            ? "Mark as In Progress"
            : "Mark as Prepared";

        prepareBtn.addEventListener("click", function () {
            exam.prepared = !exam.prepared;
            saveExams();
            displayExams();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-exam";

        deleteBtn.addEventListener("click", function () {
            exams.splice(index, 1);
            saveExams();
            displayExams();
        });

        actions.append(prepareBtn, deleteBtn);

        item.append(
            heading,
            date,
            countdown,
            status,
            actions
        );

        examList.appendChild(item);
    });
}

// Add exam
addExamBtn.addEventListener("click", function () {

    const subject = examSubject.value.trim();
    const date = examDate.value;

    if (!subject || !date) {
        examMessage.textContent =
            "Please enter the subject and exam date.";
        return;
    }

    exams.push({
        subject: subject,
        date: date,
        prepared: false
    });

    saveExams();
    displayExams();

    examSubject.value = "";
    examDate.value = "";

    examMessage.textContent =
        "Exam added successfully!";
});

// Show saved exams
displayExams();
// STUDY PLANNER

const studyTaskInput = document.getElementById("study-task");
const studyDateInput = document.getElementById("study-date");
const studyPriorityInput = document.getElementById("study-priority");
const addStudyTaskBtn = document.getElementById("add-study-task");
const studyList = document.getElementById("study-list");
const studyMessage = document.getElementById("study-message");

// Separate tasks for each student
const studyKey = "student_study_" + student.email;

let studyTasks = JSON.parse(
    localStorage.getItem(studyKey) || "[]"
);

// Save tasks
function saveStudyTasks() {
    localStorage.setItem(
        studyKey,
        JSON.stringify(studyTasks)
    );
}

// Display tasks
function displayStudyTasks() {

    studyList.innerHTML = "";

    if (studyTasks.length === 0) {
        studyList.textContent = "No study tasks added yet.";
        return;
    }

    studyTasks.forEach((task, index) => {

        const item = document.createElement("div");
        item.className = "study-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const heading = document.createElement("h3");
        heading.textContent = task.name;

        const date = document.createElement("p");
        date.textContent = "Study Date: " + task.date;

        const priority = document.createElement("p");
        priority.textContent = "Priority: " + task.priority;

        const status = document.createElement("p");
        status.textContent = task.completed
            ? "Status: Completed"
            : "Status: Pending";

        const actions = document.createElement("div");
        actions.className = "study-actions";

        const completeBtn = document.createElement("button");

        completeBtn.textContent = task.completed
            ? "Mark as Pending"
            : "Mark as Completed";

        completeBtn.addEventListener("click", function () {

            task.completed = !task.completed;

            saveStudyTasks();
            displayStudyTasks();

        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-study";

        deleteBtn.addEventListener("click", function () {

            studyTasks.splice(index, 1);

            saveStudyTasks();
            displayStudyTasks();

        });

        actions.append(completeBtn, deleteBtn);

        item.append(
            heading,
            date,
            priority,
            status,
            actions
        );

        studyList.appendChild(item);

    });
}

// Add a new study task
addStudyTaskBtn.addEventListener("click", function () {

    const name = studyTaskInput.value.trim();
    const date = studyDateInput.value;
    const priority = studyPriorityInput.value;

    if (!name || !date) {

        studyMessage.textContent =
            "Please enter a task and select a date.";

        return;
    }

    studyTasks.push({
        name: name,
        date: date,
        priority: priority,
        completed: false
    });

    saveStudyTasks();
    displayStudyTasks();

    studyTaskInput.value = "";
    studyDateInput.value = "";

    studyMessage.textContent =
        "Study task added successfully!";

});

// Display saved tasks
displayStudyTasks();

// =====================================
// DASHBOARD OVERVIEW STATISTICS
// =====================================

function updateDashboardStats() {

    // Total subjects
    document.getElementById("stat-subjects").textContent =
        attendanceData.length;

    // Pending assignments
    const pendingAssignments = assignments.filter(
        assignment => !assignment.completed
    ).length;

    document.getElementById("stat-assignments").textContent =
        pendingAssignments;

    // Upcoming exams (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingExams = exams.filter(exam => {
        const examDay = new Date(exam.date + "T00:00:00");
        return examDay >= today;
    }).length;

    document.getElementById("stat-exams").textContent =
        upcomingExams;

    // Completed study tasks
    const completedTasks = studyTasks.filter(
        task => task.completed
    ).length;

    document.getElementById("stat-study").textContent =
        completedTasks;
}

// Update statistics when dashboard opens
updateDashboardStats();

// Update statistics after a button action
document.addEventListener("click", function(event) {
    if (event.target.closest("button")) {
        updateDashboardStats();
    }
});

/* ===== CUSTOM STUDENT LINKS ===== */

const customLinksKey = "custom_links_" + student.email;

let customLinks = JSON.parse(
    localStorage.getItem(customLinksKey) || "[]"
);

const linkNameInput = document.getElementById("custom-link-name");
const linkUrlInput = document.getElementById("custom-link-url");
const addLinkButton = document.getElementById("add-custom-link");
const customLinksList = document.getElementById("custom-links-list");
const customLinkMessage = document.getElementById("custom-link-message");

function displayCustomLinks() {
    customLinksList.innerHTML = "";

    customLinks.forEach(function(link, index) {
        const item = document.createElement("div");
        item.className = "custom-link-item";

        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.name;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-custom-link";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {
            customLinks.splice(index, 1);
            saveCustomLinks();
            displayCustomLinks();
            showToast("Link deleted successfully!");
        });

        item.appendChild(anchor);
        item.appendChild(deleteButton);

        customLinksList.appendChild(item);
    });
}

function saveCustomLinks() {
    localStorage.setItem(
        customLinksKey,
        JSON.stringify(customLinks)
    );
}

addLinkButton.addEventListener("click", function() {
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();

    if (!name || !url) {
        customLinkMessage.textContent =
            "Please enter both link name and URL.";
        return;
    }

    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Invalid URL");
        }

        customLinks.push({
            name: name,
            url: parsedUrl.href
        });

        saveCustomLinks();
        displayCustomLinks();

        linkNameInput.value = "";
        linkUrlInput.value = "";
        customLinkMessage.textContent = "";

        showToast("Your link has been added!");

    } catch (error) {
        customLinkMessage.textContent =
            "Please enter a valid website URL.";
    }
});

displayCustomLinks();
// TOAST NOTIFICATION
function showToast(message) {
    const toast = document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
}
// AUTOMATIC TIMETABLE TEXT EXTRACTION

async function extractTimetable(file) {
    extractionBox.classList.remove("hidden");
    extractionMessage.textContent = "Reading your timetable...";
    extractedSubjectsContainer.innerHTML = "";
    confirmSubjectsButton.classList.add("hidden");
    detectedSubjects = [];

    try {
        let text = "";

        if (file.type === "application/pdf") {
            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();

                text += content.items
                    .map(item => item.str)
                    .join(" ") + "\n";
            }

            // If the PDF has no selectable text, use OCR.
            if (text.trim().length < 20) {
                const worker = await Tesseract.createWorker("eng");

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: canvas.getContext("2d"),
                        viewport: viewport
                    }).promise;

                    const result = await worker.recognize(canvas);
                    text += result.data.text + "\n";
                }

                await worker.terminate();
            }
        } else {
            const worker = await Tesseract.createWorker("eng");
            const result = await worker.recognize(file);
            text = result.data.text;
            await worker.terminate();
        }

        // Find possible subject names.
        const lines = text.split(/\n/);

        const ignoredWords = [
            "monday", "tuesday", "wednesday", "thursday",
            "friday", "saturday", "sunday", "time",
            "subject", "room", "faculty", "break", "lunch"
        ];

        detectedSubjects = [
            ...new Set(
                lines
                    .map(line => line.trim())
                    .filter(line =>
                        line.length >= 3 &&
                        line.length <= 60 &&
                        !/^\d/.test(line) &&
                        !ignoredWords.includes(line.toLowerCase())
                    )
            )
        ];

        showExtractedSubjects();

    } catch (error) {
        console.error("Timetable extraction error:", error);
        extractionMessage.textContent =
            "Could not read the timetable. Please try another file.";
    }
}


// DISPLAY EDITABLE SUBJECT SUGGESTIONS

function showExtractedSubjects() {
    extractedSubjectsContainer.innerHTML = "";

    if (detectedSubjects.length === 0) {
        extractionMessage.textContent =
            "No subject names were detected. Please check the timetable image or PDF.";
        return;
    }

    extractionMessage.textContent =
        "Please review the suggestions. You can edit the names before adding them.";

    detectedSubjects.forEach((subject, index) => {
        const input = document.createElement("input");

        input.type = "text";
        input.value = subject;
        input.className = "extracted-subject-input";
        input.dataset.index = index;

        extractedSubjectsContainer.appendChild(input);
    });

    confirmSubjectsButton.classList.remove("hidden");
}