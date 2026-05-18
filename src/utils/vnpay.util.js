// Hàm băm SHA512, sắp xếp params và tạo URL thanh toán VNPAY
const crypto = require("crypto");
const qs = require("qs");

const sortObject = (obj) => {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }

  return sorted;
};

const generateSignature = (params, secretKey) => {
  const signData = qs.stringify(params, {
    encode: false,
  });
  const hmac = crypto.createHmac("sha512", secretKey);
  return hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
};

module.exports = {
  sortObject,
  generateSignature,
};
