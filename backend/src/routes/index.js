const express = require("express");

const authRouter = require("./authRoute");
const userRouter = require("./userRoute");
const menuRouter = require("./menuRoute")
const menuPackageRouter = require("./menuPackageRoute")
const bookingRouter = require("./bookingRoute");
const reviewRouter = require("./reviewRoute");
const customerRouter = require("./customerRoute");
const adminRouter = require("./adminRoute");
const paymentSlipRouter = require("./paymentSlipRoute");
const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/menus", menuRouter)
rootRouter.use("/menu-packages", menuPackageRouter)
rootRouter.use("/bookings", bookingRouter);
rootRouter.use("/reviews", reviewRouter);
rootRouter.use("/customer", customerRouter);
rootRouter.use("/admin", adminRouter);
rootRouter.use("/payment-slips", paymentSlipRouter);
module.exports = rootRouter;
