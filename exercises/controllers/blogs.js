const router = require('express').Router()

const { Blog } = require('../models')

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  // Handle specific errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Validation error' });
  }

  // Other potential errors
  return res.status(500).json({ error: 'An unexpected error occurred' });
};

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
  res.json(blogs)
})

router.post('/', async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body)
    res.json(blog)
  } catch(error) {
    next(error)
  }
})

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    await req.blog.destroy()
  }
  res.status(204).end()
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