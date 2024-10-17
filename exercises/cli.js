const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')

app.use(express.json())

app.use('/api/blogs', blogsRouter)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()

// require('dotenv').config()
// const { Sequelize, Model, DataTypes } = require('sequelize')
// const express = require('express')
// const app = express()

// app.use(express.json())

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   // dialectOptions: {
//   //   ssl: {
//   //     require: true,
//   //     rejectUnauthorized: false
//   //   }
//   // },
// });

// // const main = async () => {
// //   try {
// //     // await sequelize.authenticate()
// //     const blogs = await sequelize.query("SELECT * FROM blogs", { type: QueryTypes.SELECT
// //     })
// //     console.log(blogs)
// //     sequelize.close()
// //   } catch (error) {
// //     console.error('Unable to connect to the database:', error)
// //   }
// // }

// // main()

// class Blog extends Model {}
// Blog.init({
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   author: {
//     type: DataTypes.TEXT,
//   },
//   url: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   title: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   likes: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   sequelize,
//   underscored: true,
//   timestamps: false,
//   modelName: 'blog'
// })

// app.get('/api/blogs', async (req, res) => {
//   const blogs = await Blog.findAll()
//   res.json(blogs)
// })

// app.post('/api/blogs', async (req, res) => {
//   console.log(req.body)
//   const blog = await Blog.create(req.body)
//   res.json(blog)
// })

// app.delete('/api/blogs/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await Blog.destroy({
//       where: {
//         id: id
//       }
//     })

//     if (result === 0) {
//       return res.status(404).json({error: 'Blog not found'})
//     }
//     res.status(204).end()
//   } catch (error) {
//     console.error('Error deleting blog:', error)
//     res.status(500).json({ error: 'An error occurred' })
//   }
// })

// const PORT = process.env.PORT || 3001
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })