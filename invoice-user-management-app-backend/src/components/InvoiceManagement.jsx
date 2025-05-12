import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { invoiceService } from '../services/api';

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchInvoices = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await invoiceService.getInvoices({
                page,
                limit: pageSize,
            });
            setInvoices(response.data.invoices);
            setPagination({
                ...pagination,
                current: page,
                total: response.data.total,
            });
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const columns = [
        {
            title: 'Invoice Number',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
        },
        {
            title: 'Date',
            dataIndex: 'invoiceDate',
            key: 'invoiceDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Amount',
            dataIndex: 'invoiceAmount',
            key: 'invoiceAmount',
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        {
            title: 'Financial Year',
            dataIndex: 'financialYear',
            key: 'financialYear',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
    ];

    const handleTableChange = (pagination) => {
        fetchInvoices(pagination.current, pagination.pageSize);
    };

    return (
        <div>
            <h1>Invoice Management</h1>
            <Table
                columns={columns}
                dataSource={invoices}
                rowKey="invoiceNumber"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default InvoiceManagement; 