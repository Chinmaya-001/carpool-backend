const phoneNumberVerify = (phoneNumber) => {
    
    if(/^[1-9]\d{8}$/.test(phoneNumber)){
        return true
    } else {
        return false
    }


}

module.exports = {
    phoneNumberVerify,
}