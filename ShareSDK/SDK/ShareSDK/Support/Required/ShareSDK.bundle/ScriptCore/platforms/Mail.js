/**
 * Created with JetBrains WebStorm.
 * User: fenghj
 * Date: 15/7/27
 * Time: 上午11:26
 * To change this template use File | Settings | File Templates.
 */

var $pluginID = "com.mob.sharesdk.Mail";

/**
 * 邮件信息键名定义
 * @type {{AppKey: string, AppSecret: string, RedirectUri: string}}
 */
var MailInfoKeys = {
    "ConvertUrl"    : "covert_url"
};

/**
 * 邮件微博
 * @param type  平台类型
 * @constructor
 */
function Mail (type)
{
    this._type = type;
    this._appInfo = {};

    //设置当前语言环境
    this._currentLanguage = $mob.shareSDK.preferredLanguageLocalize();
}

/**
 * 获取平台类型
 * @returns {*} 平台类型
 */
Mail.prototype.type = function ()
{
    return this._type;
};

/**
 * 授权状态改变
 * @param sessionId         会话标识
 * @param data              返回数据
 * @private
 */
Mail.prototype.authStateChanged = function (sessionId, data)
{
    $mob.native.ssdk_authStateChanged(sessionId, $mob.shareSDK.responseState.Cancel, null);
};

/**
 * 获取平台名称
 * @returns {string}    平台名称
 */
Mail.prototype.name = function ()
{
    if(this._currentLanguage === "zh-Hans")
    {
        return "邮件";
    }
    else
    {
        return "Mail";
    }

};

/**
 * 获取缓存域名
 * @returns {string}    域名
 */
Mail.prototype.cacheDomain = function ()
{
    return "SSDK-Platform-" + $mob.shareSDK.platformType.Mail;
};

/**
 * 获取是否转换短链
 *
 * @return  true 转换， false 不转换
 */
Mail.prototype.convertUrlEnabled = function ()
{
    if (this._appInfo[MailInfoKeys.ConvertUrl] !== undefined) 
    {
        return this._appInfo[MailInfoKeys.ConvertUrl];
    }

    return $mob.shareSDK.convertUrlEnabled();
};

/**
 * 设置/获取应用信息
 * @param value 应用信息
 * @returns {*}
 */
Mail.prototype.setAppInfo = function (value)
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
Mail.prototype.saveConfig = function ()
{

};

/**
 * 获取是否支持授权
 * @returns {boolean} true 支持， false 不支持
 */
Mail.prototype.isSupportAuth = function ()
{
    return false;
};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
Mail.prototype.authorize = function (sessionId, settings)
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
Mail.prototype.cancelAuthorize = function (callback)
{

};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调
 */
Mail.prototype.getUserInfo = function (query, callback)
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
Mail.prototype.addFriend = function (sessionId, user, callback)
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
Mail.prototype.getFriends = function (cursor, size, callback)
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
Mail.prototype.share = function (sessionId, parameters, callback)
{
    var text = null;
    var origImgs = null;            //原始的图片集合，包含网络图片和本地图片
    var images = null;
    var title = null;
    var attachments = null;
    var recipients = null;
    var cc = null;
    var bcc = null;
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

    $mob.ext.isPluginRegisted("com.mob.sharesdk.connector.mail", function (data) {

        if (data.result)
        {
            text = $mob.shareSDK.getShareParam(self.type(), parameters, "text");
            title = $mob.shareSDK.getShareParam(self.type(), parameters, "title");
            attachments = $mob.shareSDK.getShareParam(self.type(), parameters, "attachments");
            recipients = $mob.shareSDK.getShareParam(self.type(), parameters, "recipients");
            cc = $mob.shareSDK.getShareParam(self.type(), parameters, "cc_recipients");
            bcc = $mob.shareSDK.getShareParam(self.type(), parameters, "bcc_recipients");
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

            self._convertUrl([text], function (data) {

                text = data.result[0];
                self._dealImages(attachments, images, 0, function (attachments) {

                    $mob.ext.ssdk_mailShare(type, text, title, attachments, recipients, cc, bcc, function (data) {

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
                            case $mob.shareSDK.responseState.Cancel:
                            {
                                var resUserData = data["user_data"];
                                if (resUserData != null)
                                {
                                    for (var key in resUserData)
                                    {
                                        if(resUserData.hasOwnProperty(key))
                                        {
                                            userData [key] = resUserData [key];
                                        }
                                    }
                                }
                                break;
                            }
                        }

                        if (callback)
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
Mail.prototype.callApi = function (url, method, params, headers, callback)
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
Mail.prototype.createUserByRawData = function (rawData)
{
    return null;
};


/**
 * 根据分享参数返回分享类型
 * @param parameters            分享参数
 * @private
 */
Mail.prototype._getShareType = function (parameters)
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
Mail.prototype._dealImages = function (attachments, images, index, callback)
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
Mail.prototype._getImagePath = function (url, callback)
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
Mail.prototype._convertUrl = function (contents, callback)
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

//注册平台
$mob.shareSDK.registerPlatformClass($mob.shareSDK.platformType.Mail, Mail);
