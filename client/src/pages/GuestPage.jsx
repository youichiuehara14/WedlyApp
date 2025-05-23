import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../Context';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import BASE_URL from '../config.js';

const highlightMatch = (text, search) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function GuestPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    rsvp: '',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editGuestId, setEditGuestId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const { guestsObjects, setGuestsObjects, fetchGuestsPerUser } = useContext(Context);

  useEffect(() => {
    fetchGuestsPerUser();
  }, []);

  const openModal = (guest = null, index = null) => {
    if (guest) {
      setForm({
        name: guest.name || '',
        phone: guest.phone || '',
        email: guest.email || '',
        rsvp:
          typeof guest.rsvp === 'boolean'
            ? guest.rsvp
            : guest.rsvp === 'true'
            ? true
            : guest.rsvp === 'false'
            ? false
            : '',
      });
      setEditIndex(index);
      setEditGuestId(guest._id);
    } else {
      setForm({
        name: '',
        phone: '',
        email: '',
        rsvp: '',
      });
      setEditIndex(null);
      setEditGuestId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      name: '',
      phone: '',
      email: '',
      rsvp: '',
    });
    setEditIndex(null);
    setEditGuestId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'rsvp' ? (value === 'true' ? true : value === 'false' ? false : '') : value,
    }));
  };

  const handleSubmit = async () => {
    if (
      form.name.trim() !== '' &&
      form.phone.trim() !== '' &&
      form.email.trim() !== '' &&
      (form.rsvp === true || form.rsvp === false)
    ) {
      try {
        if (editGuestId) {
          const { data } = await axios.put(
            `${BASE_URL}/api/guest/updateGuest/${editGuestId}`,
            form,
            { withCredentials: true }
          );
          toast.success('Guest updated!');
          const updatedGuest = data.guest || form;
          setGuestsObjects((prev) =>
            prev.map((guest) => (guest._id === editGuestId ? { ...guest, ...updatedGuest } : guest))
          );
        } else {
          const { data } = await axios.post(`${BASE_URL}/api/guest/createGuest`, form, {
            withCredentials: true,
          });
          toast.success('Guest added!');
          setGuestsObjects((prev) => [...prev, data.guest]);
        }
        closeModal();
      } catch (err) {
        console.error('Guest error:', err);
        toast.error(err.response?.data?.message || 'Failed to save guest');
      }
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleDelete = async (index) => {
    const guest = guestsObjects[index];
    if (!guest) return;
    if (window.confirm('Delete this guest?')) {
      try {
        await axios.delete(`${BASE_URL}/api/guest/deleteGuest/${guest._id}`, {
          withCredentials: true,
        });
        toast.success('Guest deleted!');
        setGuestsObjects((prev) => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Delete guest error:', err);
        toast.error(err.response?.data?.message || 'Failed to delete guest');
      }
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filtered = guestsObjects
    .filter((v) => {
      const searchTerm = search.toLowerCase();
      const safeLower = (str) => (typeof str === 'string' ? str.toLowerCase() : '');

      const matchesSearch =
        safeLower(v.name).includes(searchTerm) ||
        safeLower(v.phone).includes(searchTerm) ||
        safeLower(v.email).includes(searchTerm) ||
        (typeof v.rsvp === 'boolean'
          ? (v.rsvp ? 'yes' : 'no').includes(searchTerm)
          : safeLower(v.rsvp).includes(searchTerm));

      return matchesSearch;
    })
    .sort((a, b) => {
      let aField = a[sortField];
      let bField = b[sortField];

      if (typeof aField === 'string') aField = aField.toLowerCase();
      if (typeof bField === 'string') bField = bField.toLowerCase();

      if (aField > bField) return sortDirection === 'asc' ? 1 : -1;
      if (aField < bField) return sortDirection === 'asc' ? -1 : 1;
      return 0;
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const exportToExcel = () => {
    if (!guestsObjects || guestsObjects.length === 0) {
      toast.error('No guests to export');
      return;
    }

    const data = guestsObjects.map((guest) => ({
      'Guest ID': guest._id,
      Name: guest.name || '',
      Phone: guest.phone || '',
      Email: guest.email || '',
      RSVP: guest.rsvp === true ? 'Yes' : guest.rsvp === false ? 'No' : '',
      'Created At': formatDate(guest.createdAt),
      'Updated At': formatDate(guest.updatedAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'guests.xlsx');
  };

  return (
    <div className="min-h-screen bg-[#2d2f25] rounded-4xl text-black p-4 shadow-neumorphism-inset">
      <div className="h-screen rounded-4xl p-5">
        <h1 className="text-xl sm:text-3xl font-bold mb-6 inline-block px-5 py-2">Guests</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="border-1 border-gray-500 p-2 rounded-lg w-full sm:w-1/3 text-black focus:outline-none text-sm sm:text-base"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
            onClick={() => openModal()}
          >
            Add Guest
          </button>
          <button
            className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
            onClick={exportToExcel}
          >
            Export Excel
          </button>
        </div>

        <div className="rounded-4xl shadow-lg shadow-neumorphism-inset p-8">
          <table className="min-w-full text-black">
            <thead>
              <tr className="text-left text-xs sm:text-base">
                <th
                  className="p-3 sm:p-4 cursor-pointer md:text-lg"
                  onClick={() => toggleSort('name')}
                >
                  Name {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="p-3 sm:p-4 cursor-pointer hidden sm:table-cell md:text-lg"
                  onClick={() => toggleSort('phone')}
                >
                  Phone {sortField === 'phone' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="p-3 sm:p-4 cursor-pointer md:text-lg hidden sm:table-cell"
                  onClick={() => toggleSort('email')}
                >
                  Email {sortField === 'email' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="p-3 sm:p-4 cursor-pointer md:text-lg"
                  onClick={() => toggleSort('rsvp')}
                >
                  RSVP {sortField === 'rsvp' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((v, i) => (
                  <tr
                    key={v._id || i}
                    className="border-t border-[#323529] duration-200 transition-all"
                  >
                    <td className="p-3 sm:p-4 text-xs md:text-lg">
                      {highlightMatch(v.name || '', search)}
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell text-xs md:text-lg">
                      {highlightMatch(v.phone || '', search)}
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell text-xs md:text-lg">
                      {highlightMatch(v.email || '', search)}
                    </td>
                    <td className="p-3 sm:p-4 text-xs md:text-lg">
                      {highlightMatch(
                        typeof v.rsvp === 'boolean' ? (v.rsvp ? 'Yes' : 'No') : v.rsvp || '',
                        search
                      )}
                    </td>
                    <td className="p-3 sm:p-4 space-x-2">
                      <button
                        onClick={() => openModal(v, i)}
                        className="text-black cursor-pointer hover:underline text-xs md:text-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-black cursor-pointer hover:underline text-xs md:text-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500 text-sm sm:text-base">
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-800">
              <h2 className="text-xl font-semibold mb-4">
                {editIndex !== null ? 'Edit Guest' : 'Add Guest'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    name="name"
                    placeholder="Guest Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RSVP</label>
                  <select
                    name="rsvp"
                    value={form.rsvp === '' ? '' : form.rsvp.toString()}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
                  >
                    <option value="">Select RSVP</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="border-[#5050509d] border-1 text-black px-4 py-2 rounded-lg hover:bg-[#565a47] hover:text-white cursor-pointer transition-all duration-300 text-sm"
                >
                  {editIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
