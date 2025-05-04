const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, invoiceController.createInvoice);
router.get("/", authMiddleware, invoiceController.getInvoices);
router.put("/:invoiceId", authMiddleware, invoiceController.updateInvoice);
router.delete("/:invoiceId", authMiddleware, invoiceController.deleteInvoice);

module.exports = router;
