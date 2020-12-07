const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode, containsSpecialCharacters} = require('../util/validators');

exports.getNearbyServices = (request, response) =>
{
    
}