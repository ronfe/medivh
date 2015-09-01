/**
 * Created by libook on 15-1-22.
 */
'use strict';
/**
 * You can use this attribute like these:
 * <element post-point="clickSomething"></element>
 * <element post-point='{"eventKey":"clickSomething","moredata":"somedata"}'></element>
 * <element post-point='[{"eventKey":"clickSomething"},{"eventKey":"enterSomething"}]'></element>
 *
 * The eventKey may start with 'click' or 'enter'.
 * And this attribute can automatically bind event like that.
 *
 * If you need to record other kind of events, you can also use this function with javascript like this:
 * postPoint.buryPoint(element, pointData);
 * And the point will be sent immediately.
 */
var storage = $.sessionStorage;
var postPoint = {};
+function ($, window) {
    /**
     * Generate a Point object with all needed information.
     * @param pointData Some information from HTML attribute, after parsed to JSON.
     * @returns {{}} A point object.
     */
    var initPoint = function (pointData) {
        /**
         * Schema of point.
         */
        var myId;
        if (document.cookie.match(/tmp\.point\.userId/) == null) {
            var tempId = new ObjectId().toString();
            document.cookie = 'tmp.point.userId=' + tempId;
        }
        myId = document.cookie.match(/tmp\.point\.userId\=\w+(?=(;|$))/)[0].split('=')[1];

        if (bowser.android || bowser.ios) {
            var point = {
                eventKey: '',
                eventValue: {},
                url: '',
                header: {
                    userId: myId,
                    downloadOption: simpleStorage.get('downloadOption'),
                    isolatedOption: simpleStorage.get('isolatedOption'),
                    currentName: window.location.pathname
                },
                from: 'mobile'
            };
        }
        else {
            var point = {
                eventKey: '',
                eventValue: {},
                url: '',
                header: {
                    userId: myId
                },
                from: 'pc'
            };
        }

        /**
         * Insert data.
         */
        point.eventKey = pointData.eventKey;
        point.url = window.location.href;
        // EventValue.
        point.eventValue.fromUrl = window.location.pathname + window.location.hash;
        point.eventValue.preEventKey = simpleStorage.get('lastPoint.eventKey');
        // Header.
        +function () {
            var q = simpleStorage.get('q');
            if (q !== undefined) {
                if (point.header === undefined) {
                    point.header = {};
                }
                point.header.q = q;
            }
        }();

        /**
         * Traversal elements of the value of this directive.
         * If there is a same key in {point}, give the value into point.
         * Else put the key-value in the point.eventValue.
         */
        for (var i in pointData) {
            if (point[i] === undefined) {
                point.eventValue[i] = pointData[i];
            } else {
                point[i] = pointData[i];
            }
        }

        /**
         * Delete empty fields.
         */
        for (var i in point) {
            if (point[i] === '') {
                delete point[i];
            }
        }

        return point;
    };

    /**
     * Send point data with Ajax.
     * @param pointData
     */
    var sendPoint = function (pointData) {
        var point = initPoint(pointData);

        /**
         * Save this point as lastPoint in simpleStorage.
         */
        simpleStorage.set('lastPoint.eventKey', point.eventKey);
        simpleStorage.set('lastPoint.url', point.url);

        $.ajax({
            async: false,
            type: 'POST',
            url: 'http://yangcong345.com/point/' + window.location.search,
            dataType: 'json',
            data: {"points": [point]},
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            error: function (XMLHttpRequest, textStatus, err) {
                //console.error(err);
                //console.error(point);
            }
        });
    };

    /**
     * Bind an event to this HTML element.
     * @param pointData
     */
    var buryPoint = function (element, pointData) {
        if (!pointData.eventKey) throw new Error('No EventKey Be Defined');

        /**
         * Automatically bind event on this element.
         */
        if (pointData.eventKey.indexOf('click') === 0) {
            // This is the click event.
            $(element).on('click', function () {
                sendPoint(pointData);
            });
        } else if (pointData.eventKey.indexOf('enter') === 0) {
            // This is the enter event.
            pointData.fromUrl = simpleStorage.get('lastPoint.url');
            sendPoint(pointData);
        } else {
            // This is other event launched by javascript.
            sendPoint(pointData);
        }
    };
    var document = window.document;
    $(document).ready(function () {

        // judge user's query
        if (simpleStorage.get('downloadOption')) {
            if (getUrlParameter('download')) {
                if (!(getUrlParameter('download') === simpleStorage.get('downloadOption'))) {
                    simpleStorage.set('downloadOption', getUrlParameter('download'));

                }
                var downloadOption = simpleStorage.get('downloadOption');
            }
            else {
                var downloadOption = simpleStorage.get('downloadOption');
            }
        }
        else {
            simpleStorage.set('downloadOption', getUrlParameter('download'));
            var downloadOption = getUrlParameter('download') ? getUrlParameter('download') : 'true';
        }

        if (simpleStorage.get('isolatedOption')) {
            if (getUrlParameter('isolate')) {
                if (!(getUrlParameter('isolate') === simpleStorage.get('isolatedOption'))) {
                    simpleStorage.set('isolatedOption', getUrlParameter('isolate'));

                }
                var isolatedOption = simpleStorage.get('isolatedOption');
            }
            else {
                var isolatedOption = simpleStorage.get('isolatedOption');
            }
        }
        else {
            simpleStorage.set('isolatedOption', getUrlParameter('isolate'));
            var isolatedOption = getUrlParameter('isolate') ? getUrlParameter('isolate') : 'true';
        }

        if (downloadOption === 'false') {
            $('.mobile-app-download').remove();
            $('.mobile-app-main-text').text('应用商店搜索 洋葱数学');
        }
        if (isolatedOption === 'true' || !isolatedOption) {
            $('#isolateT').show();
        }
        else {
            $('#isolateF').show();
        }

        $('[post-point]').each(function (index, element) {
            var data = $(element).attr('post-point');

            /**
             * Check if the value is just a string, then use it as eventKey.
             */
            if (new RegExp(/[\{\[]/igm).test(data)) {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    console.error(err.stack);
                    console.error('The JSON string is:' + data);
                }
            } else {
                data = {"eventKey": data};
            }

            if ($.isArray(data)) {
                for (var i in data) {
                    buryPoint(element, data[i]);
                }
            } else {
                buryPoint(element, data);
            }
        });
        postPoint.buryPoint = buryPoint;
        var mobileVideoPlayer = new MediaElementPlayer('#mobile-video', {
            iPadUseNativeControls: false,
            // force iPhone's native controls
            iPhoneUseNativeControls: false,
            // force Android's native controls
            AndroidUseNativeControls: false,
            success: function (vP, dO) {
                vP.addEventListener('play', function () {
                    postPoint.buryPoint('#mobile-video', {"eventKey": "playLandingShareVideo"});
                });
                vP.addEventListener('ended', function () {
                    postPoint.buryPoint('#mobile-video', {"eventKey": "endLandingShareVideo"});
                });
            }
        });
        var videoPlayer = new MediaElementPlayer('#pc-video', {
            iPadUseNativeControls: false,
            // force iPhone's native controls
            iPhoneUseNativeControls: false,
            // force Android's native controls
            AndroidUseNativeControls: false,
            success: function (vP, dO) {
                vP.addEventListener('play', function () {
                    postPoint.buryPoint('#pc-video', {"eventKey": "playLandingShareVideo"});
                });
                vP.addEventListener('ended', function () {
                    postPoint.buryPoint('#pc-video', {"eventKey": "endLandingShareVideo"});
                });
            }
        });
    });
}(jQuery, window);

/**
 * This is for saving 'q' code into simpleStorage.
 */
+function () {
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    var q = getUrlParameter('q');
    var ssQ = simpleStorage.get('q');
    if (q !== undefined) {
        simpleStorage.set('q', q);
    }
    else if (ssQ === undefined) {
        simpleStorage.set('q', 'defaultLanding');
    }
    window.getUrlParameter = getUrlParameter;
}();

/**
 * Created by ronfe on 15-5-5.
 */

//q for sharing platform
var createShareUrl = function (q, videoType, topicDesc) {
    var url = '';
    var templateScript = '';

    if (videoType === 'guide') {
        templateScript = '【' + document.title + '】';
    }
    else if (videoType === 'elementary') {
        templateScript = '【提分秘籍：' + document.title + '】';
    }
    else if (videoType === 'advanced') {
        templateScript = '【进阶必备：' + document.title + '】';
    }
    var qudao = simpleStorage.get('q');
    switch (q) {
        case 'qq':
            var p = {
                url: 'http://' + location.host + location.pathname + '?q=' + qudao,
                desc: templateScript,
                title: '洋葱数学',
                summary: '洋葱数学：让数学更简单',
                pics: $('#video-thumbnail').attr('thumbnail')
            };
            var s = [];
            for (var i in p) {
                s.push(i + '=' + encodeURIComponent(p[i] || ''));
            }
            url = 'http://connect.qq.com/widget/shareqq/index.html?' + s.join('&');

            //url = 'http://connect.qq.com/widget/shareqq/index.html?url=' + window.location.href + '&amp;title=洋葱数学';
            break;
        case 'qzone':
            var p = {
                url: 'http://' + location.host + location.pathname + '?q=' + qudao,
                showcount: '0',
                desc: templateScript + '（分享@洋葱数学）',
                summary: topicDesc,
                title: templateScript,
                pics: $('#video-thumbnail').attr('thumbnail')
            };
            var s = [];
            for (var i in p) {
                s.push(i + '=' + encodeURIComponent(p[i] || ''));
            }
            url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?' + s.join('&');
            //url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + window.location.href + '&amp;shoucount=0&amp;title=洋葱数学&amp;summary=洋葱数学';
            break;
        case 'weibo':
            //url = 'http://service.weibo.com/share/share.php?url=' + window.location.href + '&amp;type=button&amp;language=zh_cn&amp;appkey=1623791526&amp;searchPic=false&amp;style=simple';
            url = 'http://service.weibo.com/share/share.php?url=' + 'http://' + location.host + location.pathname + '?q=' + qudao + '&type=button&ralateUid=5341300586&language=zh_cn&appkey=1623791526&title=' + templateScript + '&pic=' + $('#video-thumbnail').attr('thumbnail') + '&searchPic=false&style=simple';
            break;
    }
    var win = window.open(url, '_blank');
    win.focus();
    //window.location.href= url + "?backurl="+ window.location.href;
};

$('#share-qq').mouseover(function () {
    $('#share-qq img').attr('src', 'qq_hover.png');
});
$('#share-qq').mouseleave(function () {
    $('#share-qq img').attr('src', 'mobile-qq.png');
});
$('#share-qzone').mouseover(function () {
    $('#share-qzone img').attr('src', 'qzone_hover.png');
});
$('#share-qzone').mouseleave(function () {
    $('#share-qzone img').attr('src', 'mobile-qzone.png');
});
$('#share-weibo').mouseover(function () {
    $('#share-weibo img').attr('src', 'weibo_hover.png');
});
$('#share-weibo').mouseleave(function () {
    $('#share-weibo img').attr('src', 'mobile-weibo.png');
});

// Used for mobile users click download app button
var redirectDownloadApp = function () {
    window.location = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.yangcong345.android.phone';
};

// ObjectID generator
if (!document) var document = {cookie: ''}; // fix crashes on node

/**
 * Javascript class that mimics how WCF serializes a object of type MongoDB.Bson.ObjectId
 * and converts between that format and the standard 24 character representation.
 */
var ObjectId = (function () {
    var increment = Math.floor(Math.random() * (16777216));
    var pid = Math.floor(Math.random() * (65536));
    var machine = Math.floor(Math.random() * (16777216));

    var setMachineCookie = function () {
        var cookieList = document.cookie.split('; ');
        for (var i in cookieList) {
            var cookie = cookieList[i].split('=');
            var cookieMachineId = parseInt(cookie[1], 10);
            if (cookie[0] == 'mongoMachineId' && cookieMachineId && cookieMachineId >= 0 && cookieMachineId <= 16777215) {
                machine = cookieMachineId;
                break;
            }
        }
        document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT;path=/';
    };
    if (typeof (localStorage) != 'undefined') {
        try {
            var mongoMachineId = parseInt(localStorage['mongoMachineId']);
            if (mongoMachineId >= 0 && mongoMachineId <= 16777215) {
                machine = Math.floor(localStorage['mongoMachineId']);
            }
            // Just always stick the value in.
            localStorage['mongoMachineId'] = machine;
        } catch (e) {
            setMachineCookie();
        }
    }
    else {
        setMachineCookie();
    }

    function ObjId() {
        if (!(this instanceof ObjectId)) {
            return new ObjectId(arguments[0], arguments[1], arguments[2], arguments[3]).toString();
        }

        if (typeof (arguments[0]) == 'object') {
            this.timestamp = arguments[0].timestamp;
            this.machine = arguments[0].machine;
            this.pid = arguments[0].pid;
            this.increment = arguments[0].increment;
        }
        else if (typeof (arguments[0]) == 'string' && arguments[0].length == 24) {
            this.timestamp = Number('0x' + arguments[0].substr(0, 8)),
                this.machine = Number('0x' + arguments[0].substr(8, 6)),
                this.pid = Number('0x' + arguments[0].substr(14, 4)),
                this.increment = Number('0x' + arguments[0].substr(18, 6))
        }
        else if (arguments.length == 4 && arguments[0] != null) {
            this.timestamp = arguments[0];
            this.machine = arguments[1];
            this.pid = arguments[2];
            this.increment = arguments[3];
        }
        else {
            this.timestamp = Math.floor(new Date().valueOf() / 1000);
            this.machine = machine;
            this.pid = pid;
            this.increment = increment++;
            if (increment > 0xffffff) {
                increment = 0;
            }
        }
    };
    return ObjId;
})();

ObjectId.prototype.getDate = function () {
    return new Date(this.timestamp * 1000);
};

ObjectId.prototype.toArray = function () {
    var strOid = this.toString();
    var array = [];
    var i;
    for (i = 0; i < 12; i++) {
        array[i] = parseInt(strOid.slice(i * 2, i * 2 + 2), 16);
    }
    return array;
};

/**
 * Turns a WCF representation of a BSON ObjectId into a 24 character string representation.
 */
ObjectId.prototype.toString = function () {
    if (this.timestamp === undefined
        || this.machine === undefined
        || this.pid === undefined
        || this.increment === undefined) {
        return 'Invalid ObjectId';
    }

    var timestamp = this.timestamp.toString(16);
    var machine = this.machine.toString(16);
    var pid = this.pid.toString(16);
    var increment = this.increment.toString(16);
    return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
        '000000'.substr(0, 6 - machine.length) + machine +
        '0000'.substr(0, 4 - pid.length) + pid +
        '000000'.substr(0, 6 - increment.length) + increment;
};

if (bowser.android || bowser.ios) {
    $('#pcluodi').remove();
    $('body').removeClass('pc');
    // $('body').addClass('mobile');
    //var qudao = window.location.search.split('=')[1];
    //if (window.location.search[1] === 'q' && qudao) {
    //    var downloadURL = 'http://m.yangcong345.com/api/apk/latest.apk?q=' + qudao;
    //}
    //else {
    //    var downloadURL = 'http://m.yangcong345.com/api/apk/latest.apk';
    //}
    $('#mobileluodi').show();

}
//else if (bowser.ios) {
//    $('#pcluodi').remove();
//    $('body').removeClass('pc');
//    $('#mobileluodi').show();
//    // $('body').addClass('mobile');
//}
else {
    $('#mobileluodi').remove();
    var signUpURL = 'http://yangcong345.com/signup';
    var loginURL = 'http://yangcong345.com/login';
    if (window.location.search[0] === '?') {
        $('#signup').attr('href', signUpURL + window.location.search);
        $('#login').attr('href', loginURL + window.location.search);
    }
    else {
        $('#signup').attr('href', signUpURL);
        $('#login').attr('href', loginURL);
    }
}
