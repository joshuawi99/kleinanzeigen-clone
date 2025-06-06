const multer = require('multer');
const path = require('path');

// Speicherort und Dateinamen definieren
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Pfad zum Speicherordner (ggf. anpassen)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Dateiname mit Originalendung speichern
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Dateifilter (nur Bilder erlauben)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Nur Bilder sind erlaubt!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB
});

module.exports = upload;
