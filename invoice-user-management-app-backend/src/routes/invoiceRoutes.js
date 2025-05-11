const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Invoice routes
router.post("/", invoiceController.createInvoice);
router.get("/", invoiceController.getInvoices);
router.get("/:invoiceId", invoiceController.getInvoiceById);
router.put("/:invoiceId", invoiceController.updateInvoice);
router.delete("/:invoiceId", invoiceController.deleteInvoice);

module.exports = router;
