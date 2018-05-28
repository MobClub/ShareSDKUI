/**
 * Created with JetBrains WebStorm.
 * User: vim888
 * Date: 15/2/5
 * Time: 下午2:20
 * To change this template use File | Settings | File Templates.
 */

/**
 * MOB基础类
 */
$mob = function () {};

/**
 * MOB本地调用
 */
$mob.native = function () {};

/**
 * MOB工具类
 */
$mob.utils = function () {};


/**
 * 输出日志信息
 * @param obj   输出对象
 */
$mob.native.log = function (obj){};

/**
 * 发送HTTP请求
 * @param url               请求链接
 * @param method            请求方法
 * @param params            请求参数
 * @param header            请求头
 * @param oauthParams       OAuth参数
 * @param consumerSecret    消费者密钥
 * @param oauthTokenSecret  OAuth令牌密钥
 * @param callback          回调
 */
$mob.native.http = function (url, method, params, header, oauthParams, consumerSecret, oauthTokenSecret, callback) {};

/**
 * 设置本地缓存数据
 * @param name      名称
 * @param value     数据
 * @param secure    是否进行安全加密
 * @param domain    数据域
 * @param callback  回调
 */
$mob.native.setCacheData = function (name, value, secure, domain, callback) {};

/**
 * 获取本地缓存数据
 * @param name      名称
 * @param secure    是否已使用安全加密
 * @param domain    数据域
 * @param callback  回调
 */
$mob.native.getCacheData = function (name, secure, domain, callback) {};

/**
 * 获取应用配置信息
 * @param callback  回调
 */
$mob.native.getAppConfig = function (callback) {};

/**
 * 检测是否允许请求链接
 * @param url       链接
 * @param callback  回调
 */
$mob.native.canOpenURL = function (url, callback) {};

/**
 * 请求链接
 * @param url       链接
 */
$mob.native.openURL = function (url) {};

/**
 * 获取是否支持多任务
 *
 * @param callback  回调
 */
$mob.native.isMultitaskingSupported = function (callback) {};

/**
 * 获取是否为Pad设备
 *
 * @param callback  回调
 */
$mob.native.isPad = function (callback) {};

/**
 * 是否已经连接微信
 *
 * @param pluginKey     插件标识
 * @param callback      回调
 */
$mob.native.isPluginRegisted = function (pluginKey, callback) {};

/**
 * 下载文件
 * @param url           文件链接
 * @param callback      回调
 */
$mob.native.downloadFile = function (url, callback) {};

/**
 * 解析XML
 * @param xmlString     XML字符串
 * @param callback      回调
 */
$mob.native.parseXML = function (xmlString, callback) {};

/**
 * URL编码字符串
 * @param string    原始字符串
 *
 * @return 编码后字符串
 */
$mob.utils.urlEncode = function (string) {};

/**
 * URL解码字符串
 * @param string    编码字符串
 *
 * @return 原始字符串
 */
$mob.utils.urlDecode = function (string) {};

/**
 * 转换对象为JSON字符串
 * @param obj       对象
 *
 * @return JSON字符串
 */
$mob.utils.objectToJsonString = function (obj) {};

/**
 * 转换JSON字符串为对象
 * @param string    对象
 */
$mob.utils.jsonStringToObject = function (string) {};

/**
 * 过滤字符串前后空白字符
 * @param string    原始字符串
 *
 * @return 过滤后字符串
 */
$mob.utils.trim = function (string) {};

/**
 * 解析URL参数
 * @param query     URL的查询字符串
 */
$mob.utils.parseUrlParameters = function (query) {};

/**
 * 解析URL对象
 * @param urlString URL字符串
 */
$mob.utils.parseUrl = function (urlString) {};

/**
 * 进行Base64解码
 * @param string    解码后字符串
 */
$mob.utils.base64Decode = function (string) {};

/**
 * 进行Base64编码
 * @param rawString 原始字符串
 */
$mob.utils.base64Encode =  function (rawString) {};

/**
 * 获取文件名
 * @param filePath  文件路径
 */
$mob.utils.getFileName = function (filePath) {};
