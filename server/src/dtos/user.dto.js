module.exports = class UserDto {
    constructor(model) {
        this.id = model._id.toString();
        this.email = model.email;
        this.nickname = model.nickname;
        this.isActivated = model.isActivated;
    }
};