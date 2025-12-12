import CallLog from "../models/CallLog.js";

export const saveCallLog = async (req, res) => {
  try {
    const log = await CallLog.create(req.body);
    res.json({ success: true, log });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export const getCallLogs = async (req, res) => {
  const logs = await CallLog.find({
    $or: [{ callerId: req.user._id }, { receiverId: req.user._id }],
  })
    .populate("callerId", "-password")
    .populate("receiverId", "-password")
    .sort({ createdAt: -1 });

  res.json({ success: true, logs });
};
