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

const vnpayIPN = async (req, res) => {
  try {
    const result = await PaymentService.handleVnpayIPNService(req.query);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const momoReturn = async (req, res) => {
  try {
    await PaymentService.handleMomoReturnService(req.query);
    //. MoMo quy định resultCode === "0" là thanh toán thành công
    if (req.query.resultCode === "0") {
      return res.redirect("http://localhost:5173/payment-success");
    } else {
      return res.redirect("http://localhost:5173/payment-failed");
    }
  } catch (error) {
    return res.redirect("http://localhost:5173/payment-failed");
  }
};

const momoIPN = async (req, res) => {
  try {
    await PaymentService.handleMomoIPNService(req.body);
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  vnpayReturn,
  momoReturn,
  momoIPN,
  vnpayIPN,
};
