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
  const { financialYear, startDate, endDate } = req.query;

  const query = { financialYear };

  if (startDate && endDate) {
    query.invoiceDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const invoices = await Invoice.find(query);
  res.json(invoices);
};

exports.updateInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const { invoiceAmount, invoiceDate } = req.body;
  const updatedInvoice = await Invoice.findByIdAndUpdate(
    invoiceId,
    { invoiceAmount, invoiceDate },
    { new: true }
  );
  res.json(updatedInvoice);
};

exports.deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  await Invoice.findByIdAndDelete(invoiceId);
  res.status(204).json({ msg: "Invoice deleted" });
};
