const router = require('express').Router()

const { Blog, User } = require('../models')

const { sequelize } = require('../util/db')

router.get('/', async (req, res) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        'author',
        [sequelize.fn('COUNT', sequelize.col('id')), 'articles'],  // Count of blogs for each author
        [sequelize.fn('SUM', sequelize.col('likes')), 'likes']     // Sum of likes for each author
      ],
      group: ['author'],
      raw: true,
      order: [
        [sequelize.literal('likes'), 'DESC']
      ]
    })
    res.json(authors)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Unexpected error with authors' })
  }
})

module.exports = router