const Invoice = require("../models/invoiceModel");

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, invoiceAmount, financialYear } = req.body;

    const newInvoice = new Invoice({
      invoiceNumber,
      invoiceDate,
      invoiceAmount,
      financialYear,
      createdBy: req.user.id,  // Changed from userId to id to match JWT payload
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { financialYear, startDate, endDate } = req.query;

    const query = { financialYear };

    if (startDate && endDate) {
      query.invoiceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const invoices = await Invoice.find(query);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { invoiceAmount, invoiceDate } = req.body;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { invoiceAmount, invoiceDate },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(204).json({ msg: "Invoice deleted" });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
};
