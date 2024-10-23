const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const ActiveSession = require('../models/activeSession.js')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      req.decodedToken = jwt.verify(token, SECRET)

      const session = await ActiveSession.findOne({ where: { token }})
      if (!session) {
        return res.status(401).json({ error: 'Session expired or invalid'})
      }
      next()
    } catch (error) {
      return res.status(401).json({ error: 'Token Invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
}

router.delete('/', tokenExtractor, async (req, res) => {
  await ActiveSession.destroy({ where: { token: req.get('authorization').substring(7) }})
  res.status(204).end()
})

module.exports = router