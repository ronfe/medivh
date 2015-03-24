# medivh #

## 依赖 ##

    npm install 
    
    npm install -g gulp

    bower install

## 工作流 ##

    npm start | test // 批量生成html

    gulp debug | release // 前端工程化
具体区别请看 config 文件夹和 gulp.js 文件配置

***

## 根据 html 生成 jade ##

    cd template

    html2jade seed.html
html2jade会在同目录生成一个 seed.jade 文件。修改后请覆盖 seed1.jade. node会读取 seed1.jade 批量生成 html.

## 配置 nginx（已设好，小心轻动 =。=） ##

    sudo ln -s /home/master/medivh/nginx/videoshare /etc/nginx/sites-enabled/videoshare


## 配置 七牛和DNSPOD（已设好，小心轻动 =。=） ##

    vs1.yangcong345.com CNAME yangcong345.com.

    七牛 bucket - videoshare 镜像源 http://vs1.yangcong345.com | maxAge: 300秒 | 自绑定域名：vs.yangcong345.com
