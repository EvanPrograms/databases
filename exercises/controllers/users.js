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

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Blog,
          as: 'UserReadingList',
          attributes: { exclude: ['createdAt', 'updatedAt', 'userId']},
          through: {
            attributes: []
          }
        }
      ]
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

  // const user = await User.findByPk(req.params.id)
  // if (user) {
  //   res.json(user)
  // // if (user) {
  // //   res.json({
  // //     username: user.username,
  // //     name: user.name,
  // //     readings:
  // //   })
  // } else {
  //   res.status(404).end()
  // }
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

router.put('/:username', async (req, res) => {
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