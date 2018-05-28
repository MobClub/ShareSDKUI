/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/7/24
 * Time: 下午2:56
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.SMS";

/**
 * 短信信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var SMSInfoKeys = {
    "ConvertUrl"       : "covert_url",
    "OpenCountryList"  : "open_country_list"
};

/**
 * 短信
 * @param type  平台类型
 * @constructor
 */
function SMS (type)
{
    this._type = type;
    this._appInfo = {};
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
SMS.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取沙箱模式
 * @returns {*} true 沙箱服务 false 正式服务
 */
SMS.prototype.openCountryList = function ()
{
    if (this._appInfo[SMSInfoKeys.OpenCountryList] !== undefined) 
    {
        return this._appInfo[SMSInfoKeys.OpenCountryList];
    }

    return false;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
SMS.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
SMS.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "短信";
    }
    else
    {
        return "SMS";
    }
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
SMS.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type()+ "-" + "";
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
SMS.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[SMSInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[SMSInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
SMS.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = this._checkAppInfoAvailable(value);
    }
};

SMS.prototype._checkAppInfoAvailable = function (appInfo)
{
    //过滤
    var openCountryList = appInfo [SMSInfoKeys.OpenCountryList];
    
    if (openCountryList != null)
    {
        appInfo [SMSInfoKeys.OpenCountryList] = openCountryList;
    }
    else
    {
        appInfo [SMSInfoKeys.OpenCountryList] = this.openCountryList();
    }
    return appInfo;
};

/**
 * 保存配置信息
 */
SMS.prototype.saveConfig = function ()
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

            curApps["plat_" + self.type()] = "";
            $mob.ext.setCacheData("currentApp", curApps, false, domain, null);
        }

    });
};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
SMS.prototype.isSupportAuth = function ()
{
    return true;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
SMS.prototype.authorize = function (sessionId, settings)
{
	var self = this;
	$mob.ext.isPluginRegisted("com.mob.sharesdk.connector.sms", function (data) {

        if (data.result)
        {
        	$mob.native.ssdk_plugin_sms_auth(sessionId,self.openCountryList());
        }
        else
        {
            var error_message = null;
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠ShareSDKConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on ShareSDKConnector.framework，please import ShareSDKConnector.framework then try again!";
            }

            var error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "error_message" : error_message
            };

            $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
        }

    });
};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackInfo   回调地址
 */
SMS.prototype.handleAuthCallback = function (sessionId, callbackInfo)
{
	var self = this;
    var credential = {
        "uid"       : callbackInfo["phone"],
        "token"     : callbackInfo["recordId"],
        "expired"   : (new Date().getTime() +  10000 * 1000),
        "raw_data"  : callbackInfo,
        "type" 		: $mob.shareSDK.credentialType.SMS
    };

    var user = {
        "platform_type" : $mob.shareSDK.platformType.SMS,
        "credential" : credential
    };

    // //设置当前授权用户
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
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Success, null);
};

/**
 * 设置当前用户信息
 * @param user      用户信息
 * @param callback  回调方法
 * @private
 */
SMS.prototype._setCurrentUser = function (user, callback)
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
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
SMS.prototype.cancelAuthorize = function (callback)
{
	this._setCurrentUser(null, null);
};

