/**
 * Defines a class that represents firebase client code that can be shared between platforms.
 */
var FirebaseCommon = (function () {
    function FirebaseCommon(instance) {
        this.instance = null;
        this.instance = instance;
    }
    // this implementation is actually the same for both platforms, woohoo :)
    FirebaseCommon.prototype.logout = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.instance.unauth();
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.logout: " + ex);
                reject(ex);
            }
        });
    };
    FirebaseCommon.prototype.unauth = function () {
        return this.logout();
    };
    FirebaseCommon.LoginType = {
        ANONYMOUS: "anonymous",
        PASSWORD: "password"
    };
    FirebaseCommon.QueryOrderByType = {
        KEY: "key",
        VALUE: "value",
        CHILD: "child",
        PRIORITY: "priority"
    };
    FirebaseCommon.QueryLimitType = {
        FIRST: "first",
        LAST: "last"
    };
    FirebaseCommon.QueryRangeType = {
        START_AT: "startAt",
        END_AT: "endAt",
        EQUAL_TO: "equalTo"
    };
    return FirebaseCommon;
})();
exports.FirebaseCommon = FirebaseCommon;
;
