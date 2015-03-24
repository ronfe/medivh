# medivh #

## 依赖 ##

    npm install 
    
    npm install -g gulp

    bower install

## 工作流 ##

    npm start | test // 批量生成html

    gulp debug | release // 前端工程化
具体区别请看 config 文件夹和 gulp.js 文件配置

## 根据html生成jade ##

    cd template

    html2jade seed.html
html2jade会在同目录生成一个 seed.jade 文件。修改后请覆盖 seed1.jade. node会读取 seed1.jade 批量生成 html.
