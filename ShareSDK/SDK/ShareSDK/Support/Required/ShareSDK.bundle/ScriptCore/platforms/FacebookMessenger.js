/**
 * Created
 * User: 刘靖煌
 * Date: 16/1/8
 * Time: 下午5:44
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.FacebookMessenger";

/**
 * Facebook Messenger应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var FacebookMessengerInfoKeys =
{
    "AppKey"        : "api_key",
    "ConvertUrl"    : "covert_url"
};

/**
 * facebook分享内容集合
 * @type {{}}
 */
var FacebookMessengerShareContentSet = {};

/**
 * FacebookMessenger
 * @param type  平台类型
 * @constructor
 */
function FacebookMessenger (type)
{
    this._type = type;
    this._appInfo = {};

    //当前授权用户
    this._currentUser = null;
    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
FacebookMessenger.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
FacebookMessenger.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
FacebookMessenger.prototype.name = function ()
{
    return "FacebookMessenger";
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
FacebookMessenger.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
FacebookMessenger.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[FacebookMessengerInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[FacebookMessengerInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 获取应用标识
 * @returns {*} 应用标识
 */
FacebookMessenger.prototype.appKey = function ()
{
    if (this._appInfo[FacebookMessengerInfoKeys.AppKey] !== undefined) 
    {
        return this._appInfo[FacebookMessengerInfoKeys.AppKey];
    }
    return null;
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
FacebookMessenger.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = value;
    }
    var self = this;
    $mob.ext.getAppConfig(function (data){
        if(data.FacebookAppID != null)
        {
            self._appInfo[FacebookMessengerInfoKeys.AppKey] = data.FacebookAppID;
        }
    });
};

/**
 * 保存配置信息
 */
FacebookMessenger.prototype.saveConfig = function ()
{};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
FacebookMessenger.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
FacebookMessenger.prototype.authorize = function (sessionId, settings)
{
    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持授权功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support authorize!";
    }

    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
FacebookMessenger.prototype.cancelAuthorize = function (callback)
{};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
FacebookMessenger.prototype.getUserInfo = function (query, callback)
{

    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "］不支持获取用户信息功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support getting userInfo!";
    }

    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
FacebookMessenger.prototype.addFriend = function (sessionId, user, callback)
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

    var error =
    {
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
FacebookMessenger.prototype.getFriends = function (cursor, size, callback)
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


    var error =
    {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };

    if (callback != null)
    {
        callback ($mob.shareSDK.responseState.Fail, error);
    }
};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
FacebookMessenger.prototype.callApi = function (url, method, params, headers, callback)
{

    var error_message = null;
    
    if(this._currentLanguage === "zh-Hans")
    {
        error_message = "平台［" + this.name() + "不支持调用API功能!";
    }
    else
    {
        error_message = "Platform［" + this.name() + "］do not support this feature";
    }


    var error =
    {
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
FacebookMessenger.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 检测是否配置URL Scheme
 * @param callback 方法回调
 * @private
 */
FacebookMessenger.prototype._checkUrlScheme = function (callback)
{
    var self = this;
    $mob.ext.getAppConfig(function (data){
        var urlScheme = null;
        var hasReady = false;
        if (data != null && data.CFBundleURLTypes != null)
        {

            for (var i = 0; i < data.CFBundleURLTypes.length; i++)
            {
                var typeObj = data.CFBundleURLTypes [i];
                if (typeObj != null && typeObj.CFBundleURLSchemes != null)
                {
                    for (var j = 0; j < typeObj.CFBundleURLSchemes.length; j++)
                    {
                        var schema = typeObj.CFBundleURLSchemes [j];
                        if (schema === self._callBackURLScheme())
                        {
                            hasReady = true;
                            urlScheme = schema;
                            break;
                        }
                    }
                }

                if (hasReady)
                {
                    break;
                }
            }
        }
        if (!hasReady)
        {
            $mob.native.log("[ShareSDK-WARNING] 尚未配置[" + self.name() + "]URL Scheme:" + self._callBackURLScheme());
        }

        if (callback != null)
        {
            callback (hasReady, urlScheme);
        }
    });
};

//回调地址 scheme
FacebookMessenger.prototype._callBackURLScheme = function()
{
    return 'fb'+this.appKey();
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
FacebookMessenger.prototype.share = function (sessionId, parameters, callback)
{
    var self = this;
    var error = null;
    var error_message = null;
    var flags = parameters != null ? parameters ["@flags"] : null;
    var userData =
    {
        "@flags" : flags
    };
    if(self._canShare())
    {
        //检测是否支持多任务
        $mob.ext.isMultitaskingSupported(function (data){
            if (data.result)
            {
                self._checkUrlScheme(function (hasReady, urlScheme){
                    if (hasReady)
                    {
                        //检测是否已经安装客户端
                        $mob.ext.canOpenURL("fb-messenger://", function (data){
                            if (data.result)
                            {
                                var type = $mob.shareSDK.getShareParam(self.type(),parameters,"type");
                                if(type == null)
                                {
                                    type = $mob.shareSDK.contentType.Auto;
                                }
                                if(type === $mob.shareSDK.contentType.Auto)
                                {
                                    type = self._getShareType(parameters);
                                }
                                switch (type)
                                {
                                    case $mob.shareSDK.contentType.Image:
                                    {
                                        //图片
                                        self._shareImage(sessionId, parameters, userData, callback);
                                        break;
                                    }
                                    case $mob.shareSDK.contentType.FBMessageImages:
                                    {
                                        self._shareImages(sessionId, parameters, userData, callback);
                                        break;
                                    }
                                    case $mob.shareSDK.contentType.Audio:
                                    {
                                        //音频
                                        self._shareAudio(sessionId, parameters, userData, callback);
                                        break;
                                    }
                                    case $mob.shareSDK.contentType.Video:
                                    {
                                        //视频
                                        self._shareVideo(sessionId, parameters, userData, callback);
                                        break; 
                                    }
                                    case $mob.shareSDK.contentType.FBMessageVideo:
                                    {
                                        //相册视频
                                        self._shareAssetVideo(sessionId, parameters, userData, callback);
                                        break;
                                    }
                                    case $mob.shareSDK.contentType.WebPage:
                                    {
                                        //链接
                                        self._shareWebPage(sessionId, parameters, userData, callback);
                                        break;
                                    }
                                    default:
                                    {
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
                            }
                            else
                            {
                                error_message = null;
                                if (this._currentLanguage === "zh-Hans") {
                                    error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持分享!";
                                }
                                else {
                                    error_message = "Platform［" + self.name() + "］app client is not installed!";
                                }

                                error =
                                {
                                    "error_code": $mob.shareSDK.errorCode.NotYetInstallClient,
                                    "error_message": error_message
                                };

                                if (callback != null)
                                {
                                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                                }
                            }
                        });

                    }
                    else
                    {
                        error_message = null;
                        if(self._currentLanguage === "zh-Hans")
                        {
                            error_message = "尚未设置分享平台［" + self.name() + "］的URL Scheme:" + self._callBackURLScheme() + "，无法进行分享!请在项目设置中设置URL Scheme后再试!";
                        }
                        else
                        {
                            error_message = "Can't share because platform［" + self.name() + "］did not set URL Scheme:" + self._callBackURLScheme() + "!Please try again after set URL Scheme!";
                        }
                        //返回错误
                        error = {
                            "error_code" : $mob.shareSDK.errorCode.UnsetURLScheme,
                            "error_message" : error_message
                        };
                        if(callback != null)
                        {
                            callback($mob.shareSDK.responseState.Fail, error, null, userData);
                        }
                    }

                });
            }
            else
            {
                 error = {
                    "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
                    "error_message" : "应用已禁用后台模式，分享平台［" + self.name() + "］无法进行授权! 请在项目设置中开启后台模式后再试!"
                };
                $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
            }
        });
    }
};


/**
 * 判断是否能够进行分享
 * @private
 */
FacebookMessenger.prototype._canShare = function ()
{
    if (this.appKey() != null)
    {
        return true;
    }
    $mob.native.log("[ShareSDK-WARNING] [" + this.name() + "]应用信息有误，不能进行相关操作。请检查本地代码中和服务端的[" + this.name() + "]平台应用配置是否有误! " +
        "\n配置:" + $mob.utils.objectToJsonString(this._appInfo));

    return false;
};


FacebookMessenger.prototype._shareImages = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var error_message;
    var error;
    var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
    if(images != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
            if(data.result)
            {
                $mob.ext.ssdk_facebookmessengerShareImages(self.appKey(), images, function (data){
                    if (data.error_code != null)
                    {
                        //提示错误
                        if (callback != null)
                        {
                            callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                        }
                    }
                    else
                    {
                        //调用成功后不回调，等待客户端回调时再触发
                        //记录分享内容
                        var shareParams = {"platform" : self.type(), "images" : images };
                        FacebookMessengerShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                    }
                });
            }
            else
            {
                error_message = null;
                                  
                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入FacebookConnector.framework后再试!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
        });
    }
    else
    {
        error_message = null;

        if (this._currentLanguage === "zh-Hans") {
            error_message = "分享参数image不能为空!";
        }
        else {
            error_message = "share param image can not be nil!";
        }

        error = {
            "error_code": $mob.shareSDK.errorCode.APIRequestFail,
            "error_message": error_message
        };

        if (callback != null) {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/*
图片分享
*/
FacebookMessenger.prototype._shareImage = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
    var image = null;
    if (Object.prototype.toString.apply(images) === '[object Array]')
    {
        image = images[0];
    }
    var emoticon = $mob.shareSDK.getShareParam(self.type(), parameters, "emoticon_data");
    if(emoticon != null || image != null)
    {
//        $mob.ext.ssdk_isConnectedPlatformSDK("FBSDKMessengerSharer",function(data){
//            if(data.result)
//            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
                    if(data.result)
                     {
                        //有SDK
                        if(emoticon != null)
                        {
                            $mob.ext.ssdk_facebookmessengerShareGif(self.appKey(),emoticon,function(data)
                            {
                                var resultData = data.result;
                                if(data.state === $mob.shareSDK.responseState.Success)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data.result;
                                }

                                if(callback != null)
                                {
                                    callback(data.state,resultData,null,userData);
                                }
                            });
                        }
                        else
                        {
                            if(images.length > 1)
                            {
                                self._shareImages(sessionId, parameters, userData, callback);
                            }
                            else
                            {
                                $mob.ext.ssdk_facebookmessengerShareImage(self.appKey(),image,function(data)
                                {
                                    var resultData = data.result;
                                    if (data.state === $mob.shareSDK.responseState.Success)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data.result;
                                        resultData["images"] = [image];
                                    }

                                    if (callback != null)
                                    {
                                        callback (data.state, resultData, null, userData);
                                    }
                                });
                            }
                        }
                     }
                     else
                     {

                        self._shareWithoutSDK(sessionId, parameters, userData, callback);
                     }
                });

//            }
//            else
//            {
//                self._shareWithoutSDK(sessionId, parameters, userData, callback);
//            }
//        });
    }
    else
    {
        var error_message = null;

        if (this._currentLanguage === "zh-Hans") {
            error_message = "分享参数image或gif不能为空!";
        }
        else {
            error_message = "share param image or gif can not be nil!";
        }

        var error = {
            "error_code": $mob.shareSDK.errorCode.APIRequestFail,
            "error_message": error_message
        };

        if (callback != null) {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

/*
音频文件分享
*/
FacebookMessenger.prototype._shareAudio = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var audio = $mob.shareSDK.getShareParam(self.type(),parameters,"audio");
    if(audio != null)
    {
//        $mob.ext.ssdk_isConnectedPlatformSDK("FBSDKMessengerSharer",function(data){
//            if(data.result)
//            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
                    if(data.result)
                     {
                        //有SDK
                        $mob.ext.ssdk_facebookmessengerShareAudio(self.appKey(),audio,function(data)
                        {
                            var resultData = data.result;
                            if(data.state === $mob.shareSDK.responseState.Success)
                            {
                                resultData = {};
                                resultData["raw_data"] = data.result;
                            }

                            if (callback != null)
                            {
                                callback (data.state, resultData, null, userData);
                            }
                        });
                     }
                     else
                     {
                        self._shareWithoutSDK(sessionId, parameters, userData, callback);
                     }
                });

//            }
//            else
//            {
//                self._shareWithoutSDK(sessionId, parameters, userData, callback);
//            }
//        });
    }
    else
    {
        var error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享参数audio不能为空!";
        }
        else
        {
            error_message = "share param audio can not be nil!";
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
};

/*
相册视频文件分享
*/
FacebookMessenger.prototype._shareAssetVideo = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var video = $mob.shareSDK.getShareParam(self.type(),parameters,"video");
    if(video != null)
    {
        if (!/^(assets-library\:\/)?\//.test(video))
        {
            video = null;
        }
    }
    if(video == null)
    {
        var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
        if(url != null)
        {
            if (/^(assets-library\:\/)?\//.test(url)) 
            {
                video = url;
            }
        }
    }
    if(video != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
            if(data.result)
             {
                $mob.ext.ssdk_facebookmessengerShareAssetVideo(self.appKey(), video,function(data)
                {
                    if (data.error_code != null)
                    {
                        //提示错误
                        if (callback != null)
                        {
                            callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                        }
                    }
                    else
                    {
                        //调用成功后不回调，等待客户端回调时再触发
                        //记录分享内容
                        var shareParams = {"platform" : self.type(), "url" : video };
                        FacebookMessengerShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                    }
                });
             }
             else
             {
                var error_message = null;
                                  
                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入FacebookConnector.framework后再试!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
    }
    else
    {
        var error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享参数video不能为空!";
        }
        else
        {
            error_message = "share param video can not be nil!";
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
};

/*
视频文件分享
*/
FacebookMessenger.prototype._shareVideo = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var video = $mob.shareSDK.getShareParam(self.type(),parameters,"video");
    if(video == null)
    {
        video = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
    }
    if(video != null)
    {
//        $mob.ext.ssdk_isConnectedPlatformSDK("FBSDKMessengerSharer",function(data){
//            if(data.result)
//            {
                $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
                    if(data.result)
                    {
                        //非相册
                        if (!/^(assets-library\:\/)?\//.test(video))
                        {
                            $mob.ext.ssdk_facebookmessengerShareVideo(self.appKey(),video,function(data)
                            {
                                var resultData = data.result;
                                if(data.state === $mob.shareSDK.responseState.Success)
                                {
                                    resultData = {};
                                    resultData["raw_data"] = data.result;
                                }

                                if (callback != null)
                                {
                                    callback (data.state, resultData, null, userData);
                                }
                            });
                        }
                        else
                        {
                            self._shareAssetVideo(sessionId, parameters, userData, callback);
                        }
                     }
                     else
                     {
                        self._shareWithoutSDK(sessionId, parameters, userData, callback);
                     }
                });

//            }
//            else
//            {
//                self._shareWithoutSDK(sessionId, parameters, userData, callback);
//            }
//        });
    }
    else
    {
        var error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享参数video不能为空!";
        }
        else
        {
            error_message = "share param video can not be nil!";
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
};

/*
网络链接分享
*/
FacebookMessenger.prototype._shareWebPage = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var url = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
    if(url != null)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
            if(data.result)
            {
                var desc = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                var title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
                var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                var imageUrl = '';
                if (images != null && Object.prototype.toString.apply(images) === '[object Array]')
                {
                    //取第一张图片进行分享
                    imageUrl = images [0];
                }
                self._convertUrl([desc,url], function (data) {
                    desc = data.result[0];
                    url = data.result[1];
                    $mob.ext.ssdk_facebookmessengerShareWebPage(self.appKey(), url, title, desc, imageUrl, function (data){
                        if (data.error_code != null)
                        {
                            //提示错误
                            if (callback != null)
                            {
                                callback ($mob.shareSDK.responseState.Fail, data, null, userData);
                            }
                        }
                        else
                        {
                            //调用成功后不回调，等待客户端回调时再触发
                            //记录分享内容
                            var shareParams = {"platform" : self.type(), "text" : desc , 'title' : title , 'url' :url ,'images': images};
                            FacebookMessengerShareContentSet[sessionId] = {"content" : shareParams, "user_data" : userData};
                        }
                    });
                });
            }
            else
            {
                var error_message = null;
                                  
                if(self._currentLanguage === "zh-Hans")
                {
                    error_message = "平台[" + self.name() + "]需要依靠FacebookConnector.framework进行分享，请先导入FacebookConnector.framework后再试!";
                }
                else
                {
                    error_message = "Platform [" + self.name() + "] depends on FacebookConnector.framework，please import FacebookConnector.framework then try again!";
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
    }
    else
    {
        var error_message = null;

        if(this._currentLanguage === "zh-Hans")
        {
            error_message = "分享参数url不能为空!";
        }
        else
        {
            error_message = "share param url can not be nil!";
        }

        var error = {
            "error_code": $mob.shareSDK.errorCode.APIRequestFail,
            "error_message": error_message
        };

        if (callback != null) {
            callback($mob.shareSDK.responseState.Fail, error, null, userData);
        }
    }
};

FacebookMessenger.prototype._shareWithoutSDK = function (sessionId, parameters, userData, callback)
{
    var self = this;
    var image = null;
    var emoticon = null;
    var audio = null;
    var video = null;
    var error_message;
    var error;

    var type = $mob.shareSDK.getShareParam(this.type(),parameters,"type");
    if(type == null)
    {
        type = $mob.shareSDK.contentType.Auto;
    }
    if(type === $mob.shareSDK.contentType.Auto)
    {
        type = self._getShareType(parameters);
    }

    var shareData = null;
    var pasteboardType = null;
    switch (type)
    {
        case $mob.shareSDK.contentType.Image:
        {
            //取出image数据
            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");

            if (Object.prototype.toString.apply(images) === '[object Array]') {

                image = images[0];
            }

            emoticon = $mob.shareSDK.getShareParam(self.type(), parameters, "emoticon_data");

            if (image != null || emoticon != null) {
                //gif图片优先
                if (emoticon != null) {
                    shareData = {
                        "contentType": type,
                        "retData": emoticon
                    };

                    var resultData = {};
                    resultData["images"] = [emoticon];

                    pasteboardType = "image";

                    //数据传递给UIPasteboard
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.FacebookMessenger, null, shareData, sessionId, function (data) {

                        if (data.result) {
                            var urlstring = "fb-messenger-platform-20150714://broadcast?pasteboard_type=com.messenger.image&app_id="+self.appKey()+"&version=20150714";

                            $mob.ext.canOpenURL(urlstring, function (data) {
                                if (data.result) {
                                    $mob.native.openURL(urlstring);
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, null);
                                }
                            });
                        }
                    });
                }
                else
                {
                    if(images.length > 1)
                    {
                        self._shareImages(sessionId, parameters, userData, callback);
                    }
                    else
                    {
                        self._getImagePath(image, function (imageUrl) {
                            shareData = {
                                "contentType": type,
                                "retData": imageUrl
                            };

                            pasteboardType = "image";
                            var resultData = {};
                            resultData["images"] = [image];

                            //数据传递给UIPasteboard
                            $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.FacebookMessenger, null, shareData, sessionId, function (data) {

                                if (data.result) {
                                    var urlstring = "fb-messenger-platform-20150714://broadcast?pasteboard_type=com.messenger.image&app_id="+self.appKey()+"&version=20150714";

                                    $mob.ext.canOpenURL(urlstring, function (data) {
                                        if (data.result) {
                                            $mob.native.openURL(urlstring);
                                            $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, null);
                                        }
                                    });
                                }
                            });
                        });
                    }
                }
            }
            else {

                error_message = null;

                if (this._currentLanguage === "zh-Hans") {
                    error_message = "分享参数image或gif不能为空!";
                }
                else {
                    error_message = "share param image or gif can not be nil!";
                }

                error = {
                    "error_code": $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message": error_message
                };

                if (callback != null) {
                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Audio:
        {
            audio = $mob.shareSDK.getShareParam(self.type(), parameters, "audio");
            if (audio != null)
            {
                shareData = {
                    "contentType": type,
                    "retData": audio
                };

                pasteboardType = "audio";

                //数据传递给UIPasteboard
                $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.FacebookMessenger, null, shareData, sessionId, function (data) {

                    if (data.result) {
                        var urlstring = "fb-messenger-platform-20150714://broadcast?pasteboard_type=com.messenger.audio&app_id="+self.appKey()+"&version=20150714";

                        $mob.ext.canOpenURL(urlstring, function (data) {
                            if (data.result) {
                                $mob.native.openURL(urlstring);
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, null, null, null);
                            }
                        });
                    }
                });
            }
            else {
                error_message = null;

                if (this._currentLanguage === "zh-Hans") {
                    error_message = "分享参数audio不能为空!";
                }
                else {
                    error_message = "share param audio can not be nil!";
                }

                error = {
                    "error_code": $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message": error_message
                };

                if (callback != null) {
                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }

            break;
        }
        case $mob.shareSDK.contentType.Video:
        {
            video = $mob.shareSDK.getShareParam(self.type(), parameters, "video");
            if(video == null)
            {
                video = $mob.shareSDK.getShareParam(self.type(), parameters, "url");
            }
            if (video != null) 
            {
                //非相册
                if (!/^(assets-library\:\/)?\//.test(video))
                {
                    shareData = {
                        "contentType": type,
                        "retData": video
                    };

                    pasteboardType = "video";

                    //数据传递给UIPasteboard
                    $mob.ext.ssdk_setDataToPasteboard($mob.shareSDK.platformType.FacebookMessenger, null, shareData, sessionId, function (data) {

                        if (data.result) {
                            var urlstring = "fb-messenger-platform-20150714://broadcast?pasteboard_type=com.messenger." + pasteboardType + "&app_id="+self.appKey()+"&version=20150714";

                            $mob.ext.canOpenURL(urlstring, function (data) {
                                if (data.result) {
                                    $mob.native.openURL(urlstring);
                                    $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, null, null, null);
                                }
                            });
                        }
                    });
                }
                else
                {
                    self._shareAssetVideo(sessionId, parameters, userData, callback);
                }
            }
            else
            {
                error_message = null;

                if (this._currentLanguage === "zh-Hans") {
                    error_message = "分享参数video不能为空!";
                }
                else {
                    error_message = "share param video can not be nil!";
                }

                error = {
                    "error_code": $mob.shareSDK.errorCode.APIRequestFail,
                    "error_message": error_message
                };

                if (callback != null) {
                    callback($mob.shareSDK.responseState.Fail, error, null, userData);
                }
            }
            break;
        }
    }
};

/**
 * 处理分享回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
FacebookMessenger.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation)
{
    var self = this;
    if (callbackUrl.indexOf(self._callBackURLScheme() + "://") === 0)
    {
        $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.facebookmessenger", function (data){
            if(data.result)
             {
                if(FacebookMessengerShareContentSet[sessionId] != null){
                    $mob.ext.ssdk_facebookMessengerHandleShareCalback(self.appKey(), callbackUrl, function (data) {
                        var shareParams = FacebookMessengerShareContentSet [sessionId];
                        var content = {};
                        var userData = null;
                        if (shareParams != null)
                        {
                            content = shareParams ["content"];
                            userData = shareParams ["user_data"];
                        }
                        switch (data.state)
                        {
                            case $mob.shareSDK.responseState.Success:
                            {
                                //转换数据
                                var resultData = {};
                                resultData["raw_data"] = content;
                                if (content["text"] != null)
                                {
                                    resultData["text"] = content["text"];
                                }
                                if (content["title"] != null)
                                {
                                    resultData["title"] = content["title"];
                                }
                                var urls = [];
                                if (content["url"] != null)
                                {
                                    urls.push(content["url"]);
                                }
                                resultData["urls"] = urls;
                                if (content["thumb_image"] != null)
                                {
                                    resultData["images"] = content["thumb_image"];
                                }
                                else if (content ["images"] != null)
                                {
                                    resultData["images"] = content["images"];
                                }
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Success, resultData, null, userData);
                                break;
                            }
                            case $mob.shareSDK.responseState.Fail:
                                var error_message_text = '';
                                if(data.error_message != null)
                                {
                                    error_message_text = data.error_message;
                                }
                                else if(data.error_description != null)
                                {
                                    error_message_text = data.error_description;
                                }
                                //失败
                                var error = {
                                    "error_code" : $mob.shareSDK.errorCode.APIRequestFail,
                                    "user_data" :  {"error_code" : data.error_code , "error_message" : error_message_text}
                                };
                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error, null, userData);
                                break;
                            default :
                                //取消

                                $mob.native.ssdk_shareStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null, null, userData);
                                break;
                        }

                        //移除分享参数集合中的数据
                        delete FacebookMessengerShareContentSet[sessionId];
                    
                    });
                }
             }
        });
        return true;
    }
    return false;
};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
FacebookMessenger.prototype._getImagePath = function (url, callback)
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
FacebookMessenger.prototype._convertUrl = function (contents, callback)
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
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
FacebookMessenger.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var url = $mob.shareSDK.getShareParam(this.type(), parameters, "url");
    var title = $mob.shareSDK.getShareParam(this.type(), parameters, "title");
    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var gif =  $mob.shareSDK.getShareParam(this.type(), parameters, "emoticon_data");
    var audio = $mob.shareSDK.getShareParam(this.type(), parameters, "audio");
    var video = $mob.shareSDK.getShareParam(this.type(), parameters, "video");
    if (title != null && url != null)
    {
        type = $mob.shareSDK.contentType.WebPage;
    }
    else if (Object.prototype.toString.apply(images) === '[object Array]' || gif != null)
    {
        type = $mob.shareSDK.contentType.Image;
    }
    else if (audio != null)
    {
        type = $mob.shareSDK.contentType.Audio;
    }
    else if (video != null)
    {
        type = $mob.shareSDK.contentType.Video;
    }

    return type;
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.FacebookMessenger, FacebookMessenger);
