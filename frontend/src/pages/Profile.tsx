import { useAppSelector } from '../store/store';
import type { RootState } from '../store/store';

export default function Profile() {
  const user = useAppSelector((state: RootState) => state.auth.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const fullName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : 'User';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
              {fullName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {user.role}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.firstName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">First Name</label>
                  <p className="mt-1">{user.firstName}</p>
                </div>
              )}
              {user.lastName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Name</label>
                  <p className="mt-1">{user.lastName}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Type</label>
                <p className="mt-1 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              onClick={() => {
                // TODO: Implement edit profile functionality
                console.log('Edit profile clicked');
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
