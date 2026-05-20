const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.post("/", paymentController.createPayment);
router.get("/vnpay-return", paymentController.vnpayReturn);
router.get("/momo-return", paymentController.momoReturn);
router.post("/momo-ipn", paymentController.momoIPN);

module.exports = router;
