import multer from "multer"

const storage = multer.diskStorage({    // cb is call back
    destination: function (req, file, cb) {
      cb(null, './public/temp')  // Place where you want to keep your file
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round
    //   (Math.random() * 1E9)

      cb(null, file.originalname) //by writing this user upload file of that name that name shown here also
    }
  })
  
  export const upload = multer({ 
    storage,
})
