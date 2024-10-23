const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { Blog, User, ReadingList } = require('../models')

const { Op } = require('sequelize')

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

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  // Handle specific errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message) });
  }

  // Other potential errors
  return res.status(500).json({ error: 'An unexpected error occurred' });
};

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.findByPk(req.body.blogId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const readingListEntry = await ReadingList.create({
      userId: user.id,
      blogId: blog.id
    })

    res.json(readingListEntry)
  } catch(error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, async (req, res, next) => {
    const user = await User.findByPk(req.decodedToken.id)
    const entry = await ReadingList.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (entry.userId !== user.id) {
      return res.status(403).json({ error: 'You can only mark blogs in your own reading list as read' });
    }

    try {
      entry.read = req.body.read
      await entry.save()
      res.json(entry)
    } catch (error) {
      next(error)
      }
})

router.use(errorHandler)

module.exports = router