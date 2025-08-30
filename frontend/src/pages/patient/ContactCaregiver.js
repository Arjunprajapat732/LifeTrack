import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ContactCaregiver = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-12">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-healthcare-600 rounded-full flex items-center justify-center mb-4 shadow">
          <span className="text-white text-4xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.firstName} {user.lastName}</h2>
        <p className="text-lg text-gray-600 mb-1 capitalize">{user.role}</p>
        <p className="text-md text-gray-700 mb-1">{user.email}</p>
        {user.phone && <p className="text-md text-gray-700 mb-1">{user.phone}</p>}
        {user.caregiverId && (
          <div className="mt-6 w-full bg-blue-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Assigned Caregiver</h3>
            <p className="text-md text-blue-800">{user.caregiverId.firstName} {user.caregiverId.lastName}</p>
            <p className="text-sm text-blue-700">{user.caregiverId.email}</p>
            {user.caregiverId.phone && (
              <p className="text-sm text-blue-700 mb-4">{user.caregiverId.phone}</p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              {/* Call Button */}
              <a
                href={user.caregiverId.phone ? `tel:${user.caregiverId.phone}` : '#'}
                className={`inline-flex items-center px-6 py-3 rounded-lg shadow transition bg-green-500 hover:bg-green-600 text-white font-semibold text-lg ${!user.caregiverId.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Call Caregiver"
                {...(!user.caregiverId.phone && { tabIndex: -1, 'aria-disabled': true })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.3 1.2a2 2 0 01-.45 1.95l-.7.7a16.001 16.001 0 006.586 6.586l.7-.7a2 2 0 011.95-.45l1.2.3A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C7.163 21 3 16.837 3 12V5z" /></svg>
                Call
              </a>
              {/* Video Call Button (dummy link) */}
              <button
                className="inline-flex items-center px-6 py-3 rounded-lg shadow transition bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg"
                title="Video Call (Coming Soon)"
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 19h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Video Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCaregiver;
