const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')

const prisma = new PrismaClient()

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
    const newFile = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: '',
        folderId: folderId
      }
    })

    const fileName = `${newFile.id}${path.extname(req.file.originalname)}`
    const oldPath = path.join('uploads', req.file.filename)
    const newPath = path.join('uploads', fileName)

    fs.renameSync(oldPath, newPath)

    const fileUrl = `/uploads/${fileName}`

    await prisma.file.update({
      where: { id: newFile.id },
      data: { url: fileUrl }
    })

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
  const { originalname, path: tempPath, size } = req.file

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId }
    })

    if (!folder) {
      return res.status(404).send('Folder not found')
    }

    const newFile = await prisma.file.create({
      data: {
        name: originalname,
        size: size,
        url: '',
        folderId: folderId
      }
    })

    const newFileName = `${newFile.id}${path.extname(originalname)}`
    const newPath = path.join('uploads', newFileName)

    fs.renameSync(tempPath, newPath)

    const fileUrl = `/uploads/${newFileName}`

    await prisma.file.update({
      where: { id: newFile.id },
      data: { url: fileUrl }
    })

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
