const sections = ['homework', 'gym', 'other'];
const dateEl = document.getElementById('date');

// Set today's date
const today = new Date();
dateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Load tasks from localStorage
const tasksData = JSON.parse(localStorage.getItem('tasksData') || '{}');

// Remove old completed tasks (older than 7 days)
const now = new Date().getTime();
for (let key in tasksData) {
    tasksData[key] = tasksData[key].filter(t => !t.completedAt || (now - t.completedAt) < 7*24*60*60*1000);
}

const recentList = document.getElementById('recent-list');

sections.forEach(section => {
    const sectionEl = document.getElementById(`${section}-section`);
    const input = sectionEl.querySelector('.task-input');
    const list = sectionEl.querySelector('.task-list');

    // Load existing tasks
    const sectionTasks = tasksData[section]?.filter(t => !t.completed) || [];
    sectionTasks.forEach(task => addTaskToDOM(list, task.text, task.completed));

    // Input handler
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            addTask(list, section, input.value.trim());
            input.value = '';
        }
    });
});

// Render recent completed tasks
sections.forEach(section => {
    const completedTasks = tasksData[section]?.filter(t => t.completed) || [];
    completedTasks.sort((a,b) => b.completedAt - a.completedAt);
    completedTasks.forEach(t => addTaskToDOM(recentList, `[${capitalize(section)}] ${t.text}`, true, true, t.completedAt));
});

// Functions
function addTask(list, section, text) {
    addTaskToDOM(list, text);
    if (!tasksData[section]) tasksData[section] = [];
    tasksData[section].push({ text, completed: false });
    localStorage.setItem('tasksData', JSON.stringify(tasksData));
}

function addTaskToDOM(list, text, completed=false, readonly=false, timestamp=null) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    const checkbox = document.createElement('div');
    checkbox.classList.add('checkbox');
    if (completed) checkbox.classList.add('checked');
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = text;
    li.appendChild(span);

    if (timestamp) {
        const ts = document.createElement('span');
        ts.classList.add('timestamp');
        ts.textContent = `(${new Date(timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})`;
        li.appendChild(ts);
    }

    if (!readonly) {
        checkbox.addEventListener('click', () => {
            checkbox.classList.toggle('checked');
            li.classList.add('fade-out');
            setTimeout(() => {
                updateTaskStatus(text, list, checkbox.classList.contains('checked'));
                li.remove();

                // Move to recently completed
                const recentLi = document.createElement('li');
                recentLi.classList.add('task-item');
                const recentBox = document.createElement('div');
                recentBox.classList.add('checkbox', 'checked');
                recentLi.appendChild(recentBox);
                const recentSpan = document.createElement('span');
                recentSpan.textContent = `[${capitalize(list.parentNode.id.split('-')[0])}] ${text}`;
                recentLi.appendChild(recentSpan);
                const ts = document.createElement('span');
                ts.classList.add('timestamp');
                ts.textContent = `(${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})`;
                recentLi.appendChild(ts);

                recentLi.style.opacity = 0;
                recentList.prepend(recentLi);
                setTimeout(()=>recentLi.style.opacity=1, 50);
            }, 300);
        });
    }

    const section = list.parentNode.id.split('-')[0];
    span.classList.add(section);

    list.appendChild(li);
}

function updateTaskStatus(text, list, completed) {
    const section = list.parentNode.id.split('-')[0];
    const task = tasksData[section].find(t => t.text === text && !t.completed);
    if (task && completed) {
        task.completed = true;
        task.completedAt = new Date().getTime();
        localStorage.setItem('tasksData', JSON.stringify(tasksData));
    }
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
