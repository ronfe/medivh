//Track data
/**
 * Created by ronfe on 15-5-5.
 */

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
        var point = {
            eventKey: '',
            eventValue: {},
            url: '',
            header: {}
        };

        /**
         * Insert data.
         */
        point.eventKey = pointData.eventKey;
        point.url = window.location.pathname + window.location.hash;
        // EventValue.
        point.eventValue.fromUrl = window.location.pathname + window.location.hash;
        // point.eventValue.preEventKey = simpleStorage.get('lastPoint.eventKey');
        // Header.
        +function () {
            var tempQudao = window.location.search;
            if (tempQudao !== '') {
                tempQudao = tempQudao.match(/(?:q\=).+/)[0].slice(2);
            }
            var q = tempQudao;
            if (q !== undefined || null) {
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
            //simpleStorage.set('lastPoint.eventKey', point.eventKey);
            //simpleStorage.set('lastPoint.url', point.url);

        $.ajax({
            async: false,
            type: 'POST',
            url: 'http://localhost/point/' + window.location.search,
            crossDomain: true,
            dataType: 'json',
            data: {"point": point},
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
            pointData.fromUrl = window.location.href;
            sendPoint(pointData);
        } else {
            // This is other event launched by javascript.
            sendPoint(pointData);
        }
    };
    var document = window.document;
    $(document).ready(function () {
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
    });
    postPoint.buryPoint = buryPoint;
}(jQuery, window);


//q for sharing platform
var createShareUrl = function (q) {
    var url = '';
    switch (q) {
        case 'qq':
            var p = {
                url: location.href,
                desc: '我在洋葱数学预习了' + document.title + '，轻松搞笑，知识讲解秒懂！不怕老师上课提问了～',
                title: '洋葱数学',
                summary: '洋葱数学：科学预习神器',
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
                url: location.href,
                showcount: '0',
                desc: '我在洋葱数学预习了' + document.title + '，轻松搞笑，知识讲解秒懂！不怕老师上课提问了～',
                summary: '洋葱数学：科学预习神器',
                title: '洋葱数学',
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
            url = 'http://service.weibo.com/share/share.php?url=' + window.location.href + '&type=button&ralateUid=5341300586&language=zh_cn&appkey=1623791526&title=' + '我在洋葱数学预习了' + document.title + '，轻松搞笑，知识讲解秒懂！不怕老师上课提问了～' + '&pic=' + $('#video-thumbnail').attr('thumbnail') + '&searchPic=false&style=simple';
            break;
    }
    var win = window.open(url, '_blank');
    win.focus();
    //window.location.href= url + "?backurl="+ window.location.href;
}

if (bowser.android) {
    $('#mobileluodi').removeAttr('style');
    $('#pcluodi').remove();
    $('body').removeClass('pc');
    // $('body').addClass('mobile');
    $('#yangcong-logo').after('<span id="mobile-guide" class="text-inverse">&#x4E0B;&#x8F7D;<span class="download-guide">&#x6D0B;&#x8471;&#x6570;&#x5B66;</span>&#xFF0C;&#x770B;&#x66F4;&#x591A;&#x4F18;&#x8D28;&#x521D;&#x4E2D;&#x89C6;&#x9891;</span></div>');
    $('#footer-url').attr('href', 'http://m.yangcong345.com/api/apk/latest.apk');
    $('#yangcong-logo').attr('src', 'yangcong.png');
}
else if (bowser.ios) {
    $('#mobileluodi').removeAttr('style');
    $('#pcluodi').remove();
    $('body').removeClass('pc');
    // $('body').addClass('mobile');
    $('#yangcong-logo').after('<span id="mobile-guide" class="text-inverse">更多优质视频，请通过电脑访问yangcong345.com</span></div>');
    $('#footer-url').attr('href', 'javascript: void(0)');
    $('#yangcong-logo').attr('src', 'yangcongIos.png');

}
else {
    $('#mobileluodi').remove();
}
