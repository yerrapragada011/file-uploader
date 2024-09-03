const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

exports.uploadFileGet = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id }
    })
    res.render('upload-file', { folders: folders })
  } catch (error) {
    console.error('Error fetching folders:', error)
    res.status(500).send('Server Error')
  }
}

exports.uploadFilePost = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).render('error', { message: req.fileValidationError })
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded.')
  }

  const { folderId } = req.body

  if (!folderId || folderId === '') {
    return res
      .status(400)
      .send('No folder selected. Please select a folder to upload the file.')
  }

  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: `uploads/${folderId}`
    })

    const newFile = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: cloudinaryResponse.secure_url,
        folderId: folderId
      }
    })

    fs.unlinkSync(req.file.path)

    res.redirect('/')
  } catch (error) {
    console.error('Error saving file:', error)
    res.status(500).render('error', { message: 'Server Error' })
  }
}

exports.createFolderGet = async (req, res) => {
  res.render('create-folder', { user: req.user })
}

exports.createFolderPost = async (req, res) => {
  const { name } = req.body
  await prisma.folder.create({
    data: {
      name: name,
      userId: req.user.id
    }
  })
  res.redirect('/')
}

exports.folderDetailGet = async (req, res) => {
  const folderId = req.params.id
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: { files: true }
  })

  if (!folder) {
    return res.status(404).send('Folder not found')
  }

  res.render('folder', { folder: folder })
}

exports.folderFileUpload = async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).render('error', { message: req.fileValidationError })
  }

  if (!req.file) {
    return res.status(400).render('error', { message: 'No file uploaded.' })
  }

  const folderId = req.params.id

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    })

    if (!folder) {
      return res.status(404).send('Folder not found')
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: `uploads/${folderId}`
    })

    const newFile = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: cloudinaryResponse.secure_url,
        folderId: folderId
      }
    })

    fs.unlinkSync(req.file.path)

    res.redirect(`/folders/${folderId}`)
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).render('error', { message: 'Server Error' })
  }
}

exports.updateFolderName = async (req, res) => {
  const folderId = req.params.id
  const { name } = req.body

  try {
    await prisma.folder.update({
      where: { id: folderId },
      data: { name: name }
    })

    res.redirect(`/`)
  } catch (error) {
    console.error('Error updating folder:', error)
    res.status(500).send('Server Error')
  }
}

exports.deleteFolder = async (req, res) => {
  const folderId = req.params.id

  try {
    await prisma.file.deleteMany({
      where: { folderId: folderId }
    })

    await prisma.folder.delete({
      where: { id: folderId }
    })

    res.redirect('/')
  } catch (error) {
    console.error('Error deleting folder:', error)
    res.status(500).send('Server Error')
  }
}

exports.viewFileGet = async (req, res) => {
  const fileId = req.params.id

  console.log('Request ID:', fileId)

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    console.log('Database File:', file)

    if (!file) {
      return res.status(404).send('File not found')
    }

    res.render('view-file', { file: file })
  } catch (error) {
    console.error('Error fetching file:', error)
    res.status(500).send('Server Error')
  }
}
