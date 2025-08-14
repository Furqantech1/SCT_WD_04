// DOM Elements
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const calendarBtn = document.getElementById('calendarBtn');
const calendarDropdown = document.getElementById('calendarDropdown');
const monthYearSpan = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const calendarDays = document.getElementById('calendarDays');
const clearBtn = document.getElementById('clearBtn');
const todayBtn = document.getElementById('todayBtn');
const okBtn = document.getElementById('okBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const prioritySelector = document.getElementById('prioritySelector');
const priorityBtns = document.querySelectorAll('.priority-btn');

// Modal Elements
const confirmModal = document.getElementById('customConfirmModal');
const confirmModalText = document.getElementById('confirmModalText');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSort = 'date-created';
let currentDate = new Date();
let selectedDate = null;
let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize the app
function initApp() {
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    renderTasks();
    updateTaskCount();
    updateCalendar();
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Calendar event listeners
    calendarBtn.addEventListener('click', () => toggleCalendar());
    prevMonthBtn.addEventListener('click', () => previousMonth());
    nextMonthBtn.addEventListener('click', () => nextMonth());
    clearBtn.addEventListener('click', () => clearDate());
    todayBtn.addEventListener('click', () => selectToday());
    okBtn.addEventListener('click', () => confirmDate());
    
    // Close calendar when clicking outside
    document.addEventListener('click', (e) => {
        if (!calendarDropdown.contains(e.target) && !calendarBtn.contains(e.target) && !taskDate.contains(e.target)) {
            closeCalendar();
        }
    });

    // Prevent calendar from closing when clicking inside
    calendarDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    searchInput.addEventListener('input', renderTasks);
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    themeToggle.addEventListener('change', toggleTheme);
}

// Calendar functions
function toggleCalendar() {
    calendarDropdown.classList.toggle('active');
    if (calendarDropdown.classList.contains('active')) {
        updateCalendar();
        positionCalendar();
    }
}

function positionCalendar() {
    const container = document.querySelector('.date-picker-container');
    const dropdown = calendarDropdown;
    const containerRect = container.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth;
    const viewportWidth = window.innerWidth;

    if (window.innerWidth <= 768) {

        dropdown.style.left = '';
        dropdown.style.right = '';
        return;
    }

    dropdown.style.left = 'auto';
    dropdown.style.right = 'auto';
    if (containerRect.left + dropdownWidth > viewportWidth) {
        dropdown.style.right = '0';
    } else {
        dropdown.style.left = '0';
    }
}

function closeCalendar() {
    calendarDropdown.classList.remove('active');
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearSpan.textContent = `${months[month]}, ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    let daysHTML = '';
    
    // Previous month's days
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        daysHTML += `<div class="day other-month" data-date="${prevMonth.getFullYear()}-${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}">${day}</div>`;
    }
    
    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        let classes = 'day';
        if (isSameDay(date, today)) {
            classes += ' today';
        }
        if (selectedDate && dateString === selectedDate) {
            classes += ' selected';
        }
        
        daysHTML += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
    }
    
    // Next month's days
    const totalCells = Math.ceil((firstDayWeek + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayWeek + daysInMonth);
    const nextMonth = new Date(year, month + 1, 1);
    
    for (let day = 1; day <= remainingCells; day++) {
        const dateString = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        daysHTML += `<div class="day other-month" data-date="${dateString}">${day}</div>`;
    }
    
    calendarDays.innerHTML = daysHTML;
    
    // Add click events to days
    calendarDays.querySelectorAll('.day').forEach(day => {
        day.addEventListener('click', () => {
            const date = day.getAttribute('data-date');
            selectDate(date);
        });
    });
}

function selectDate(dateString) {
    // Remove previous selection
    calendarDays.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    const selectedDay = calendarDays.querySelector(`[data-date="${dateString}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    selectedDate = dateString;
}

function clearDate() {
    selectedDate = null;
    taskDate.value = '';
    calendarDays.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    closeCalendar();
}

function selectToday() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    selectDate(dateString);
    confirmDate();
}

function confirmDate() {
    if (selectedDate) {
        const date = new Date(selectedDate);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        taskDate.value = formattedDate;
    }
    closeCalendar();
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Add a new task
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    
    if (!text) {
        taskInput.parentElement.classList.add('error');
        setTimeout(() => taskInput.parentElement.classList.remove('error'), 2000);
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text,
        date,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateTaskCount();
    
    // Reset input fields
    taskInput.value = '';
    taskDate.value = '';
    selectedDate = null;
    calendarDays.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    taskInput.focus();
}

// Render tasks based on current filter, search, and sort
function renderTasks() {
    taskList.innerHTML = '';
    
    // 1. Filter by status
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    // 2. Filter by search term
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(searchTerm));
    }

    // 3. Sort tasks
    const priorityValues = { high: 3, medium: 2, low: 1 };
    filteredTasks.sort((a, b) => {
        switch (currentSort) {
            case 'due-date':
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date) - new Date(b.date);
            case 'priority':
                return priorityValues[b.priority] - priorityValues[a.priority];
            case 'date-created':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    if (filteredTasks.length === 0) {
        displayEmptyState();
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function displayEmptyState() {
     taskList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h3>No tasks match your criteria</h3>
            <p>Try adjusting your filters or add a new task.</p>
        </div>
    `;
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    const isOverdue = task.date && !task.completed && new Date(convertToISODate(task.date)) < new Date();
    li.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
    li.dataset.id = task.id;
    
    li.innerHTML = `
        <div class="task-check">
            <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Complete task">
        </div>
        <div class="task-content">
            <div class="task-header">
                <div class="task-text">${task.text}</div>
                <div class="task-actions">
                    <button class="task-btn edit" title="Edit task"><i class="fas fa-edit"></i></button>
                    <button class="task-btn delete" title="Delete task"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="task-details">
                <div class="task-date">
                    <i class="far fa-calendar"></i> ${formatDueDate(task.date)}
                </div>
                <div class="task-priority priority-${task.priority}">
                    <i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </div>
            </div>
        </div>
    `;
    
    li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTaskComplete(task.id));
    li.querySelector('.edit').addEventListener('click', () => editTask(task.id));
    li.querySelector('.delete').addEventListener('click', () => deleteTask(task.id, task.text));
    
    return li;
}

function convertToISODate(dateString) {
    if (!dateString) return null;
    
    // If it's already in ISO format, return it
    if (dateString.includes('T')) return dateString;
    
    // Convert dd-mm-yyyy to yyyy-mm-dd
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    return dateString;
}

function formatDueDate(dateString) {
    if (!dateString) return 'No due date';
    
    // Convert dd-mm-yyyy format to proper date
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    return dateString;
}

// Toggle task completion status
function toggleTaskComplete(id) {
    tasks = tasks.map(task => 
        task.id === id ? {...task, completed: !task.completed} : task
    );
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Delete a task
function deleteTask(id, text) {
    showConfirmationModal(`Are you sure you want to delete the task "${text}"?`, () => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateTaskCount();
    });
}

// Edit a task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
    taskElement.classList.add('editing');
    
    taskElement.innerHTML = `
        <div class="task-content">
            <div class="edit-form">
                <input type="text" class="edit-task-input" value="${task.text}" placeholder="Task name">
                <div class="form-row">
                    <div class="form-group">
                        <label>Due Date</label>
                        <input type="text" class="edit-task-date" value="${task.date || ''}" placeholder="dd-mm-yyyy" readonly>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <div class="priority-select">
                            ${['low', 'medium', 'high'].map(p => `
                                <div class="priority-option ${p} ${task.priority === p ? 'selected' : ''}" data-priority="${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn cancel-edit-btn">Cancel</button>
                    <button class="btn save-edit-btn">Save</button>
                </div>
            </div>
        </div>
    `;
    
    // Priority selection logic
    const priorityOptions = taskElement.querySelectorAll('.priority-option');
    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            priorityOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    taskElement.querySelector('.cancel-edit-btn').addEventListener('click', () => {
        renderTasks();
    });
    
    taskElement.querySelector('.save-edit-btn').addEventListener('click', () => {
        const newText = taskElement.querySelector('.edit-task-input').value.trim();
        if (!newText) {
            alert('Task name cannot be empty');
            return;
        }
        
        tasks = tasks.map(t => 
            t.id === id ? {
                ...t, 
                text: newText, 
                date: taskElement.querySelector('.edit-task-date').value, 
                priority: taskElement.querySelector('.priority-option.selected').dataset.priority
            } : t
        );
        
        saveTasks();
        renderTasks();
    });
}

// Update task count
function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    taskCount.textContent = `${completedTasks} of ${totalTasks} tasks`;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Theme switcher logic
function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Custom confirmation modal logic
function showConfirmationModal(message, callback) {
    confirmModalText.textContent = message;
    confirmModal.style.display = 'flex';

    const confirmHandler = () => {
        callback();
        hideModal();
    };

    const cancelHandler = () => {
        hideModal();
    };
    
    const hideModal = () => {
        confirmModal.style.display = 'none';
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
    };

    confirmBtn.addEventListener('click', confirmHandler);
    cancelBtn.addEventListener('click', cancelHandler);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
