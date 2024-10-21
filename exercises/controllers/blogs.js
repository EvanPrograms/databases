const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { Blog, User } = require('../models')

const { Op } = require('sequelize')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  // Handle specific errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Validation error' });
  }

  // Other potential errors
  return res.status(500).json({ error: 'An unexpected error occurred' });
};

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.substring]: req.query.search } },
      { author: { [Op.substring]: req.query.search } }
    ]
  }

  const blogs = await Blog.findAll({
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [
      ['likes', 'DESC']
    ]
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
  } catch(error) {
    next(error)
  }
})

router.delete('/:id', tokenExtractor, blogFinder, async (req, res) => {
  try { 
    if (!req.blog) {
      return res.status(404).json({ error: "blog not found" })
    }

    console.log('User ID from token:', req.decodedToken.id);
    console.log('Blog user ID:', req.blog.userId);

    if (req.blog.userId !== req.decodedToken.id) {
      return res.status(403).json({ error: "Only the creator can delete this blog" })
    }

    await req.blog.destroy()
    res.status(204).end()
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ error: "an error occurred while deleting the blog" })
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog.likes)
  } catch (error) {
    next(error)
  }
})

router.use(errorHandler)

module.exports = router