document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const backendUrl = 'https://jojo-todo.onrender.com'; // Change this to your live backend URL when you deploy
    const userId = 'publicUser123'; // In a real app with logins, this would be dynamic.

    // --- DOM Element Selection ---
    const pageTitle = document.getElementById('page-title');
    const mainTitle = document.getElementById('main-title');
    const todoTitle = document.getElementById('todo-title');
    const notesTitle = document.getElementById('notes-title');
    const taskInput = document.getElementById('task-input');
    const notesArea = document.getElementById('notes-area');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const currentDateEl = document.getElementById('current-date');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    let currentDate = new Date();

    const themes = {
        p3: { pageTitle: "Stardust Crusaders Log", mainTitle: "Stardust Crusaders", todoTitle: "「STAR PLATINUM」 TARGETS", notesTitle: "Speedwagon Foundation Intel", taskPlaceholder: "Good grief... what's next?", notesPlaceholder: "The journey to Egypt continues...", addTask: "ORA ORA ORA!" },
        p4: { pageTitle: "Morioh Daily", mainTitle: "Morioh Daily", todoTitle: "「CRAZY DIAMOND」 TASKS", notesTitle: "Morioh Town Bulletin", taskPlaceholder: "What needs fixing, Josuke?", notesPlaceholder: "A beautiful duwang...", addTask: "DORARARA!" },
        p5: { pageTitle: "Vento Aureo Agenda", mainTitle: "Vento Aureo", todoTitle: "「GOLDEN EXPERIENCE」 MISSIONS", notesTitle: "Passione's Logbook", taskPlaceholder: "I, Giorno Giovanna, have a task...", notesPlaceholder: "This is the taste of a liar...", addTask: "MUDA!" },
        p6: { pageTitle: "Stone Ocean Log", mainTitle: "Stone Ocean", todoTitle: "「STONE FREE」 OBJECTIVES", notesTitle: "Green Dolphin St. Journal", taskPlaceholder: "Break out of this stone ocean...", notesPlaceholder: "I'll see the stars again...", addTask: "ORA ORA!" },
        p7: { pageTitle: "Steel Ball Run Log", mainTitle: "Steel Ball Run", todoTitle: "「TUSK」 STAGES", notesTitle: "Gyro's Lessons", taskPlaceholder: "What's the next stage, Johnny?", notesPlaceholder: "Remember Lesson 5...", addTask: "GO! GO!" }
    };

    const applyTheme = (themeName) => {
        const theme = themes[themeName];
        document.body.className = `theme-${themeName}`;
        pageTitle.textContent = theme.pageTitle;
        mainTitle.textContent = theme.mainTitle;
        todoTitle.textContent = theme.todoTitle;
        notesTitle.textContent = theme.notesTitle;
        taskInput.placeholder = theme.taskPlaceholder;
        notesArea.placeholder = theme.notesPlaceholder;
        addTaskBtn.textContent = theme.addTask;
        themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeName));
        localStorage.setItem('jojoAgendaTheme', themeName);
    };
    themeButtons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.theme)));

    const formatDateKey = (date) => date.toISOString().split('T')[0];
    const updateDateDisplay = (date) => { const today = new Date(); currentDateEl.textContent = (formatDateKey(date) === formatDateKey(today)) ? "Today" : date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); };
    
    async function loadData() {
        const dateKey = formatDateKey(currentDate);
        try {
            const response = await fetch(`${backendUrl}/api/data/${userId}/${dateKey}`);
            const data = await response.json();
            notesArea.value = data.notes || '';
            taskList.innerHTML = '';
            (data.tasks || []).forEach(task => {
                const li = document.createElement('li');
                if (task.completed) li.classList.add('completed');
                li.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''}><span>${task.text}</span><button class="delete-btn">✖</button>`;
                li.querySelector('input[type="checkbox"]').addEventListener('change', toggleTask);
                li.querySelector('.delete-btn').addEventListener('click', deleteTask);
                taskList.appendChild(li);
            });
        } catch (error) { console.error("Could not load data from backend:", error); }
        updateDateDisplay(currentDate);
    }

    async function saveData() {
        const dateKey = formatDateKey(currentDate);
        const tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => { tasks.push({ text: li.querySelector('span').textContent, completed: li.querySelector('input[type="checkbox"]').checked }); });
        const dataToSave = { userId, date: dateKey, tasks, notes: notesArea.value };
        try {
            await fetch(`${backendUrl}/api/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });
        } catch (error) { console.error("Could not save data to backend:", error); }
    }

    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox"><span>${taskText}</span><button class="delete-btn">✖</button>`;
        li.querySelector('input[type="checkbox"]').addEventListener('change', toggleTask);
        li.querySelector('.delete-btn').addEventListener('click', deleteTask);
        taskList.appendChild(li);
        taskInput.value = '';
        await saveData();
    }

    const toggleTask = (e) => { e.target.closest('li').classList.toggle('completed'); saveData(); };
    const deleteTask = (e) => { e.target.closest('li').remove(); saveData(); };
    const changeDate = (offset) => { currentDate.setDate(currentDate.getDate() + offset); loadData(); };

    prevDayBtn.addEventListener('click', () => changeDate(-1));
    nextDayBtn.addEventListener('click', () => changeDate(1));
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    notesArea.addEventListener('blur', saveData);
    
    const savedTheme = localStorage.getItem('jojoAgendaTheme') || 'p3';
    applyTheme(savedTheme);
    loadData();
});