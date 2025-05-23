import { useContext, useEffect, useState } from 'react';
import { Context } from '../Context';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Pencil, Save, X, LockKeyhole } from 'lucide-react';

function AccountPage() {
  const { user, setUser } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const profileLetter = user?.firstName?.charAt(0).toUpperCase() || '?';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
      setLoading(false);
    }
  }, [user, navigate, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    const { firstName, lastName, email, phoneNumber } = formData;

    if (!firstName || !lastName || !email || !phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { data } = await axios.put('http://localhost:4000/api/user/update', formData, {
        withCredentials: true,
      });

      setUser(data);
      toast.success('User information updated');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-20">Loading...</div>;

  return (
    <div className="min-h-full flex items-center p-6 rounded-4xl shadow-neumorphism-inset">
      <div className="w-full mt-10 sm:w-[90%] lg:w-[70%] mx-auto p-4 sm:px-24 sm:py-24 rounded-4xl shadow-lg shadow-neumorphism-inset">
        <div className="flex flex-col items-center  mb-4">
          <div className="mb-2 w-26 h-26 bg-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
            {profileLetter}
          </div>
          <span className=" text-sm font-semibold text-black">{user?.firstName}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-5  justify-between items-center md:items-start sm:items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-black mb-4 sm:mb-0">
            Account Information
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => setEditing(true)}
              className="w-full sm:w-30 border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              <Pencil size={16} /> Edit
            </button>
            <Link
              to="/home/change-password"
              className="w-full sm:w-30 border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm flex items-center justify-center gap-2 text-center"
            >
              <LockKeyhole size={16} /> Password
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 max-w-full sm:max-w-4xl mx-auto">
          {['firstName', 'lastName', 'email', 'phoneNumber'].map((field) => (
            <div key={field} className="w-full">
              <label className="block text-sm font-medium text-gray-500 mb-1 capitalize">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border-1 border-gray-500 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  editing ? ' text-gray-800' : ' text-gray-600 focus:ring-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex justify-center gap-4 mt-4 sm:mt-6">
            <button
              onClick={handleSaveChanges}
              className="w-full sm:w-40 border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg duration-200 hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="w-full sm:w-40 border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg duration-200 hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountPage;
