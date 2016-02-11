var FirebaseCommon = (function () {
    function FirebaseCommon(instance) {
        this.LoginType = {
            ANONYMOUS: "anonymous",
            PASSWORD: "password"
        };
        this.QueryOrderByType = {
            KEY: "key",
            VALUE: "value",
            CHILD: "child",
            PRIORITY: "priority"
        };
        this.QueryLimitType = {
            FIRST: "first",
            LAST: "last"
        };
        this.QueryRangeType = {
            START_AT: "startAt",
            END_AT: "endAt",
            EQUAL_TO: "equalTo"
        };
        this.instance = null;
        this.instance = instance;
    }
    // this implementation is actually the same for both platforms, woohoo :)
    FirebaseCommon.prototype.logout = function (arg) {
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
    return FirebaseCommon;
})();
exports.FirebaseCommon = FirebaseCommon;
;
