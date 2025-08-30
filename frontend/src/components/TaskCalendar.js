import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

const TaskCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        const tasks = res.data.data.tasks.map(task => ({ title: task.title, date: task.date }));
        setEvents(tasks);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchTasks();
  }, []);

  const handleDateClick = async (arg) => {
    const title = prompt('Enter task title:');
    if (title) {
      try {
        const res = await axios.post('/api/tasks', { title, date: arg.dateStr });
        setEvents([...events, { title, date: arg.dateStr }]);
      } catch (err) {
        alert('Failed to save task.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Task Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        events={events}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
        height="auto"
      />
    </div>
  );
};

export default TaskCalendar;
