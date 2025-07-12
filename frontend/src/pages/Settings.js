import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  ShieldOff, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Save,
  AlertTriangle
} from 'lucide-react';

const Settings = () => {
  const { user, updateTravelMode, changePassword, isPanicMode } = useAuth();
  const [travelSettings, setTravelSettings] = useState({
    travel_mode_enabled: user?.settings?.travel_mode?.travel_mode_enabled || false,
    hide_stats: user?.settings?.travel_mode?.hide_stats || false,
    panic_username: '',
    panic_password: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    panic: false
  });
  const [loading, setLoading] = useState({
    travel: false,
    password: false
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleTravelModeSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, travel: true });
    setError('');
    setSuccess('');

    const result = await updateTravelMode(travelSettings);

    if (result.success) {
      setSuccess('Travel mode settings updated successfully');
      setTravelSettings({
        ...travelSettings,
        panic_username: '',
        panic_password: ''
      });
    } else {
      setError(result.error);
    }

    setLoading({ ...loading, travel: false });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, password: true });
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setError('New passwords do not match');
      setLoading({ ...loading, password: false });
      return;
    }

    const result = await changePassword(passwordData);

    if (result.success) {
      setSuccess('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
    } else {
      setError(result.error);
    }

    setLoading({ ...loading, password: false });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={user?.full_name || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Travel Mode Settings */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Travel Mode Settings</h3>
          {isPanicMode && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              Panic Mode Active
            </span>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="font-medium text-amber-800">Privacy Protection</h4>
          </div>
          <p className="text-sm text-amber-700">
            Travel mode hides your budget planner by showing a 404 page to anyone using normal credentials. 
            Only panic credentials will allow access to your account.
          </p>
        </div>

        <form onSubmit={handleTravelModeSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="travel-mode"
              checked={travelSettings.travel_mode_enabled}
              onChange={(e) => setTravelSettings({
                ...travelSettings,
                travel_mode_enabled: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="travel-mode" className="text-sm font-medium text-gray-700">
              Enable Travel Mode
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hide-stats"
              checked={travelSettings.hide_stats}
              onChange={(e) => setTravelSettings({
                ...travelSettings,
                hide_stats: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hide-stats" className="text-sm font-medium text-gray-700">
              Hide Statistics (panic mode will show limited data)
            </label>
          </div>

          {travelSettings.travel_mode_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panic Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={travelSettings.panic_username}
                    onChange={(e) => setTravelSettings({
                      ...travelSettings,
                      panic_username: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter panic username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panic Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPasswords.panic ? 'text' : 'password'}
                    value={travelSettings.panic_password}
                    onChange={(e) => setTravelSettings({
                      ...travelSettings,
                      panic_password: e.target.value
                    })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter panic password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('panic')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPasswords.panic ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading.travel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading.travel ? 'Saving...' : 'Save Travel Mode Settings'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  current_password: e.target.value
                })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  new_password: e.target.value
                })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_new_password}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  confirm_new_password: e.target.value
                })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading.password}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading.password ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Settings;