const router = require('express').Router()

const { User, Blog, ReadingList } = require('../models')

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  // Handle specific errors
  if (error.name === 'SequelizeValidationError') {
    const errorMessages = error.errors.map(e => e.message)
    return res.status(400).json({ error: errorMessages });
  }

  // Other potential errors
  return res.status(500).json({ error: error.message });
};

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

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: [
      {
      model: Blog
      },
      // {
      //   model: ReadingList,
      //   as: 'readingLists',
      //   through: {
      //     attributes: ['user_id', 'blog_id']
      //   }
      // }
    ]
  })
  res.json(users)
})

router.get('/:id', errorHandler, async (req, res, next) => {
  try {
    const userId = req.params.id

    let readFilter = {}
    if (req.query.read === 'true') {
      readFilter.read = true
    } else if (req.query.read === 'false') {
      readFilter.read = false
    }

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Blog,
          as: 'UserReadingList',
          attributes: { exclude: ['createdAt', 'updatedAt', 'userId']},
          through: {
            attributes: ['read', 'id'],
            where: readFilter
          }
        }
      ],
      // where: {
      //   read: req.query.read === 'true'
      // }
    })

    if (!user) {
      return res.status(404).json({ error: "user not found"})
    }

    res.json({
      name: user.name,
      username: user.username,
      readings: user.UserReadingList
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    // return res.status(400).json({ error })
    next(error)
  }
})

router.put('/:username', tokenExtractor, async (req, res) => {
  try {
    const { username } = req.params
    const { newUsername } = req.body
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.username = newUsername
    await user.save()
    res.json(user)
  } catch (error) {
    console.log("error updating name: ", error)
    return res.status(400).json({ error: 'Failed to update username'})
  }
})

router.use(errorHandler)

module.exports = router