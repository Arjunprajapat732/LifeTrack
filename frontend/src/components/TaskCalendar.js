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
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        // Expecting backend to return patient info in each task (populate patientId)
        const tasks = res.data.data.tasks.map(task => ({
          title: task.title,
          patientName: task.patientId && task.patientId.firstName ? `${task.patientId.firstName} ${task.patientId.lastName}` : '',
          date: task.date
        }));
        setEvents(tasks);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchTasks();
  }, []);

  // Fetch patients for this caregiver
  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await axios.get('/api/patient-status/all-patients');
        // Only show patients for this caregiver
        const filtered = (res.data.data.patients || []).filter(
          p => !p.patient.caregiverId || p.patient.caregiverId === user._id
        );
        setPatients(filtered.map(p => p.patient));
      } catch (err) {
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, [user]);

  const handleDateClick = (arg) => {
    setModalDate(arg.dateStr);
    setTaskTitle('');
    setSelectedPatient('');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTaskTitle('');
    setSelectedPatient('');
    setModalDate(null);
  };

  const handleTaskCreate = async (e) => {
    e.preventDefault();
    if (!taskTitle || !selectedPatient) return;
    try {
      // Find patient object for display
      const patientObj = patients.find(p => p._id === selectedPatient);
      await axios.post('/api/tasks', {
        title: taskTitle,
        date: modalDate,
        patientId: selectedPatient
      });
      setEvents([
        ...events,
        {
          title: taskTitle,
          patientName: patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : '',
          date: modalDate
        }
      ]);
      handleModalClose();
    } catch (err) {
      alert('Failed to save task.');
    }
  };

  // Custom rendering for calendar events: title on first line, patient name on next line
  function renderEventContent(eventInfo) {
    const { event } = eventInfo;
    const title = event.title;
    // patientName is stored in extendedProps
    const patientName = event.extendedProps && event.extendedProps.patientName;
    return (
      <div style={{ whiteSpace: 'pre-line' }}>
        <span>{title}</span>
        {patientName && (
          <div style={{ fontSize: '0.85em', color: '#fff' }}>{patientName}</div>
        )}
      </div>
    );
  }

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
        eventContent={renderEventContent}
      />


      {/* Custom Modal for creating a task (same style as dashboard modals) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create Task for {modalDate}</h3>
              <button 
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTaskCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={e => setSelectedPatient(e.target.value)}
                  className="input-field w-full"
                  required
                  disabled={loadingPatients}
                >
                  <option value="">{loadingPatients ? 'Loading...' : 'Select patient'}</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2 mt-4">
                <button type="button" onClick={handleModalClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={!taskTitle || !selectedPatient}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
