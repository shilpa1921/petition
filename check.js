module.exports.checkAge = (age) => {
    if (age == "") {
        return null;
    } else {
        return age;
    }
};

module.exports.checkUrl = (url) => {
    if (
        url != "" &&
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        return null;
    } else {
        return url;
    }
};
