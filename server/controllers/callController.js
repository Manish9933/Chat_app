import CallLog from "../models/CallLog.js";
import { encrypt, decrypt } from "../lib/encryption.js";

/**
 * 🔐 ENCRYPTED CALL LOG FIELDS
 * type & status are encrypted at rest — even if DB is breached,
 * attackers can't tell if calls were audio/video or their outcome
 */
const ENCRYPTED_CALL_FIELDS = ["type", "status"];

/**
 * Decrypt a single call log for API response
 */
const decryptCallLog = (log) => {
  const obj = log.toObject ? log.toObject() : { ...log };
  if (obj.type) obj.type = decrypt(obj.type);
  if (obj.status) obj.status = decrypt(obj.status);
  return obj;
};

/**
 * 🔐 Save an encrypted call log
 */
export const saveCallLog = async (req, res) => {
  try {
    const { callerId, receiverId, type, status, duration } = req.body;

    // 🔐 Encrypt sensitive fields before storage
    const log = await CallLog.create({
      callerId,
      receiverId,
      type: encrypt(type),
      status: encrypt(status),
      duration: duration || 0,
    });

    // Return decrypted version to the client
    res.json({ success: true, log: decryptCallLog(log) });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

/**
 * 🔐 Fetch & decrypt all call logs for current user
 */
export const getCallLogs = async (req, res) => {
  try {
    const logs = await CallLog.find({
      $or: [{ callerId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate("callerId", "-password")
      .populate("receiverId", "-password")
      .sort({ createdAt: -1 });

    // 🔐 Decrypt all logs before sending to client
    const decryptedLogs = logs.map(decryptCallLog);

    res.json({ success: true, logs: decryptedLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch call logs" });
  }
};
