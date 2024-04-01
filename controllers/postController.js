const Post = require("../models/postModels")
const fs = require("fs")
const path = require("path")
const { v4: uuid } = require("uuid")
const User = require("../models/userModels")

const HttpError = require("../models/errorModels")

// create a post
//  post: api/posts
// protected

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body
    if (!title || !category || !description || !req.files) {
      return next(new HttpError("Fill in all fields and choose thumbnail.", 422))
    }

    const { thumbnail } = req.files

    // check the file size
    if (thumbnail.size > 2000000) {
      return next(new HttpError("Thumbnail too big. File should be less than 2mb"))
    }

    let fileName = thumbnail.name
    let splittedFilename = fileName.split(".")
    let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
    thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename), async (err) => {
      if (err) {
        return next(new HttpError(err))
      } else {
        const newPost = await Post.create({ title, category, description, thumbnail: newFilename, creator: req.user.id })

        if (!newPost) {
          return next(new HttpError("Post couldn't be created", 422))
        }

        // find user and increase post count by 1

        const currentUser = await User.findById(req.user.id)
        const userPostCount = currentUser.posts + 1
        await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })
        res.status(201).json(newPost)
      }
    })
  } catch (error) {
    return next(new HttpError(error))
  }
}

// get all posts
// get: api/get-posts
// protected

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 })
    res.status(200).json(posts)
  } catch (error) {
    return next(new HttpError(error))
  }
}

// get single post
// get: api/posts/:id
// unprotected

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id
    const post = await Post.findById(postId)
    if (!post) {
      return next(new HttpError("Post not found", 404))
    }
    res.status(200).json(post)
  } catch (error) {
    return next(new HttpError(error))
  }
}

// get posts by category
// get: api/posts/categories/:category
// unprotected

const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 })
    res.status(200).json(catPosts)
  } catch (error) {
    return next(new HttpError(error))
  }
}

// get user/author post
// get: api/posts/users/:id
// unprotected

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 })
    res.status(200).json(posts)
  } catch (error) {
    return next(new HttpError(error))
  }
}

// edit post
// patch: api/posts/:id
// protected

const editPost = async (req, res, next) => {
  try {
    let fileName
    let newFilename
    let updatedPost
    const postId = req.params.id
    let { title, category, description } = req.body

    if (!title || !category || !description.length > 12) {
      return next(new HttpError("Fill in all fields.", 422))
    }

    if (!req.files) {
      updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true })
    } else {
      // get old post from database

      const oldPost = await Post.findById(postId)

      if (req.user.id == oldPost.creator) {
        // delete old thumbnail from upload
        fs.unlink(path.join(__dirname, "..", "uploads", oldPost.thumbnail), async (err) => {
          if (err) {
            return next(new HttpError(err))
          }
        })

        // upload new thumbnail

        const { thumbnail } = req.files
        // checking the file size

        if (thumbnail.size > 2000000) {
          return next(new HttpError("Thumbnail too big. Should be less tham 2mb"))
        }

        fileName = thumbnail.name
        let splittedFilename = fileName.split(".")
        newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        thumbnail.mv(path.join(__dirname, "..", "uploads", newFilename), async (err) => {
          if (err) {
            return next(new HttpError(err))
          }
        })

        updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename }, { new: true })
      }
    }

    if (!updatedPost) {
      return next(new HttpError("couldnot update the post.", 400))
    }

    res.status(200).json(updatedPost)
  } catch (error) {
    return next(new HttpError(error))
  }
}

// delete post
// delete: api/posts/:id
// protected

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id
    if (!postId) {
      return next(new HttpError("Post unavailable.", 400))
    }
    const post = await Post.findById(postId)
    const fileName = post?.thumbnail

    if (req.user.id == post.creator) {
      // delete thumbnail from uploads folder

      fs.unlink(path.join(__dirname, "..", "uploads", fileName), async (err) => {
        if (err) {
          return next(new HttpError(err))
        } else {
          await Post.findByIdAndDelete(postId)
          // find user and reduce the post count by 1
          const currentUser = await User.findById(req.user.id)
          const userPostCount = currentUser?.posts - 1
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })
          // res.json(`Post ${postId} deleted successfully`)
        }
      })
    } else {
      return next(new HttpError("Post couldn't be deleted", 403))
    }

    res.json(`post ${postId} deleted successfully.`)
  } catch (error) {
    return next(new HttpError(error))
  }
}

module.exports = { createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost }
