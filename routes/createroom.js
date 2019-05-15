const express = require('express');
const moment = require('moment');
const { check, body } = require('express-validator/check');

const roomController = require('../controllers/createroom');

const router = express.Router();

router.get("/", roomController.createRoom);
router.get("/createroom", roomController.getCreateRoom);
router.post(
    "/createroom", 
    [
        body('email')
          .isEmail()
          .withMessage('Please enter a valid email address.')
          .normalizeEmail(),
        body('start_time')
          .custom((value, { req }) => {
            let localTime  = moment.utc(moment.utc().format()).toDate();
            localTime = moment(localTime);
            if(!moment(value).isSameOrAfter(localTime)){
                throw new Error('Invalid Time!!');
            }
            return true;
          }),
        body('invitee_emails')
          .custom((value, { req }) => {
            value = value.substring(1, value.length - 1);
            if( value.length === 0){
                throw new Error('Enter atleast 1 Invitee Email');
            }
            return true;
          }),
          body('duration')
          .isInt()
          .custom((value, { req }) => {
            if( value < 1 || value > 20){
                throw new Error('Invalid duration');
            }
            return true;
          })
    ],
    roomController.postCreateRoom);

module.exports = router;