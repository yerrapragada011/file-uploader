exports.uploadFileGet = async (req, res) => {
  res.render('upload')
}

exports.uploadFilePost = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.')
  }

  // For now, files are saved to the 'uploads/' directory
  res.send('File uploaded successfully.')
}
