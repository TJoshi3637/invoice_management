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
    const [sortOrder, setSortOrder] = useState('desc');

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
            } catch (error) {
                console.error('Error fetching current user:', error);
                setError('Error loading user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    // Separate useEffect for fetching invoices based on page changes
    useEffect(() => {
        if (currentUser) {
            fetchInvoices(page);
        }
    }, [page, currentUser]);

    const fetchInvoices = async (pageNum = 1) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/invoices?page=${pageNum}&limit=10`);

            // Handle different response formats
            let invoiceData = [];
            if (Array.isArray(response.data)) {
                invoiceData = response.data;
            } else if (response.data && response.data.invoices) {
                invoiceData = response.data.invoices;
            } else if (response.data && Array.isArray(response.data.data)) {
                invoiceData = response.data.data;
            }

            // Sort invoices by date
            invoiceData.sort((a, b) => {
                const dateA = new Date(a.invoiceDate || a.date);
                const dateB = new Date(b.invoiceDate || b.date);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            setInvoices(invoiceData);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('Error loading invoices. Please try again.');
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Add debounce for search
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm) {
                handleSearchInvoices();
            } else if (currentUser) {
                fetchInvoices(page);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, currentUser]);

    const handleSearchInvoices = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/invoices/search?term=${searchTerm}&page=${page}&limit=10`);

            // Handle different response formats
            let invoiceData = [];
            if (Array.isArray(response.data)) {
                invoiceData = response.data;
            } else if (response.data && response.data.invoices) {
                invoiceData = response.data.invoices;
            } else if (response.data && Array.isArray(response.data.data)) {
                invoiceData = response.data.data;
            }

            // Sort invoices by date
            invoiceData.sort((a, b) => {
                const dateA = new Date(a.invoiceDate || a.date);
                const dateB = new Date(b.invoiceDate || b.date);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            setInvoices(invoiceData);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error searching invoices:', error);
            setError('Error searching invoices. Please try again.');
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page when searching
    };

    const handleFilter = (e) => {
        setSelectedFY(e.target.value);
        setPage(1); // Reset to first page when filtering

        if (e.target.value) {
            filterByFinancialYear(e.target.value);
        } else {
            fetchInvoices(1);
        }
    };

    const filterByFinancialYear = async (year) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/invoices?financialYear=${year}&page=1&limit=10`);

            // Handle different response formats
            let invoiceData = [];
            if (Array.isArray(response.data)) {
                invoiceData = response.data;
            } else if (response.data && response.data.invoices) {
                invoiceData = response.data.invoices;
            } else if (response.data && Array.isArray(response.data.data)) {
                invoiceData = response.data.data;
            }

            // Sort invoices by date
            invoiceData.sort((a, b) => {
                const dateA = new Date(a.invoiceDate || a.date);
                const dateB = new Date(b.invoiceDate || b.date);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });

            setInvoices(invoiceData);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error filtering invoices:', error);
            setError('Error filtering invoices. Please try again.');
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Add useEffect to handle sort order changes
    useEffect(() => {
        if (currentUser) {
            if (searchTerm) {
                handleSearchInvoices();
            } else if (selectedFY) {
                filterByFinancialYear(selectedFY);
            } else {
                fetchInvoices(page);
            }
        }
    }, [sortOrder]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        try {
            // Map the form field names to match the API expectations
            const apiData = {
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.date,          // Map 'date' to 'invoiceDate'
                invoiceAmount: formData.amount,      // Map 'amount' to 'invoiceAmount'
                description: formData.description,
                financialYear: formData.financialYear,
                createdBy: currentUser.id
            };

            // Log the data being sent to help with debugging
            console.log('Creating invoice with data:', apiData);

            const response = await api.post('/invoices', apiData);

            console.log('API response from create:', response);

            // Refresh the invoices list after creating
            await fetchInvoices(page);

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

            // Enhanced error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);

                setError(`Error creating invoice: ${error.response.status} - ${error.response.data?.message ||
                    error.response.data?.error ||
                    JSON.stringify(error.response.data) ||
                    'Unknown server error'
                    }`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                setError('Network error: No response received from server');
            } else {
                // Something happened in setting up the request
                console.error('Error message:', error.message);
                setError(`Error creating invoice: ${error.message}`);
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        if (!selectedInvoice) {
            setError('No invoice selected for update.');
            return;
        }

        try {
            // Map the form field names to match the API expectations
            const apiData = {
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.date,          // Map 'date' to 'invoiceDate'
                invoiceAmount: formData.amount,      // Map 'amount' to 'invoiceAmount'
                description: formData.description,
                financialYear: formData.financialYear
            };

            // Log update data for debugging
            console.log('Updating invoice with ID:', selectedInvoice.id);
            console.log('Update data:', apiData);

            const response = await api.put(`/invoices/${selectedInvoice.id}`, apiData);

            console.log('API update response:', response);

            // Refresh the invoices list after updating
            await fetchInvoices(page);

            setShowUpdateForm(false);
            setSelectedInvoice(null);
            setFormData({
                invoiceNumber: '',
                date: '',
                amount: '',
                description: '',
                financialYear: ''
            });
        } catch (error) {
            console.error('Error updating invoice:', error);

            // Enhanced error logging
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);

                setError(`Error updating invoice: ${error.response.status} - ${error.response.data?.message ||
                    error.response.data?.error ||
                    JSON.stringify(error.response.data) ||
                    'Unknown server error'
                    }`);
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Network error: No response received from server');
            } else {
                console.error('Error message:', error.message);
                setError(`Error updating invoice: ${error.message}`);
            }
        }
    };

    const handleDelete = async (id) => {
        if (!currentUser) {
            setError('User data not loaded. Please try again.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                console.log('Deleting invoice with ID:', id);

                const response = await api.delete(`/invoices/${id}`);
                console.log('Delete response:', response);

                // Refresh the invoices list after deleting
                await fetchInvoices(page);
            } catch (error) {
                console.error('Error deleting invoice:', error);

                // Enhanced error logging
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);

                    setError(`Error deleting invoice: ${error.response.status} - ${error.response.data?.message ||
                        error.response.data?.error ||
                        JSON.stringify(error.response.data) ||
                        'Unknown server error'
                        }`);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                    setError('Network error: No response received from server');
                } else {
                    console.error('Error message:', error.message);
                    setError(`Error deleting invoice: ${error.message}`);
                }
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (isLoading && !invoices.length) {
        return <div>Loading...</div>;
    }

    return (
        <div className="invoice-management">
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div className="controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
                <div className="form-container" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <h3>Create New Invoice</h3>
                    <form onSubmit={handleCreate}>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Invoice Number"
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <select
                                value={formData.financialYear}
                                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            >
                                <option value="">Select Financial Year</option>
                                <option value="2023-24">2023-24</option>
                                <option value="2022-23">2022-23</option>
                            </select>
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showUpdateForm && selectedInvoice && (
                <div className="form-container" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <h3>Update Invoice</h3>
                    <form onSubmit={handleUpdate}>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Invoice Number"
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <input
                                type="text"
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <select
                                value={formData.financialYear}
                                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                                required
                                style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                            >
                                <option value="">Select Financial Year</option>
                                <option value="2023-24">2023-24</option>
                                <option value="2022-23">2022-23</option>
                            </select>
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUpdateForm(false);
                                    setSelectedInvoice(null);
                                    setFormData({
                                        invoiceNumber: '',
                                        date: '',
                                        amount: '',
                                        description: '',
                                        financialYear: ''
                                    });
                                }}
                                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Invoice Number</th>
                        <th
                            style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                            onClick={() => {
                                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                fetchInvoices(page);
                            }}
                        >
                            Date {sortOrder === 'desc' ? '↓' : '↑'}
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Financial Year</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created By</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.length > 0 ? (
                        invoices.map((invoice) => (
                            <tr key={invoice.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{invoice.invoiceNumber}</td>
                                <td style={{ padding: '12px' }}>{invoice.invoiceDate || invoice.date}</td>
                                <td style={{ padding: '12px' }}>{invoice.invoiceAmount || invoice.amount}</td>
                                <td style={{ padding: '12px' }}>{invoice.description}</td>
                                <td style={{ padding: '12px' }}>{invoice.financialYear}</td>
                                <td style={{ padding: '12px' }}>{invoice.createdBy}</td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedInvoice(invoice);
                                            setFormData({
                                                invoiceNumber: invoice.invoiceNumber || '',
                                                date: invoice.invoiceDate || invoice.date || '',
                                                amount: invoice.invoiceAmount || invoice.amount || '',
                                                description: invoice.description || '',
                                                financialYear: invoice.financialYear || ''
                                            });
                                            setShowUpdateForm(true);
                                        }}
                                        style={{
                                            marginRight: '5px',
                                            padding: '5px 10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(invoice.id)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ padding: '12px', textAlign: 'center' }}>
                                {isLoading ? 'Loading invoices...' : 'No invoices found'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: page === 1 ? '#e9ecef' : '#007bff',
                        color: page === 1 ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: page === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: page === totalPages ? '#e9ecef' : '#007bff',
                        color: page === totalPages ? '#6c757d' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: page === totalPages ? 'not-allowed' : 'pointer'
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}