SMS.prototype._getCurrentUser = function (callback)
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
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
SMS.prototype.getUserInfo = function (query, callback)
{
    var self = this;
    self._getCurrentUser(function (user) {
        if(user != null)
        {
            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Success, user);
            }
        }
        else
        {
            if (callback != null)
            {
                var error =
                {
                    "error_code" : $mob.shareSDK.errorCode.UserUnauth,
                    "error_message" : "尚未授权"
                };
                callback ($mob.shareSDK.responseState.Fail, error);
            }
        }
    });
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
SMS.prototype.addFriend = function (sessionId, user, callback)
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
SMS.prototype.getFriends = function (cursor, size, callback)
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
SMS.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var origImgs = null;            //原始的图片集合，包含网络图片和本地图片
    var images = null;
    var title = null;
    var attachments = null;
    var recipients = null;
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

    if (type !== $mob.shareSDK.contentType.Text && type !== $mob.shareSDK.contentType.Image && type !== $mob.shareSDK.contentType.Video)
    {
        var error_message = null;
            
        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "不支持的分享类型[" + type + "]";
        }
        else
        {
            error_message = "unsupported share type [" + type + "]";
        }

        var error = {
            "error_code" : $mob.shareSDK.errorCode.UnsupportContentType,
            "error_message" : error_message
        };

        if (callback != null)
        {
            callback ($mob.shareSDK.responseState.Fail, error, null, userData);
        }
        return;
    }

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.sms", function (data) {

        if (data.result)
        {
            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
            attachments = $mob.shareSDK.getShareParam(self.type(), parameters, "attachments");
            recipients = $mob.shareSDK.getShareParam(self.type(), parameters, "recipients");

            //处理附件信息
            if (type === $mob.shareSDK.contentType.Image)
            {
                origImgs = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                if (Object.prototype.toString.apply(origImgs) === '[object Array]')
                {
                    if (attachments == null)
                    {
                        attachments = [];
                    }

                    images = origImgs;
                }
            }
            else if(type === $mob.shareSDK.contentType.Video)
            {
            	var videoURL = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
                if(attachments == null)
                {
                    attachments = [videoURL];
                }
            }

            self._convertUrl([text], function (data){

                text = data.result[0];
                self._dealImages(attachments, images, 0, function (attachments) {

                    $mob.ext.ssdk_smsShare(type, text, title, attachments, recipients, function (data) {

                        var state = data.state;
                        var resultData = null;
                        switch (state)
                        {
                            case $mob.shareSDK.responseState.Success:
                            {
                                //转换数据
                                resultData = {};
                                resultData["text"] = text;
                                if (origImgs != null)
                                {
                                    resultData["images"] = origImgs;
                                }

                                break;
                            }
                            case $mob.shareSDK.responseState.Fail:
                                resultData = {
                                    "error_code" : data["error_code"],
                                    "error_message" : data["error_message"]
                                };
                                break;
                        }

                        if (callback != null)
                        {
                            callback (state, resultData, null, userData);
                        }

                    });

                });

            });


        }
        else
        {
            var error_message = null;
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠ShareSDKConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on ShareSDKConnector.framework，please import ShareSDKConnector.framework then try again!";
            }

            var error = {
                "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                "error_message" : error_message
            };

            if (callback != null)
            {
                callback ($mob.shareSDK.responseState.Fail, error, null, userData);
            }
        }

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
SMS.prototype.callApi = function (url, method, params, headers, callback)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持该功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support this feature";
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
SMS.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
SMS.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;
    var videoURL = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    if(videoURL != null)
    {
        type = $mob.shareSDK.contentType.Video;
    }
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        type = $mob.shareSDK.contentType.Image;
    }

    return type;
};

/**
 * 处理图片列表，如果存在网络图片则下载到本地，并将所有图片转存到附件列表中。
 * @param attachments           附件列表
 * @param images                图片列表
 * @param index                 图片索引
 * @param callback              回调
 * @private
 */
SMS.prototype._dealImages = function (attachments, images, index, callback)
{
    if (images == null)
    {
        if (callback != null)
        {
            callback (attachments);
        }

        return;
    }

    var self = this;
    if (index < images.length)
    {
        var imageUrl = images [index];
        if (imageUrl != null)
        {
            this._getImagePath(imageUrl, function (url){

                //加入附件列表
                attachments.push(url);

                //进行下一个附件处理
                index ++;
                self._dealImages(attachments, images, index, callback);
            });
        }
        else
        {
            index ++;
            this._dealImages(attachments, images, index, callback);
        }

    }
    else
    {
        if (callback != null)
        {
            callback (attachments);
        }
    }
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
SMS.prototype._getImagePath = function (url, callback)
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
 * 转换链接
 * @param contents      内容列表
 * @param callback      回调
 * @private
 */
SMS.prototype._convertUrl = function (contents, callback)
{
    if (this.convertUrlEnabled())
    {
        $mob.shareSDK.convertUrl(this.type(), null, contents, callback);
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
 * 创建用户信息
 * @param rawData       原始用户数据
 * @returns {null}      用户数据
 */
SMS.prototype.createUserByRawData = function (rawData)
{
    //转换用户数据
    var user = {
        "platform_type" : this.type()
    };
    this._updateUserInfo(user, rawData);
    return $mob.utils.objectToJsonString(user);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.SMS, SMS);