const { PrismaClient } = require('@prisma/client')

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
  if (!req.file) {
    return res.status(400).send('No file uploaded.')
  }

  const { folderId } = req.body

  if (!folderId || folderId === '') {
    return res
      .status(400)
      .send('No folder selected. Please select a folder to upload the file.')
  }

  await prisma.file.create({
    data: {
      name: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
      folderId: folderId
    }
  })

  res.redirect('/')
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
  const folderId = req.params.id
  const { originalname, path, size } = req.file

  await prisma.file.create({
    data: {
      name: originalname,
      url: path,
      size: size,
      folderId: folderId
    }
  })

  res.redirect(`/folders/${folderId}`)
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
