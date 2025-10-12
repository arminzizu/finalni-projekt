import React from 'react';

const ProfileSidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Profil</h2>
      <ul className="space-y-2">
        <li>
          <a href="/profile/change-password" className="block p-2 hover:bg-gray-700 rounded">
            Promijeni lozinku
          </a>
        </li>
        <li>
          <a href="/profile/sessions" className="block p-2 hover:bg-gray-700 rounded">
            Pregled sesija
          </a>
        </li>
        <li>
          <a href="/profile/account-details" className="block p-2 hover:bg-gray-700 rounded">
            Detalji naloga
          </a>
        </li>
        <li>
          <a href="/profile/activity" className="block p-2 hover:bg-gray-700 rounded">
            Dnevnik aktivnosti
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;