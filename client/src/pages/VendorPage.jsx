import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Context } from "../Context";
import { toast } from "react-hot-toast";

const categories = [
  "Photographer",
  "Catering",
  "Cake",
  "Venue",
  "Wedding Attire",
  "Host",
  "Entertainment",
  "Trasportation",
  "Makeup Artist",
  "Photobooth",
  "Other",
];

export default function VendorPage() {
  const { user } = useContext(Context) || {};
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    cost: "",
    email: "",
  });
  const [customCategory, setCustomCategory] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editVendorId, setEditVendorId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Fetch vendors from backend
  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/vendor/vendorsPerUser",
        { withCredentials: true }
      );
      setVendors(res.data.vendors || []);
    } catch (err) {
      toast.error("Failed to fetch vendors");
    }
  };

  const openModal = (vendor = null, index = null) => {
    if (vendor) {
      setForm(vendor);
      setCustomCategory(vendor.category === "Other" ? vendor.category : "");
      setEditIndex(index);
      setEditVendorId(vendor._id);
    } else {
      setForm({
        name: "",
        category: "",
        address: "",
        phone: "",
        cost: "",
        email: "",
      });
      setCustomCategory("");
      setEditIndex(null);
      setEditVendorId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      name: "",
      category: "",
      address: "",
      phone: "",
      cost: "",
      email: "",
    });
    setCustomCategory("");
    setEditIndex(null);
    setEditVendorId(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const finalCategory =
      form.category === "Other" ? customCategory : form.category;

    if (
      form.name &&
      finalCategory &&
      form.address &&
      form.phone &&
      form.cost &&
      form.email
    ) {
      try {
        if (editVendorId) {
          // Update vendor
          await axios.put(
            `http://localhost:4000/api/vendor/update-vendor/${editVendorId}`,
            { ...form, category: finalCategory },
            { withCredentials: true }
          );
          toast.success("Vendor updated!");
        } else {
          // Create vendor
          await axios.post(
            "http://localhost:4000/api/vendor/create-vendor",
            { ...form, category: finalCategory },
            { withCredentials: true }
          );
          toast.success("Vendor added!");
        }
        fetchVendors();
        closeModal();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to save vendor");
      }
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleDelete = async (index) => {
    const vendor = vendors[index];
    if (!vendor) return;
    if (window.confirm("Delete this vendor?")) {
      try {
        await axios.delete(
          `http://localhost:4000/api/vendor/delete-vendor/${vendor._id}`,
          { withCredentials: true }
        );
        toast.success("Vendor deleted!");
        fetchVendors();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete vendor");
      }
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtered = vendors
    .filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterCategory ? v.category === filterCategory : true)
    )
    .sort((a, b) => {
      if (sortField === "cost") {
        return sortDirection === "asc"
          ? Number(a.cost) - Number(b.cost)
          : Number(b.cost) - Number(a.cost);
      } else {
        return sortDirection === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
    });

  return (
    <div className="bg-gray-50 overflow-y-auto w-screen h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Vendor</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border p-2 rounded w-full sm:w-auto"
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          + Add Vendor
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th
                className="p-2 cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name
              </th>
              <th className="p-2">Category</th>
              <th className="p-2">Address</th>
              <th className="p-2">Phone</th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => toggleSort("cost")}
              >
                Cost
              </th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((v, i) => (
                <tr key={v._id || i} className="border-t border-gray-200">
                  <td className="p-2">{v.name}</td>
                  <td className="p-2">{v.category}</td>
                  <td className="p-2">{v.address}</td>
                  <td className="p-2">{v.phone}</td>
                  <td className="p-2">{v.cost}</td>
                  <td className="p-2">{v.email}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => openModal(v, i)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editIndex !== null ? "Edit Vendor" : "Add Vendor"}
            </h2>
            <div className="space-y-3">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {form.category === "Other" && (
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Custom Category"
                  className="w-full border p-2 rounded"
                />
              )}
              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="cost"
                type="number"
                placeholder="Cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
