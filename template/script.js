//q for sharing platform
var createShareUrl = function(q){
    var url = ''
    console.log(q);
    switch (q){
        case 'qq':
            url = 'http://connect.qq.com/widget/shareqq/index.html?url=' + window.location.href + '&amp;title=洋葱数学';
            break;
        case 'qzone':
            url = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + window.location.href + '&amp;shoucount=0&amp;title=洋葱数学&amp;summary=洋葱数学';
            break;
        case 'weibo':
            url = 'http://service.weibo.com/share/share.php?url=' + window.location.href + '&amp;type=button&amp;language=zh_cn&amp;appkey=1623791526&amp;searchPic=false&amp;style=simple';
            break;
    }
    window.location.href= url + "?backurl="+ window.location.href;
}

if(bowser.android){
    $('#pcluodi').remove();
    $('body').removeClass('pc');
    // $('body').addClass('mobile');
    $('#yangcong-logo').after('<span id="mobile-guide" class="text-inverse">&#x4E0B;&#x8F7D;&#x6D0B;&#x8471;&#x6570;&#x5B66;&#xFF0C;&#x770B;&#x66F4;&#x591A;&#x4F18;&#x8D28;&#x521D;&#x4E2D;&#x89C6;&#x9891;</span></div>');
    $('#footer-url').attr('href', 'http://m.yangcong345.com/api/apk/latest.apk');
}
else if(bowser.ios){
    $('#pcluodi').remove();
    $('body').removeClass('pc');
    // $('body').addClass('mobile');
    $('#yangcong-logo').after('<span id="mobile-guide" class="text-inverse">更多优质视频，请通过电脑访问yangcong345.com</span></div>');

}
else {
    $('#mobileluodi').remove();
}
