const jwt   = require('jsonwebtoken')
const Admin = require('./models/Admin')

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorised' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const admin   = await Admin.findById(payload.id).select('-password')
    if (!admin) return res.status(401).json({ message: 'Unauthorised' })
    req.admin = admin
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
