function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

document.getElementById('currentDate').textContent = formatDate(new Date());

function formatTime(date) {
  const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return date.toLocaleTimeString(undefined, options);
}

function updateTime() {
  document.getElementById('currentTime').textContent = formatTime(new Date());
}

setInterval(updateTime, 1000);

function createTaskElement(day) {
  const taskBox = document.createElement('div');
  taskBox.className = 'task-box';
  taskBox.innerHTML = `
    <div>
      <input type="text" class="task-title" placeholder="Enter task title">
      <input type="time" class="task-time">
      <label><input type="checkbox" class="task-complete"></label>
      <button class="delete-task-button">Delete</button>
    </div>
  `;

  const checkbox = taskBox.querySelector('.task-complete');
  checkbox.addEventListener('change', () => {
    updateProgress(day);
    updateChart();
  });

  // Add event listener for the delete button
  const deleteButton = taskBox.querySelector('.delete-task-button');
  deleteButton.addEventListener('click', () => {
    taskBox.remove();
    updateProgress(day);
  });

  return taskBox;
}

function updateProgress(day) {
  const tasksContainer = document.getElementById(`tasks-${day}`);
  const checkboxes = tasksContainer.querySelectorAll('.task-complete');
  const totalTasks = checkboxes.length;
  const completedTasks = tasksContainer.querySelectorAll('.task-complete:checked').length;
  const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById(`progress-${day}`).textContent = `${progressPercentage}%`;
}

function addTask(day) {
  const tasksContainer = document.getElementById(`tasks-${day}`);
  const newTask = createTaskElement(day);
  tasksContainer.appendChild(newTask);

  const checkbox = newTask.querySelector('.task-complete');
  checkbox.addEventListener('change', () =>
  {
    updateProgress(day);
    saveTasks(); // Save tasks whenever a checkbox is changed
  });

  updateProgress(day);
  updateChart();
  saveTasks(); // Save tasks whenever a checkbox is changed
}

function removeTask(taskBox, day) {
  taskBox.remove();
  updateProgress(day);
  saveTasks(); // Save tasks whenever a task is removed
}

// Load tasks when the page loads
window.addEventListener('load', loadTasks);

function resetTasks() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(day => {
    const tasksContainer = document.getElementById(`tasks-${day}`);
    tasksContainer.innerHTML = ''; // Clear all tasks
    document.getElementById(`progress-${day}`).textContent = '0%'; // Reset progress
  });

  updateChart();
}

document.getElementById('reset-button').addEventListener('click', resetTasks);

function resizeTextarea() {
  const textarea = document.getElementById('note');
  textarea.style.height = 'auto'; // Reset the height
  textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the scroll height
}

// Initialize the pie chart
const ctx = document.getElementById('weeklyChart').getContext('2d');
const weeklyChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Completed', 'Pending'],
    datasets: [{
      label: 'Tasks',
      data: [0, 0],
      backgroundColor: ['#db6a57', '#fcc64e']
    }]
  },
  options: {
    responsive: true
  }
});

function updateChart() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let totalTasks = 0;
  let completedTasks = 0;

  days.forEach(day => {
    const tasksContainer = document.getElementById(`tasks-${day}`);
    const checkboxes = tasksContainer.querySelectorAll('.task-complete');
    totalTasks += checkboxes.length;
    completedTasks += tasksContainer.querySelectorAll('.task-complete:checked').length;
  });

  const pendingTasks = totalTasks - completedTasks;
  weeklyChart.data.datasets[0].data = [completedTasks, pendingTasks];
  weeklyChart.update();
}

updateChart();

// Save tasks to localStorage
function saveTasks() {
  const tasks = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
      const tasksContainer = document.getElementById(`tasks-${day}`);
      const taskElements = tasksContainer.querySelectorAll('.task-box');
      tasks[day] = Array.from(taskElements).map(taskBox => ({
          title: taskBox.querySelector('.task-title').value,
          time: taskBox.querySelector('.task-time').value,
          completed: taskBox.querySelector('.task-complete').checked
      }));
  });
  
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (!savedTasks) return;
  
  const tasks = JSON.parse(savedTasks);
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
      const tasksContainer = document.getElementById(`tasks-${day}`);
      tasksContainer.innerHTML = '';
      if (tasks[day]) {
          tasks[day].forEach(task => {
              const newTask = createTaskElement();
              tasksContainer.appendChild(newTask);
              newTask.querySelector('.task-title').value = task.title;
              newTask.querySelector('.task-time').value = task.time;
              newTask.querySelector('.task-complete').checked = task.completed;
              newTask.querySelector('.task-complete').addEventListener('change', () => updateProgress(day));
          });
          updateProgress(day);
      }
  });
}
