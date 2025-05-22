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

  if (loading) return <div className="text-center text-white mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#2d2f25] py-12 px-4 rounded-4xl ">
      <div className="max-w-4xl mx-auto p-6 backdrop-blur-md rounded-4xl shadow-xl shadow-neumorphism border-1 border-gray-400/10">
        <h2 className="text-3xl font-semibold text-white text-center mb-6 flex items-center justify-center gap-2">
          Account Information
        </h2>

        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          {['firstName', 'lastName', 'email', 'phoneNumber'].map((field) => (
            <div key={field} className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-4 py-2 border text-sm rounded-lg focus:outline-none focus:ring-2 ${
                  editing
                    ? 'bg-white text-gray-800 '
                    : 'bg-gray-200 text-gray-600 focus:ring-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-10">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-40 flex items-center justify-center gap-2 border-1 border-gray-400/70 cursor-pointer text-white py-2 rounded-lg  transition text-sm"
            >
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="w-40 flex items-center justify-center gap-2 border-1 border-gray-400/70 cursor-pointer text-white py-2 rounded-lg hover:bg-gray-600/10 transition text-sm"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="w-40 flex items-center justify-center gap-2 border-1 border-gray-400/70 cursor-pointer text-white py-2 rounded-lg hover:bg-gray-600/10 transition text-sm"
              >
                <X size={16} /> Cancel
              </button>
            </>
          )}

          <Link
            to="/home/change-password"
            className="w-40 flex items-center justify-center gap-2 border-1 border-gray-400/70 cursor-pointer text-white py-2 rounded-lg hover:bg-gray-600/10 transition text-sm text-center"
          >
            <LockKeyhole size={16} /> Password
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
