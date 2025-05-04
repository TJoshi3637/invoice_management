const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true },
  invoiceDate: { type: Date, required: true },
  invoiceAmount: { type: Number, required: true },
  financialYear: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
