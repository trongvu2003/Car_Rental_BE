const crypto = require("crypto");
const qs = require("qs");

const sortObject = (obj) => {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

// Dùng để KÝ dữ liệu khi tạo URL thanh toán (encode = false theo chuẩn VNPAY)
const generateSignature = (params, secretKey) => {
  const signData = qs.stringify(params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  return hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
};

// Dùng để XÁC THỰC chữ ký khi VNPAY gọi về (return / IPN)
const verifySignature = (query, secretKey) => {
  const vnp_Params = { ...query };
  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  const sortedParams = sortObject(vnp_Params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const checkSum = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  return checkSum === secureHash;
};

module.exports = {
  sortObject,
  generateSignature,
  verifySignature,
};
