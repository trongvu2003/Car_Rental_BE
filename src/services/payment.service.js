const qs = require("qs");
const axios = require("axios");
const crypto = require("crypto");
const { sequelize } = require("../models");

const paymentRepository = require("../repositories/payment.repository");

const {
  sortObject,
  generateSignature,
  verifySignature,
} = require("../utils/vnpay.util");

const createPaymentService = async (booking_id, payment_method, req) => {
  const t = await sequelize.transaction();

  try {
    const booking = await paymentRepository.findBookingById(booking_id, {
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const payment = await paymentRepository.create(
      {
        booking_id,
        amount: booking.total_price,
        payment_method,
        payment_status: payment_method === "cash" ? "paid" : "pending",
      },
      {
        transaction: t,
      }
    );

    // CASH
    if (payment_method === "cash") {
      await paymentRepository.updateBooking(
        booking.id,
        {
          status: "confirmed",
          payment_status: "paid",
        },
        {
          transaction: t,
        }
      );

      await t.commit();

      return payment;
    }

    // VNPAY
    if (payment_method === "vnpay") {
      const date = new Date();

      const createDate = date
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14);

      // Lấy IP client
      let ipAddr =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

      // Nếu là IPv6 localhost thì chuyển về IPv4
      if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
        ipAddr = "127.0.0.1";
      }

      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.VNPAY_TMNCODE,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: payment.id,
        vnp_OrderInfo: `Thanh toan booking ${booking.id}`,
        vnp_OrderType: "other",
        vnp_Amount: payment.amount * 100,
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      vnp_Params = sortObject(vnp_Params);

      const secureHash = generateSignature(
        vnp_Params,
        process.env.VNPAY_HASHSECRET
      );

      vnp_Params["vnp_SecureHash"] = secureHash;

      const paymentUrl =
        process.env.VNPAY_URL +
        "?" +
        qs.stringify(vnp_Params, { encode: true });

      console.log("paymentUrl:", paymentUrl);

      vnp_Params;

      await t.commit();

      return {
        payment_url: paymentUrl,
      };
    }

    // MOMO
    if (payment_method === "momo") {
      const orderId = payment.id.toString();
      const requestId = orderId;
      const amount = payment.amount.toString();
      const orderInfo = `Thanh toán booking ${booking.id}`;
      const requestType = "payWithMethod";

      const rawSignature =
        `accessKey=${process.env.MOMO_ACCESS_KEY}` +
        `&amount=${amount}` +
        `&extraData=` +
        `&ipnUrl=${process.env.MOMO_IPN_URL}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${process.env.MOMO_PARTNER_CODE}` +
        `&redirectUrl=${process.env.MOMO_REDIRECT_URL}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

      const signature = crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

      const requestBody = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: process.env.MOMO_REDIRECT_URL,
        ipnUrl: process.env.MOMO_IPN_URL,
        lang: "vi",
        requestType,
        autoCapture: true,
        extraData: "",
        signature,
      };

      const response = await axios.post(process.env.MOMO_URL, requestBody);

      await t.commit();

      return {
        payment_url: response.data.payUrl,
      };
    }

    throw new Error("Invalid payment method");
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

// HANDLE VNPAY RETURN
const handleVnpayReturnService = async (query) => {
  const isValid = verifySignature(query, process.env.VNPAY_HASHSECRET);

  if (!isValid) {
    return {
      success: false,
      message: "Invalid signature",
    };
  }

  const payment = await paymentRepository.findById(query.vnp_TxnRef);

  if (!payment) {
    return {
      success: false,
      message: "Payment not found",
    };
  }

  return {
    success: query.vnp_ResponseCode === "00",
    payment_status: payment.payment_status,
    message:
      query.vnp_ResponseCode === "00" ? "Payment success" : "Payment failed",
  };
};

// HANDLE VNPAY IPN
const handleVnpayIPNService = async (query) => {
  const isValid = verifySignature(query, process.env.VNPAY_HASHSECRET);

  if (!isValid) {
    return {
      RspCode: "97",
      Message: "Invalid signature",
    };
  }

  const t = await sequelize.transaction();

  try {
    const paymentId = query.vnp_TxnRef;

    // Lock dòng để tránh race condition
    const payment = await paymentRepository.findByIdWithBooking(paymentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payment) {
      await t.rollback();

      return {
        RspCode: "01",
        Message: "Order not found",
      };
    }

    // Kiểm tra số tiền
    const expectedAmount = Math.round(payment.amount * 100);

    if (Number(query.vnp_Amount) !== expectedAmount) {
      await t.rollback();

      return {
        RspCode: "04",
        Message: "Invalid amount",
      };
    }

    if (payment.payment_status === "paid") {
      await t.rollback();

      return {
        RspCode: "02",
        Message: "Order already confirmed",
      };
    }

    if (query.vnp_ResponseCode === "00") {
      await paymentRepository.update(
        payment,
        {
          payment_status: "paid",
          transaction_id: query.vnp_TransactionNo,
        },
        {
          transaction: t,
        }
      );

      await paymentRepository.updateBooking(
        payment.booking_id,
        {
          status: "confirmed",
          payment_status: "paid",
        },
        {
          transaction: t,
        }
      );
    } else {
      await paymentRepository.update(
        payment,
        {
          payment_status: "failed",
        },
        {
          transaction: t,
        }
      );

      await paymentRepository.updateBooking(
        payment.booking_id,
        {
          payment_status: "failed",
        },
        {
          transaction: t,
        }
      );
    }

    await t.commit();

    return {
      RspCode: "00",
      Message: "Confirm Success",
    };
  } catch (e) {
    await t.rollback();

    return {
      RspCode: "99",
      Message: "Unknown error",
    };
  }
};

// Verify signature MoMo
const verifyMomoSignature = (body) => {
  const {
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
  } = body;

  const rawSignature =
    `accessKey=${process.env.MOMO_ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const expected = crypto
    .createHmac("sha256", process.env.MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  return expected === body.signature;
};

// IPN — cập nhật DB
const handleMomoIPNService = async (body) => {
  if (!verifyMomoSignature(body)) {
    throw new Error("Invalid MoMo signature");
  }

  const { orderId, resultCode, transId } = body;

  const t = await sequelize.transaction();

  try {
    const payment = await paymentRepository.findById(orderId, {
      transaction: t,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // thêm kiểm tra amount
    if (Number(body.amount) !== Number(payment.amount)) {
      await t.rollback();

      throw new Error("Invalid amount");
    }

    if (payment.payment_status === "paid") {
      await t.rollback();

      return {
        message: "Already processed",
      };
    }

    if (Number(resultCode) === 0) {
      await paymentRepository.update(
        payment,
        {
          payment_status: "paid",
          transaction_id: transId,
        },
        {
          transaction: t,
        }
      );

      await paymentRepository.updateBooking(
        payment.booking_id,
        {
          status: "confirmed",
          payment_status: "paid",
        },
        {
          transaction: t,
        }
      );
    } else {
      await paymentRepository.update(
        payment,
        {
          payment_status: "failed",
        },
        {
          transaction: t,
        }
      );

      await paymentRepository.updateBooking(
        payment.booking_id,
        {
          payment_status: "failed",
        },
        {
          transaction: t,
        }
      );
    }

    await t.commit();

    return {
      message: "IPN processed",
    };
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

// Return — chỉ đọc DB, trả về FE hiển thị
const handleMomoReturnService = async (query) => {
  const { orderId } = query;

  const payment = await paymentRepository.findById(orderId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  return {
    payment_status: payment.payment_status,
    message:
      payment.payment_status === "paid" ? "Payment success" : "Payment failed",
  };
};

module.exports = {
  createPaymentService,
  handleVnpayReturnService,
  handleMomoReturnService,
  handleMomoIPNService,
  handleVnpayIPNService,
};
