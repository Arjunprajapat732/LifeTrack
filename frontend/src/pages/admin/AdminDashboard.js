import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = () => {
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, caregivers: 0, patients: 0 });
  const [contacts, setContacts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated and is admin
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/admin');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const meRes = await axios.get('/api/auth/me', config);
        if (!meRes.data?.data?.user || meRes.data.data.user.role !== 'admin') {
          logout();
          navigate('/admin');
          return;
        }
        // Fetch users
        const usersRes = await axios.get('/api/auth/users?limit=100', config);
        const users = usersRes.data.data.users;
        const nonAdminUsers = users.filter(u => u.role !== 'admin');
        setUserStats({
          total: nonAdminUsers.length,
          admins: users.filter(u => u.role === 'admin').length,
          caregivers: nonAdminUsers.filter(u => u.role === 'caregiver').length,
          patients: nonAdminUsers.filter(u => u.role === 'patient').length
        });
        setUsers(users);

        // Fetch contacts
        const contactsRes = await axios.get('/api/contact?limit=5', config);
        setContacts(contactsRes.data.data.contacts);

        // Recent activity (combine users and contacts for demo)
        const activity = [];
        nonAdminUsers.slice(-3).forEach(u => activity.push({
          type: 'user',
          text: `User ${u.firstName} ${u.lastName} registered`,
          time: new Date(u.createdAt).toLocaleString()
        }));
        contactsRes.data.data.contacts.slice(0, 3).forEach(c => activity.push({
          type: 'contact',
          text: `Contact form submitted by ${c.name}`,
          time: new Date(c.createdAt).toLocaleString()
        }));
        setRecentActivity(activity.slice(0, 5));
      } catch (err) {
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/admin');
        }
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
            <span className="text-2xl font-bold text-blue-700">LT</span>
          </div>
          <span className="text-white text-2xl font-semibold tracking-wide">LifeTrack Admin</span>
        </div>
        <div>
          <button onClick={handleLogout} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-100 transition">Logout</button>
        </div>
      </header>
      <main className="flex-1 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gradient-to-b from-blue-800 to-purple-800 p-6 text-white min-h-[300px]">
          <nav className="space-y-4">
            <button onClick={() => setSidebarTab('dashboard')} className={`block w-full text-left py-2 px-4 rounded-lg ${sidebarTab === 'dashboard' ? 'bg-blue-700/80 font-semibold' : 'hover:bg-blue-600'} transition`}>Dashboard</button>
            <button onClick={() => setSidebarTab('users')} className={`block w-full text-left py-2 px-4 rounded-lg ${sidebarTab === 'users' ? 'bg-blue-700/80 font-semibold' : 'hover:bg-blue-600'} transition`}>Users</button>
            <button onClick={() => setSidebarTab('contacts')} className={`block w-full text-left py-2 px-4 rounded-lg ${sidebarTab === 'contacts' ? 'bg-blue-700/80 font-semibold' : 'hover:bg-blue-600'} transition`}>Contacts</button>
            <button onClick={() => setSidebarTab('settings')} className={`block w-full text-left py-2 px-4 rounded-lg ${sidebarTab === 'settings' ? 'bg-blue-700/80 font-semibold' : 'hover:bg-blue-600'} transition`}>Settings</button>
          </nav>
        </aside>
        <section className="flex-1 p-8 text-white">
          {sidebarTab === 'dashboard' && (
            <>
              <h1 className="text-4xl font-bold mb-6">Welcome, Admin!</h1>
              {loading ? (
                <div className="text-center py-10">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-xl p-6 shadow-lg flex flex-col items-center">
                      <span className="text-3xl font-bold">{userStats.total}</span>
                      <span className="text-lg mt-2">Total Users</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 shadow-lg flex flex-col items-center">
                      <span className="text-3xl font-bold">{contacts.length}</span>
                      <span className="text-lg mt-2">Contacts</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 shadow-lg flex flex-col items-center">
                      <span className="text-3xl font-bold">{userStats.admins}</span>
                      <span className="text-lg mt-2">Admins</span>
                    </div>
                  </div>
                  <div className="mt-10 bg-white/10 rounded-xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                    <ul className="divide-y divide-white/20">
                      {recentActivity.map((item, idx) => (
                        <li key={idx} className="py-2 flex justify-between">
                          <span>{item.text}</span>
                          <span className="text-sm text-gray-300">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
          {sidebarTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold mb-6">All Users</h1>
              {loading ? (
                <div className="text-center py-10">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white/10 rounded-xl">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(user => user.role !== 'admin').map(user => (
                        <tr key={user._id} className="border-b border-white/20">
                          <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2 capitalize">{user.role}</td>
                          <td className="px-4 py-2">{user.isActive ? 'Active' : 'Inactive'}</td>
                          <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* You can add similar sections for contacts and settings */}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
