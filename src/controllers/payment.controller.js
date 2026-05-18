const PaymentService = require("../services/payment.service");

const createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;

    const result = await PaymentService.createPaymentService(
      booking_id,
      payment_method,
      req
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    const result = await PaymentService.handleVnpayReturnService(req.query);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  createPayment,
  vnpayReturn,
};
