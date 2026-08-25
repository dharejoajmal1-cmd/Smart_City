require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

(async () => {
  try {
    console.log("DNS:", dns.getServers());

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected");
    console.log(conn.connection.host);
  } catch (err) {
    console.error(err);
  }
})();