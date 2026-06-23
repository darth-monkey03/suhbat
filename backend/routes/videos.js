const express = require('express');
const router = express.Router();
const { getVideos, getVideo, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');

router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', createVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

module.exports = router;
