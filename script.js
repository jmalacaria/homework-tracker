// Clock EST USA
function updateClock() {
    const now = new Date();
    const est = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const options = { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false };
    document.getElementById('clock').textContent = est.toLocaleString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock();

// Color box setup
const colorBox = document.getElementById('color-box');
const colors = ['red','orange','green'];
let colorIndex = 0;
colorBox.addEventListener('click', () => {
    colorIndex = (colorIndex + 1) % colors.length;
    colorBox.className = `color-box ${colors[colorIndex]}`;
});

// Tasks
let tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

function saveTasks() { localStorage.setItem('dailyTasks', JSON.stringify(tasks)); }

function renderTasks() {
    todoList.innerHTML = '';
    completedList.innerHTML = '';
    const now = Date.now();

    // Remove tasks older than 7 days
    tasks = tasks.filter(t => !t.completedAt || (now - t.completedAt) < 7*24*60*60*1000);

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('task-item');

        const checkbox = document.createElement('div');
        checkbox.classList.add('task-checkbox');
        if(task.completed) checkbox.classList.add('checked');
        li.appendChild(checkbox);

        const span = document.createElement('span');
        span.textContent = task.text;
        span.classList.add('task-text');
        span.style.color = task.color;
        li.appendChild(span);

        const category = document.createElement('span');
        category.textContent = task.category;
        category.classList.add('task-category');
        li.appendChild(category);

        const del = document.createElement('span');
        del.textContent = '✖';
        del.classList.add('delete-btn');
        del.addEventListener('click', () => {
            tasks = tasks.filter(t => t !== task);
            saveTasks();
            renderTasks();
        });
        li.appendChild(del);

        checkbox.addEventListener('click', () => {
            task.completed = true;
            task.completedAt = Date.now();
            saveTasks();
            renderTasks();
        });

        if(task.completed) completedList.appendChild(li);
        else todoList.appendChild(li);
    });
}

// Add new task
document.getElementById('task-input').addEventListener('keypress', e => {
    if(e.key === 'Enter' && e.target.value.trim() !== '') {
        const newTask = {
            text: e.target.value.trim(),
            color: colors[colorIndex],
            category: colors[colorIndex] === 'red' ? 'Homework' : colors[colorIndex] === 'orange' ? 'Gym' : 'Other',
            completed: false,
            completedAt: null
        };
        tasks.push(newTask);
        saveTasks();
        e.target.value = '';
        renderTasks();
    }
});

renderTasks();
