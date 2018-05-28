/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/28
 * Time: 下午4:04
 * To change this template use File | Settings | File Templates.
 */

/**
 * 分享平台定义
 * @param type      平台类型
 * @constructor
 */
function SharePlatformSchema (type) {}

/**
 * 获取平台类型
 *
 * @return 平台类型
 */
SharePlatformSchema.prototype.type = function () {};

/**
 * 获取平台名称
 *
 * @return 平台名称
 */
SharePlatformSchema.prototype.name = function () {};

/**
 * 设置/获取本地应用配置
 * @param value  应用配置信息
 *
 * @return 应用配置信息
 */
SharePlatformSchema.prototype.localAppInfo = function (value) {};

/**
 * 设置/获取服务器应用配置
 * @param value 应用配置信息
 *
 * @return 应用配置信息
 */
SharePlatformSchema.prototype.serverAppInfo = function (value) {};

/**
 * 用户授权
 * @param sessionId     授权会话标识
 * @param settings      授权设置
 */
SharePlatformSchema.prototype.authorize = function (sessionId, settings) {};

/**
 * 处理用户授权回调
 * @param sessionId     授权会话标识
 * @param callbackUrl   回调地址
 */
SharePlatformSchema.prototype.handleAuthCallback = function (sessionId, callbackUrl) {};

/**
 * 处理添加好友回调
 * @param sessionId     会话标识
 * @param callbackUrl   回调地址
 * @param uid           用户ID
 */
SharePlatformSchema.prototype.handleAddFriendCallback = function (sessionId, callbackUrl, uid) {};

/**
 * 处理SSO授权回调
 * @param sessionId     会话ID
 * @param callbackUrl   回调URL
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
SharePlatformSchema.prototype.handleSSOCallback = function (sessionId, callbackUrl, sourceApplication, annotation) {};

/**
 * 处理分享回调
 * @param sessionId             会话标识
 * @param callbackUrl           回调地址
 * @param sourceApplication     原始应用名称
 * @param annotation            附加数据
 */
SharePlatformSchema.prototype.handleShareCallback = function (sessionId, callbackUrl, sourceApplication, annotation) {};

/**
 * 调用API接口
 * @param url           接口URL
 * @param method        请求方式
 * @param params        请求参数
 * @param callback      方法回调, 回调方法声明如下:function (state, data);
 */
SharePlatformSchema.prototype.callApi = function (url, method, params, callback) {};

/**
 * 取消授权
 */
SharePlatformSchema.prototype.cancelAuthorize = function () {};

/**
 * 获取用户信息
 * @param query         查询信息
 * @param callback      方法回调，回调方法声明如下：function (state, data);
 */
SharePlatformSchema.prototype.getUserInfo = function (query, callback) {};

/**
 * 添加好友
 * @param sessionId     会话标志
 * @param user          用户信息
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
SharePlatformSchema.prototype.addFriend = function (sessionId, user, callback) {};

/**
 * 获取好友列表
 * @param cursor        分页游标
 * @param size          分页尺寸
 * @param callback      方法回调，回调方法声明如下:function (stat, data);
 */
SharePlatformSchema.prototype.getFriends = function (cursor, size, callback) {};

/**
 * 分享内容
 * @param sessionId     会话标识
 * @param parameters    分享参数
 * @param callback      方法回调，回调方法声明如下:function (stat, data, userData);
 */
SharePlatformSchema.prototype.share = function (sessionId, parameters, callback) {};

/**
 * 缓存域名
 */
SharePlatformSchema.prototype.cacheDomain = function () {};

/**
 * 保存配置
 */
SharePlatformSchema.prototype.saveConfig = function () {};

/**
 * 是否支持授权
 */
SharePlatformSchema.prototype.isSupportAuth = function () {};

/**
 * 创建用户信息
 * @param rawData   用户的原始数据
 */
SharePlatformSchema.prototype.createUserByRawData = function (rawData) {};