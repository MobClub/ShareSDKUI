/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/8/6
 * Time: 上午10:31
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Kaixin";

/**
 * 开心网应用信息键名定义
 * @type {{ApiKey: string, SecretKey: string, RedirectUri: string, ConvertUrl: string}}
 */
var KaiXinAppInfoKeys = {
    "ApiKey"            : "api_key",
    "SecretKey"         : "secret_key",
    "RedirectUri"       : "redirect_uri",
    "ConvertUrl"        : "covert_url",
    "Scopes"            : "auth_scopes"
};

/**
 * 开心网
 * @param type  平台类型
 * @constructor
 */
function KaiXin (type)
{
    this._type = type;
    this._appInfo = {};
    this._authScopes = null;
    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
KaiXin.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
KaiXin.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
KaiXin.prototype.name = function ()
{
    
    if(this._currentLanguage === "zh-Hans")
    {
        return "开心网";
    }
    else
    {
        return "KaiXin";
    }
    
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
KaiXin.prototype.apiKey = function ()
{
    if (this._appInfo[KaiXinAppInfoKeys.ApiKey] !== undefined) 
    {
        return this._appInfo[KaiXinAppInfoKeys.ApiKey];
    }

    return null;
};

/**
 * 获取应用Key
 * @returns {*} 应用密钥
 */
KaiXin.prototype.secretKey = function ()
{
    if (this._appInfo[KaiXinAppInfoKeys.SecretKey] !== undefined) 
    {
        return this._appInfo[KaiXinAppInfoKeys.SecretKey];
    }

    return null;
};

/**
 * 获取应用密钥
 * @returns {*} 回调地址
 */
KaiXin.prototype.redirectUri = function ()
{
    if (this._appInfo[KaiXinAppInfoKeys.RedirectUri] !== undefined) 
    {
        return this._appInfo[KaiXinAppInfoKeys.RedirectUri];
    }

    return null;
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
KaiXin.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Kaixin + "-" + this.apiKey();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
KaiXin.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[KaiXinAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[KaiXinAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取服务器应用信息
 * @param value 应用信息
 * @returns {*}
 */
KaiXin.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
        this._authScopes = this._checkAuthScopes(value);
    }

};

/**
 * 保存配置信息
 */
KaiXin.prototype.saveConfig = function ()
{
    var self = this;
    var domain = "SSDK-Platform";
    $mob.ext.getCacheData("currentApp", false, domain, function (data) {

        if (data != null)
        {
            var curApps = data.value;
            if (curApps == null)
            {
                curApps = {};
            }

            curApps["plat_" + self.type()] = self.apiKey();
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
KaiXin.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
KaiXin.prototype.authorize = function (sessionId, settings)
{
    var error = null;
    if (this._isAvailable())
    {
        if (settings == null)
        {
            settings = {};
        }

        if (settings ["scopes"] == null && this._authScopes == null)
        {
            //设置默认权限
            settings ["scopes"] = [
                "user_birthday",
                "user_intro",
                "user_education",
                "user_career",
                "user_online",
                "user_bodyform",
                "user_blood",
                "user_marriage",
                "create_records",
                "user_records"
            ];
        }

        //进行网页授权
        this._webAuthorize(sessionId, settings);
    }
    else
    {

        var error_message = null;
    
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + this.name() + "］应用信息无效!";
        }
        else
        {
            error_message = "Platform［" + this.name() + "］Invalid congfiguration!";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvaildPlatform,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }

};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
KaiXin.prototype.handleAuthCallback = function (sessionId, callbackUrl)
{
    var error = null;
    var self = this;
    var error_message;
    var urlInfo = $mob.utils.parseUrl(callbackUrl);
    if (urlInfo != null && urlInfo.fragment != null)
    {
        var params = $mob.utils.parseUrlParameters(urlInfo.fragment);
        if (params != null)
        {
            self._succeedAuthorize(sessionId, params);
        }
        else
        {
            error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "无效的授权回调:[" + callbackUrl + "]";
            }
            else
            {
                error_message = "invalid callback url:[" + callbackUrl + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
                "error_message" : error_message
            };
            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }
    }
    else
    {
        error_message = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "无效的授权回调:[" + callbackUrl + "]";
        }
        else
        {
            error_message = "invalid callback url:[" + callbackUrl + "]";
        }

        error = {
            "error_code" : $mob.shareSDK.errorCode.InvalidAuthCallback,
            "error_message" : error_message
        };
        $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 取消授权
 */
KaiXin.prototype.cancelAuthorize = function ()
{
    this._setCurrentUser(null, null);
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
KaiXin.prototype.addFriend = function (sessionId, user, callback)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持添加好友方法!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support adding friends";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 获取好友列表
 * @param cursor        分页游标
 * @param size          分页尺寸
 * @param callback      方法回调，回调方法声明如下:function (state, data);
 */
KaiXin.prototype.getFriends = function (cursor, size, callback)
{

    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持获取好友列表方法!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support getting friend list";
    }

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
KaiXin.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var image = null;
    var self = this;

    //获取分享统计标识
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData = {
        "@flags" : flags
    };

    //先判断是否使用客户端分享
    var type = $mob.shareSDK.getShareParam(this.type(), parameters, "type");
    if (type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if (type === $mob.shareSDK.contentType.Auto)
    {
        type = this._getShareType(parameters);
    }

    var error_message;
    var error;

    var params = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Text:
        {
            text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
            if (text != null)
            {
                params = {
                    "content" : text
                };
                self._getCurrentUser(function (user) {

                    self._convertUrl([text], function(data) {

                        params["content"] = data.result[0];
                        self.callApi("https://api.kaixin001.com/records/add.json", "POST", params, null, function (state, data) {

                            var resultData = data;
                            if (state === $mob.shareSDK.responseState.Success)
                            {
                                //转换数据
                                if (data != null)
                                {
                                    resultData = {};
                                    resultData["cid"] = data["rid"];
                                    resultData["text"] = text;

                                    //获取记录列表
                                    self._shareSuccess(resultData, user, userData, callback);
                                    return;
                                }
                            }


                            if (callback != null)
                            {
                                callback (state, resultData, user, userData);
                            }
                        });

                    });

                });
            }
            else
            {
                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数text不能为空!";
                }
                else
                {
                    error_message = "share param text can not be nil!";
                }


                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Image:
        {
            var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
            if (Object.prototype.toString.apply(images) === '[object Array]')
            {
                image = images [0];
            }

            if (image != null)
            {
                text = $mob.shareSDK.getShareParam(this.type(), parameters, "text");
                //判断是否为网络图片并进行下载
                this._getImagePath(image, function (imageUrl) {

                    var mimeType = "application/octet-stream";
                    if (/\.jpe?g$/.test(imageUrl))
                    {
                        mimeType = "image/jpeg";
                    }
                    else if (/\.png$/.test(imageUrl))
                    {
                        mimeType = "image/png";
                    }
                    else if (/\.gif$/.test(imageUrl))
                    {
                        mimeType = "image/gif";
                    }

                    var file = {"path" : imageUrl, "mime_type": mimeType};
                    params = {
                        "pic" : "@file(" + $mob.utils.objectToJsonString(file) + ")",
                        "content" : text
                    };

                    self._getCurrentUser(function (user) {

                        self._convertUrl([text], function(data) {

                            params["content"] = data.result[0];
                            self.callApi("https://api.kaixin001.com/records/add.json", "POST", params, null, function (state, data) {

                                var resultData = data;
                                if (state === $mob.shareSDK.responseState.Success)
                                {
                                    //转换数据
                                    if (data != null)
                                    {
                                        resultData = {};
                                        resultData["cid"] = data["rid"];
                                        resultData["text"] = text;
                                        resultData["images"] = [imageUrl];

                                        //获取记录列表
                                        self._shareSuccess(resultData, user, userData, callback);
                                        return;
                                    }
                                }


                                if (callback != null)
                                {
                                    callback (state, resultData, user, userData);
                                }

                            });

                        });

                    });

                });
            }
            else
            {

                error_message = null;
                
                if(this._currentLanguage === "zh-Hans")
                {
                    error_message = "分享参数image不能为空!";
                }
                else
                {
                    error_message = "share param image can not be nil!";
                }

                error = {
                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message" : error_message
                };

                if (callback != null)
                {
                    callback ($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        default :
        {

            error_message = null;
            
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "不支持的分享类型[" + type + "]";
            }
            else
            {
                error_message = "unsupported share type [" + type + "]";
            }

            error = {
                "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
                "error_message" : error_message
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
            break;
        }
    }
};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
KaiXin.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    if (query != null)
    {

        var error_message = null;
 
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享平台［" + self.name() + "］不支持获取其他用户资料!";
        }
        else
        {
            error_message = "Platform [" + self.name() + "］do not support getting other's userInfo!";
        }


        var error = {
            "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
            "error_message" : error_message
        };
        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error);
        }

        return;
    }

    var params = {"fields" : "uid,name,gender,hometown,city,status,logo120,logo50,birthday,bodyform,blood,marriage,trainwith,interest,favbook,favmovie,favtv,idol,motto,wishlist,intro,education,schooltype,school,class,year,career,company,dept,beginyear,beginmonth,endyear,endmonth,isStar,pinyin,online"};
    self._getCurrentUser(function (user) {

        self.callApi("https://api.kaixin001.com/users/me.json", "GET", params, null, function (state, data) {

            var resultData = data;
            if (state === $mob.shareSDK.responseState.Success)
            {
                //转换用户数据
                resultData = {
                    "platform_type" : $mob.shareSDK.platformType.Kaixin
                };
                self._updateUserInfo(resultData, data);

                //如果用户数据和授权用户相同
                if (resultData["uid"] === user["uid"])
                {
                    //将授权凭证赋值给用户信息
                    resultData["credential"] = user["credential"];
                }
            }

            if (callback != null)
            {
                callback (state, resultData);
            }

        });

    });
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
KaiXin.prototype.callApi = function (url, method, params, headers, callback)
{
    //获取当前用户信息
    var error = null;
    var self = this;
    this._getCurrentUser(function (user){

        if (user != null)
        {
            if (params == null)
            {
                //如果传入空的请求参数则创建一个新参数对象
                params = {};
            }

            //将授权用户的授权令牌作为参数进行HTTP请求
            if (user.credential != null)
            {
                params["access_token"] = user.credential.token;
            }


            $mob.ext.ssdk_callHTTPApi($mob.shareSDK.platformType.Kaixin, null, url, method, params, headers, function (data) {

                if (data != null)
                {
                    if (data ["error_code"] != null)
                    {
                        //失败
                        if (callback)
                        {
                            callback ($mob.shareSDK.responseState.Fail, data);
                        }
                    }
                    else
                    {
                        var response = $mob.utils.jsonStringToObject($mob.utils.base64Decode(data["response_data"]));
                        if (data ["status_code"] === 200)
                        {
                            if (response["error_code"] == null)
                            {
                                //成功
                                if (callback)
                                {
                                    callback ($mob.shareSDK.responseState.Success, response);
                                }
                            }
                            else
                            {
                                //失败
                                var code = $mob.shareSDK.errorCode.APIRequestFail;

                                //判断是否为尚未授权
                                switch (response["error_code"])
                                {
                                    case 40018:
                                    case 40024:
                                    case 40028:
                                    case 40050:
                                    case 40051:
                                    case 40101:
                                    case 40102:
                                    case 40109:
                                    case 40110:
                                    case 40117:
                                    case 40118:
                                        code = $mob.shareSDK.errorCode.UserUnauth;
                                        break;
                                }

                                error = {
                                    "error_code" : code,
                                    "user_data" : response
                                };

                                if (callback)
                                {
                                    callback ($mob.shareSDK.responseState.Fail, error);
                                }
                            }

                        }
                        else
                        {

                            error = {
                                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                "user_data" : response
                            };
                            if (callback)
                            {
                                callback ($mob.shareSDK.responseState.Fail, error);
                            }
                        }
                    }
                }
                else
                {
                    //失败
                    error = {
                        "error_code" : $mob.shareSDK.errorCode.APIRequestFail
                    };
                    if (callback)
                    {
                        callback ($mob.shareSDK.responseState.Fail, error);
                    }
                }

            });
        }
        else
        {

            var error_message = null;
 
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "尚未授权[" + self.name() + "]用户";
            }
            else
            {
                error_message = "Invalid Authorization [" + self.name() + "]";
            }

            //尚未授权
            error = {
                "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                "error_message" : error_message
            };
            if (callback)
            {
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }

    });
};

/**
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
KaiXin.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
KaiXin.prototype._getImagePath = function (url, callback)
{
    if (!/^(file\:\/)?\//.test(url))
    {
        //网络图片需要先下载再分享
        $mob.ext.downloadFile(url, function (data) {

            if (data.result != null)
            {
                if (callback != null)
                {
                    callback (data.result);
                }
            }
            else
            {
                if (callback != null)
                {
                    callback (null);
                }
            }

        });
    }
    else
    {
        if (callback != null)
        {
            callback (url);
        }
    }
};

/**
 * 分享成功
 * @param resultData    分享数据
 * @param user          分享用户
 * @param userData      用户数据
 * @param callback      分享回调
 * @private
 */
KaiXin.prototype._shareSuccess = function (resultData, user, userData, callback)
{
    var params = {
        "start"     : 0,
        "num"       : 0,
        "category"  : 0
    };

    this.callApi("https://api.kaixin001.com/records/me.json", "GET", params, null, function (state, data) {

        if (state === $mob.shareSDK.responseState.Success)
        {
            var records = data["data"];
            if (records != null)
            {
                for (var i = 0; i < records.length; i++)
                {
                    var item = records[i];
                    if (item["rid"] === resultData["cid"])
                    {
                        if (item["main"] != null)
                        {
                            resultData["text"] = item["main"]["content"];

                            var images = item["main"]["pics"];
                            if (images != null)
                            {
                                resultData["images"] = [];
                                for (var j = 0; j < images.length; j++)
                                {
                                    var img = images[j];
                                    resultData["images"].push(img["src"]);
                                }
                            }
                        }

                        resultData["raw_data"] = item;

                        break;
                    }
                }
            }
        }

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Success, resultData, user, userData);
        }

    });

};

/**
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
KaiXin.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        var self = this;
        this._getCurrentUser(function(user){

            $mob.shareSDK.convertUrl(self.type(), user, contents, callback);

        });
    }
    else
    {
        if (callback)
        {
            callback ({"result" : contents});
        }
    }
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
KaiXin.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {

        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

/**
 * 更新用户信息
 * @param user      用户信息
 * @param rawData   原始数据
 * @private
 */
KaiXin.prototype._updateUserInfo = function (user, rawData)
{
    if (user != null && rawData != null)
    {
        user["raw_data"] = rawData;
        user["uid"] = rawData ["uid"];
        user["nickname"] = rawData["name"];

        if (rawData["logo120"] != null)
        {
            user["icon"] = rawData["logo120"];
        }
        else if (rawData["logo50"] != null)
        {
            user["icon"] = rawData["logo50"];
        }

        if (rawData["gender"] != null)
        {
            user["gender"] = rawData["gender"];
        }
        else
        {
            user["gender"] = 2;
        }

        user["url"] = "http://www.kaixin001.com/home/?uid=" + rawData["uid"];
        user["about_me"] = rawData["intro"];
        user["verify_type"] = -1;

        //生日
        var birthday = rawData["birthday"];
        if (birthday != null)
        {
            var exp = /^(\d+)年(\d+)月(\d+)日$/;
            var res = null;
            var date = null;
            if (exp.test(birthday))
            {
                res = exp.exec(birthday);
                date = new Date(res[1], res[2] - 1, res[3], 0, 0, 0);
                user["birthday"] = date.getTime() / 1000;
            }
            else
            {
                exp = /^(\d+)后-(\d+)-(\d+)$/;
                if (exp.test(birthday))
                {
                    res = exp.exec(birthday);
                    var year = parseInt(res[1]);
                    if (year === 0)
                    {
                        year = 100;
                    }
                    date = new Date(1900 + year, res[2] - 1, res[3], 0, 0, 0);
                    user["birthday"] = date.getTime() / 1000;
                }
            }
        }

        var item = null;
        var list = null;
        var edus = rawData["education"];
        var i;
        if (edus != null)
        {
            //教育信息
            list = [];
            for (i = 0; i < edus.length; i++)
            {
                item = {};
                var edu = edus[i];

                item["school"] = edu["school"];
                item["classes"] = edu["class"];
                item["year"] = parseInt(edu["year"]);
                item["school_type"] = parseInt(edu["schooltype"]);
                list.push(item);
            }
            user["educations"] = list;
        }

        var value = null;
        var works = rawData["work"];
        if (works != null)
        {
            //工作信息
            list = [];
            for (i = 0; i < works.length; i++)
            {
                item = {};
                var work = works[i];

                item["company"] = work["company"];
                item["dept"] = work["dept"];

                if (work["beginyear"] != null)
                {
                    value = work["beginyear"] * 100;
                    if (work["beginmonth"] != null)
                    {
                        value += parseInt(work["beginmonth"]);
                    }
                    item["start_date"] = value;
                }

                if (work["endyear"] != null)
                {
                    value = work["endyear"] * 100;
                    if (work["endmonth"] != null)
                    {
                        value += parseInt(work["endmonth"]);
                    }
                    item["end_date"] = value;
                }

                list.push(item);
            }

            user["works"] = list;
        }
    }
};

/**
 * 获取当前用户信息
 * @param callback  回调方法
 * @private
 */
KaiXin.prototype._getCurrentUser = function (callback)
{
    if (this._currentUser != null)
    {
        if (callback)
        {
            callback (this._currentUser);
        }
    }
    else
    {
        var self = this;
        var domain = this.cacheDomain();
        $mob.ext.getCacheData("currentUser", false, domain, function (data) {

            self._currentUser = data != null ? data.value : null;

            if (callback)
            {
                callback (self._currentUser);
            }

        });
    }
};

/**
 * 授权成功
 * @param sessionId             会话ID
 * @param credentialRawData     授权凭证原始数据
 * @private
 */
KaiXin.prototype._succeedAuthorize = function (sessionId, credentialRawData)
{
    var self = this;

    //成功
    var credential = {
        "uid"       : credentialRawData["encodeuid"],
        "token"     : credentialRawData["access_token"],
        "expired"   : (new Date().getTime() +  credentialRawData ["expires_in"] * 1000),
        "raw_data"  : credentialRawData,
        "type"      : $mob.shareSDK.credentialType.OAuth2
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.Kaixin,
        "credential" : credential
    };

    //设置当前授权用户
    this._setCurrentUser(user, function () {

        //获取用户信息
        self.getUserInfo(null, function (state, data) {

            if (state === $mob.shareSDK.responseState.Success)
            {
                //设置授权凭证给去的用户信息
                data["credential"] = user["credential"];
                user = data;

                //重新设置当前用户
                self._setCurrentUser(user, null);
            }

            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, user);

        });

    });
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
KaiXin.prototype._setCurrentUser = function (user, callback)
{
    this._currentUser = user;

    var domain = this.cacheDomain();
    $mob.ext.setCacheData("currentUser", this._currentUser, false, domain, function (data) {

        if (callback != null)
        {
            callback ();
        }

    });
};

/**
 * 网页授权
 * @param sessionId     会话标识
 * @param settings      授权设置
 * @private
 */
KaiXin.prototype._webAuthorize = function (sessionId, settings)
{
    var authUrl = "http://api.kaixin001.com/oauth2/authorize?client_id=" + this.apiKey() + "&response_type=token&redirect_uri=" + $mob.utils.urlEncode(this.redirectUri()) + "&oauth_client=1&display=";

    if (settings != null && settings ["scopes"] != null && Object.prototype.toString.apply(settings ["scopes"]) === '[object Array]')
    {
        authUrl += "&scope=" + settings ["scopes"].join("+");
    }
    else if (this._authScopes != null)
    {
        var scopesStr = this._authScopes;
        scopesStr = scopesStr.replace(/,/g,"+");
        authUrl += "&scope=" + scopesStr;
    }
    //打开授权
    $mob.native.ssdk_openAuthUrl(sessionId, authUrl, this.redirectUri());
};

/**
 * 检测应用是否有效
 * @returns {boolean}   true 有效 false 无效
 * @private
 */
KaiXin.prototype._isAvailable = function ()
{
    if (this.apiKey() != null && this.secretKey() != null && this.redirectUri() != null)
    {
        return true;
    }

    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n本地配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};

/**
 * 检测应用信息中的授权信息
 * @param appInfo   应用信息
 * @private
 */
KaiXin.prototype._checkAuthScopes = function (appInfo)
{        
    return appInfo [KaiXinAppInfoKeys.Scopes];
};

/**
 * 检测应用信息有效性
 * @param appInfo   应用信息
 * @private
 */
KaiXin.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var apiKey = $mob.utils.trim(appInfo [KaiXinAppInfoKeys.ApiKey]);
    var secretKey = $mob.utils.trim(appInfo [KaiXinAppInfoKeys.SecretKey]);
    var redirectUri = $mob.utils.trim(appInfo [KaiXinAppInfoKeys.RedirectUri]);

    if (apiKey != null)
    {
        appInfo [KaiXinAppInfoKeys.ApiKey] = apiKey;
    }
    else
    {
        appInfo [KaiXinAppInfoKeys.ApiKey] = this.apiKey();
    }

    if (secretKey != null)
    {
        appInfo [KaiXinAppInfoKeys.SecretKey] = secretKey;
    }
    else
    {
        appInfo [KaiXinAppInfoKeys.SecretKey] = this.secretKey();       
    }

    if (redirectUri != null)
    {
        appInfo [KaiXinAppInfoKeys.RedirectUri] = redirectUri;
    }
    else
    {
        appInfo [KaiXinAppInfoKeys.RedirectUri] = this.redirectUri();    
    }

    return appInfo;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Kaixin, KaiXin);

