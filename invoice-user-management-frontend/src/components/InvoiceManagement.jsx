import { useState, useEffect } from 'react';
import api from '../services/api';

export default function InvoiceManagement() {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFY, setSelectedFY] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        date: '',
        amount: '',
        description: '',
        financialYear: ''
    });

    useEffect(() => {
        // Fetch current user's role and permissions
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/auth/current-user');
                setCurrentUser(response.data);
                await fetchInvoices();
            } catch (error) {
                console.error('Error fetching current user:', error);
                setError('Error loading user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    const fetchInvoices = async (pageNum = 1) => {
        try {
            const response = await api.get(`/invoices?page=${pageNum}&limit=10`);
            setInvoices(response.data.invoices);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('Error loading invoices. Please try again.');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Implement search logic with debounce
    };

    const handleFilter = (e) => {
        setSelectedFY(e.target.value);
        // Implement filter logic
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        try {
            const response = await api.post('/invoices', {
                ...formData,
                createdBy: currentUser.id
            });
            setInvoices([...invoices, response.data]);
            setShowCreateForm(false);
            setFormData({
                invoiceNumber: '',
                date: '',
                amount: '',
                description: '',
                financialYear: ''
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            setError(error.response?.data?.message || 'Error creating invoice');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        try {
            const response = await api.put(`/invoices/${selectedInvoice.id}`, formData);
            setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? response.data : inv));
            setShowUpdateForm(false);
            setSelectedInvoice(null);
        } catch (error) {
            console.error('Error updating invoice:', error);
            setError(error.response?.data?.message || 'Error updating invoice');
        }
    };

    const handleDelete = async (id) => {
        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setInvoices(invoices.filter(inv => inv.id !== id));
            } catch (error) {
                console.error('Error deleting invoice:', error);
                setError(error.response?.data?.message || 'Error deleting invoice');
            }
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <select
                    value={selectedFY}
                    onChange={handleFilter}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">All Financial Years</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                </select>
                <button
                    onClick={() => setShowCreateForm(true)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Create Invoice
                </button>
            </div>

            {showCreateForm && (
                <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <h3>Create New Invoice</h3>
                    <form onSubmit={handleCreate}>
                        <input
                            type="text"
                            placeholder="Invoice Number"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <select
                            value={formData.financialYear}
                            onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                            required
                        >
                            <option value="">Select Financial Year</option>
                            <option value="2023-24">2023-24</option>
                            <option value="2022-23">2022-23</option>
                        </select>
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Financial Year</th>
                        <th>Created By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td>{invoice.invoiceNumber}</td>
                            <td>{invoice.date}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.description}</td>
                            <td>{invoice.financialYear}</td>
                            <td>{invoice.createdBy}</td>
                            <td>
                                <button onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setFormData(invoice);
                                    setShowUpdateForm(true);
                                }}>Edit</button>
                                <button onClick={() => handleDelete(invoice.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
} 