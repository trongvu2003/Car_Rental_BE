const qs = require("qs");
const { Payment, Booking, sequelize } = require("../models");
const { sortObject, generateSignature } = require("../utils/vnpay.util");

const createPaymentService = async (booking_id, payment_method, req) => {
  const t = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(booking_id, {
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const payment = await Payment.create(
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
      await booking.update(
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
      const ipAddr = req.headers["x-forwarded-for"] || req.ip;

      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: process.env.VNPAY_TMNCODE, //Mã merchant
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

      // Tạo chữ ký bảo mật
      const secureHash = generateSignature(
        vnp_Params,
        process.env.VNPAY_HASHSECRET
      );

      vnp_Params["vnp_SecureHash"] = secureHash;

      const paymentUrl =
        process.env.VNPAY_URL +
        "?" +
        qs.stringify(vnp_Params, {
          encode: false,
        });

      await t.commit();

      return {
        payment_url: paymentUrl,
      };
    }

    // MOMO
    // if (payment_method === "momo") {
    //   await t.commit();

    //   return {
    //     message: "MoMo coming soon",
    //   };
    // }

    throw new Error("Invalid payment method");
  } catch (e) {
    await t.rollback();

    throw e;
  }
};

// HANDLE VNPAY RETURN
const handleVnpayReturnService = async (query) => {
  const t = await sequelize.transaction();
  try {
    const paymentId = query.vnp_TxnRef;
    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Booking,
          as: "booking",
        },
      ],

      transaction: t,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // chống update nhiều lần
    if (payment.payment_status === "paid") {
      return {
        message: "Already processed",
      };
    }

    // SUCCESS
    if (query.vnp_ResponseCode === "00") {
      await payment.update(
        {
          payment_status: "paid",
          transaction_id: query.vnp_TransactionNo,
        },
        {
          transaction: t,
        }
      );

      await Booking.update(
        {
          status: "confirmed",
          payment_status: "paid",
        },
        {
          where: {
            id: payment.booking_id,
          },
          transaction: t,
        }
      );
    }

    // FAILED
    await Booking.update(
      {
        payment_status: "failed",
      },
      {
        where: {
          id: payment.booking_id,
        },
        transaction: t,
      }
    );
    await t.commit();
    return {
      message: "Payment failed",
    };
  } catch (e) {
    await t.rollback();

    throw e;
  }
};

module.exports = {
  createPaymentService,
  handleVnpayReturnService,
};
