/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/9/17
 * Time: 下午2:15
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.WhatsApp";

/**
 * WhatsApp应用信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var WhatsAppInfoKeys = {
    "ConvertUrl"    : "covert_url"
};

/**
 * WhatsApp
 * @param type  平台类型
 * @constructor
 */
function WhatsApp (type)
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
WhatsApp.prototype.type = function ()
{
    return this._type;
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
WhatsApp.prototype.name = function ()
{
    return "WhatsApp";
};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
WhatsApp.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + this.type();
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
WhatsApp.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[WhatsAppInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[WhatsAppInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
WhatsApp.prototype.setAppInfo = function (value)
{
    if (arguments.length === 0) 
    { 
        return this._appInfo;
    }
    else
    {
        this._appInfo = value;
    }
};

/**
 * 保存配置信息
 */
WhatsApp.prototype.saveConfig = function ()
{

};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
WhatsApp.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
WhatsApp.prototype.authorize = function (sessionId, settings)
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

    var error = {
        "error_code" : $mob.shareSDK.errorCode.UnsupportFeature,
        "error_message" : error_message
    };
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Fail, error);
};

/**
 * 取消授权
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
WhatsApp.prototype.cancelAuthorize = function (callback)
{

};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
WhatsApp.prototype.getUserInfo = function (query, callback)
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
 * 添加好友
 * @param sessionId     会话标识
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
WhatsApp.prototype.addFriend = function (sessionId, user, callback)
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
WhatsApp.prototype.getFriends = function (cursor, size, callback)
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
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param headers       请求头
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
WhatsApp.prototype.callApi = function (url, method, params, headers, callback)
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
WhatsApp.prototype.createUserByRawData = function (rawData)
{
    return null;
};

/**
 * 分享内容
 * @param sessionId         会话ID
 * @param parameters        分享参数
 * @param callback          方法回调，回调方法声明如下:function (state, data, user, userData);
 */
WhatsApp.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var image = null;
    var audio = null;
    var video = null;
    var x = null;
    var error_message;
    var y = null;
    var error = null;
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

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.whatsapp", function (data) {

        if (data.result)
        {
            //检测是否已经安装客户端
            $mob.ext.canOpenURL("whatsapp://", function (data)
            {
                if (data.result)
                {
                    switch (type)
                    {
                        case $mob.shareSDK.contentType.Text:

                            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
                            self._convertUrl([text], function (data)
                            {
                                text = data.result[0];

                                $mob.ext.ssdk_whatsappShareText($mob.utils.urlEncode(text), function (data)
                                {
                                    var resultData = data.result;
                                    if (data.state === $mob.shareSDK.responseState.Success)
                                    {
                                        resultData = {};
                                        resultData["raw_data"] = data.result;
                                        resultData["text"] = text;
                                    }

                                    if (callback != null)
                                    {
                                        callback (data.state, resultData, null, userData);
                                    }
                                });
                            });

                            break;
                        case $mob.shareSDK.contentType.Image:

                            var images = $mob.shareSDK.getShareParam(self.type(), parameters, "images");
                            if (Object.prototype.toString.apply(images) === '[object Array]')
                            {
                                image = images[0];
                            }

                            if (image != null)
                            {
                                self._getImagePath(image, function (imageUrl)
                                {

                                    x = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_x");
                                    y = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_y");


                                    $mob.ext.ssdk_whatsappShareImage(image, x, y, function (data) {

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
                        case $mob.shareSDK.contentType.Audio:

                            audio = $mob.shareSDK.getShareParam(self.type(), parameters, "audio");

                            if (audio != null)
                            {

                                x = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_x");
                                y = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_y");

                                $mob.ext.ssdk_whatsappShareAudio(audio, x, y, function (data) {

                                    var resultData = data.result;
                                    if (data.state === $mob.shareSDK.responseState.Success)
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
                                error_message = null;
                
                                if(this._currentLanguage === "zh-Hans")
                                {
                                    error_message = "分享参数audio不能为空!";
                                }
                                else
                                {
                                    error_message = "share param audio can not be nil!";
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
                        case $mob.shareSDK.contentType.Video:
                            video = $mob.shareSDK.getShareParam(self.type(), parameters, "video");

                            if (video != null)
                            {

                                x = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_x");
                                y = $mob.shareSDK.getShareParam(self.type(), parameters, "menu_display_y");


                                $mob.ext.ssdk_whatsappShareVideo(video, x, y, function (data) {

                                    var resultData = data.result;
                                    if (data.state === $mob.shareSDK.responseState.Success)
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
                                error_message = null;
                
                                if(this._currentLanguage === "zh-Hans")
                                {
                                    error_message = "分享参数video不能为空!";
                                }
                                else
                                {
                                    error_message = "share param video can not be nil!";
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
                        default :

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
                else
                {
                    error_message = null;
 
                    if(this._currentLanguage === "zh-Hans")
                    {
                        error_message = "分享平台［" + self.name() + "］尚未安装客户端，不支持分享!";
                    }
                    else
                    {
                        error_message = "Platform［" + self.name() + "］app client is not installed!";
                    }

                    error = {
                        "error_code" : $mob.shareSDK.errorCode.NotYetInstallClient,
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
                              
            if(this._currentLanguage === "zh-Hans")
            {
                error_message = "平台[" + self.name() + "]需要依靠ShareSDKConnector.framework进行分享，请先导入ShareSDKConnector.framework后再试!";
            }
            else
            {
                error_message = "Platform [" + self.name() + "] depends on ShareSDKConnector.framework，please import ShareSDKConnector.framework then try again!";
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

};

/**
 * 获取图片路径
 * @param url           图片路径
 * @param callback      回调
 * @private
 */
WhatsApp.prototype._getImagePath = function (url, callback)
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
WhatsApp.prototype._convertUrl = function (contents, callback)
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
WhatsApp.prototype._getShareType = function (parameters)
{
    var type = $mob.shareSDK.contentType.Text;

    var images = $mob.shareSDK.getShareParam(this.type(), parameters, "images");
    var audio = $mob.shareSDK.getShareParam(this.type(), parameters, "audio");
    var video = $mob.shareSDK.getShareParam(this.type(), parameters, "video");

    if (Object.prototype.toString.apply(images) === '[object Array]')
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

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
WhatsApp.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.WhatsApp, WhatsApp);
